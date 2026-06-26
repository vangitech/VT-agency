import EmailSequence from '../models/EmailSequence.js';
import AutomationRule from '../models/AutomationRule.js';
import LeadScore from '../models/LeadScore.js';
import Contact from '../models/Contact.js';
import DealActivity from '../models/DealActivity.js';

export const getSequences = async (req, res) => {
  try {
    const sequences = await EmailSequence.find().sort({ createdAt: -1 });
    res.json(sequences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSequence = async (req, res) => {
  try {
    const seq = await EmailSequence.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(seq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSequence = async (req, res) => {
  try {
    const seq = await EmailSequence.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!seq) return res.status(404).json({ message: 'Sequence not found' });
    res.json(seq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSequence = async (req, res) => {
  try {
    await EmailSequence.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sequence deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRules = async (req, res) => {
  try {
    const rules = await AutomationRule.find()
      .populate('createdBy', 'name email')
      .sort({ priority: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRule = async (req, res) => {
  try {
    const rule = await AutomationRule.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    await AutomationRule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeadScores = async (req, res) => {
  try {
    const { page = 1, limit = 50, level } = req.query;
    const filter = {};
    if (level) filter.level = level;
    const total = await LeadScore.countDocuments(filter);
    const scores = await LeadScore.find(filter)
      .populate('contact', 'name email phone company')
      .sort({ score: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ scores, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recalculateScore = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    const [emailOpens, emailClicks, interactions, deals] = await Promise.all([
      DealActivity.countDocuments({ assignedTo: contact._id, type: 'email', status: 'completed' }),
      DealActivity.countDocuments({ assignedTo: contact._id, type: 'email' }),
      Interaction.countDocuments({ contact: contact._id }),
      Deal.find({ contact: contact._id }),
    ]);

    const totalDealValue = deals.reduce((s, d) => s + d.value, 0);
    const daysSinceContact = Math.round((Date.now() - new Date(contact.createdAt)) / (1000 * 60 * 60 * 24));

    let score = 0;
    score += emailOpens * 5;
    score += emailClicks * 10;
    score += interactions * 3;
    score += Math.min(totalDealValue / 100, 50);
    if (daysSinceContact < 7) score += 20;
    else if (daysSinceContact < 30) score += 10;
    else if (daysSinceContact < 90) score += 5;

    const level = score >= 80 ? 'hot' : score >= 40 ? 'warm' : 'cold';

    const leadScore = await LeadScore.findOneAndUpdate(
      { contact: contact._id },
      {
        contact: contact._id,
        score,
        level,
        factors: {
          emailOpens, emailClicks, websiteVisits: 0,
          formSubmissions: interactions, dealValue: totalDealValue,
          timeSinceContact: daysSinceContact,
        },
        lastUpdated: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(leadScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScoringStats = async (req, res) => {
  try {
    const [hot, warm, cold, total] = await Promise.all([
      LeadScore.countDocuments({ level: 'hot' }),
      LeadScore.countDocuments({ level: 'warm' }),
      LeadScore.countDocuments({ level: 'cold' }),
      LeadScore.countDocuments(),
    ]);
    res.json({ hot, warm, cold, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
