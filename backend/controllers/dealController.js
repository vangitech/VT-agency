import Deal from '../models/Deal.js';
import DealActivity from '../models/DealActivity.js';
import Project from '../models/Project.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';

export const getDeals = async (req, res) => {
  try {
    const { stage, pipeline, owner, search } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;
    if (pipeline) filter.pipeline = pipeline;
    if (owner) filter.owner = owner;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { 'contact.name': { $regex: search, $options: 'i' } },
      ];
    }
    const deals = await Deal.find(filter)
      .populate('contact', 'name email phone company')
      .populate('owner', 'name email')
      .sort({ order: 1, createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contact', 'name email phone company')
      .populate('owner', 'name email');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    const activities = await DealActivity.find({ deal: deal._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ deal, activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, owner: req.body.owner || req.user._id });
    if (deal.contact) {
      await Interaction.create({
        contact: deal.contact,
        type: 'deal',
        subject: `Deal Created: ${deal.title}`,
        description: `Value: ${deal.currency} ${deal.value} | Stage: ${deal.stage}`,
        metadata: { dealId: deal._id, value: deal.value, stage: deal.stage },
      });
    }
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const old = await Deal.findById(req.params.id);
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
      .populate('contact', 'name email phone company')
      .populate('owner', 'name email');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    if (req.body.stage && old && req.body.stage !== old.stage) {
      await DealActivity.create({
        deal: deal._id, type: 'note', subject: 'Stage Changed',
        description: `Moved from "${old.stage}" to "${req.body.stage}"`,
        createdBy: req.user._id,
      });
      if (req.body.stage === 'Closed Won' || req.body.stage === 'closed_won') {
        deal.closedAt = new Date();
        await deal.save();
        const project = await Project.create({
          name: deal.title,
          deal: deal._id,
          contact: deal.contact,
          clientName: deal.company || deal.contact?.name,
          clientEmail: deal.email || deal.contact?.email,
          clientPhone: deal.phone || deal.contact?.phone,
          status: 'onboarding',
          startDate: new Date(),
          lead: deal.owner,
          createdBy: req.user._id,
          onboardingChecklist: [
            { task: 'Kickoff meeting scheduled' },
            { task: 'Scope of work confirmed' },
            { task: 'Team assigned' },
            { task: 'Access credentials shared' },
            { task: 'Project timeline created' },
          ],
        });
        if (deal.contact) {
          await Interaction.create({
            contact: deal.contact, type: 'deal',
            subject: `Deal Won: ${deal.title}`,
            description: `Project created: ${project.name}`,
            metadata: { dealId: deal._id, projectId: project._id },
          });
        }
      }
      if ((req.body.stage === 'Closed Lost' || req.body.stage === 'closed_lost') && deal.contact) {
        await Interaction.create({
          contact: deal.contact, type: 'deal',
          subject: `Deal Lost: ${deal.title}`,
          description: req.body.lostReason || 'No reason provided',
          metadata: { dealId: deal._id },
        });
      }
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    await DealActivity.deleteMany({ deal: req.params.id });
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reorderDeals = async (req, res) => {
  try {
    const { deals } = req.body;
    for (const item of deals) {
      await Deal.findByIdAndUpdate(item._id, { order: item.order, stage: item.stage });
    }
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPipelineStats = async (req, res) => {
  try {
    const stages = await Deal.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]);
    const totalValue = await Deal.aggregate([
      { $match: { stage: { $nin: ['Closed Lost', 'closed_lost'] } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } } } },
    ]);
    const wonValue = await Deal.aggregate([
      { $match: { stage: { $in: ['Closed Won', 'closed_won'] } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const byOwner = await Deal.aggregate([
      { $group: { _id: '$owner', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]);
    res.json({
      stages: stages || [],
      weightedForecast: totalValue[0]?.total || 0,
      wonValue: wonValue[0]?.total || 0,
      byOwner: byOwner || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { deal, status } = req.query;
    const filter = {};
    if (deal) filter.deal = deal;
    if (status) filter.status = status;
    const activities = await DealActivity.find(filter)
      .populate('deal', 'title stage value')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const activity = await DealActivity.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const activity = await DealActivity.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    await DealActivity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getForecast = async (req, res) => {
  try {
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);

    const openDeals = await Deal.find({
      stage: { $nin: ['Closed Won', 'closed_won', 'Closed Lost', 'closed_lost'] },
      expectedCloseDate: { $gte: quarterStart, $lte: quarterEnd },
    }).populate('owner', 'name email');

    const weightedValue = openDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
    const totalValue = openDeals.reduce((sum, d) => sum + d.value, 0);

    const monthlyData = await Deal.aggregate([
      { $match: { expectedCloseDate: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$expectedCloseDate' } },
          total: { $sum: '$value' },
          weighted: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.json({
      openDeals,
      totalPipeline: totalValue,
      weightedForecast: Math.round(weightedValue),
      dealCount: openDeals.length,
      monthlyData: monthlyData || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
