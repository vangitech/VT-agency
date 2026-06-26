import Timesheet from '../models/Timesheet.js';

export const getEntries = async (req, res) => {
  try {
    const { user, project, deal, start, end, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (project) filter.project = project;
    if (deal) filter.deal = deal;
    if (start && end) {
      filter.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const total = await Timesheet.countDocuments(filter);
    const entries = await Timesheet.find(filter)
      .populate('user', 'name email')
      .populate('project', 'name clientName')
      .populate('deal', 'title')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ entries, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEntry = async (req, res) => {
  try {
    const entry = await Timesheet.create({ ...req.body, user: req.body.user || req.user._id });
    const project = await entry.populate('project', 'name clientName');
    if (project && entry.billable) {
      await Timesheet.findByIdAndUpdate(entry._id, { hourlyRate: req.body.hourlyRate || 0 });
    }
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const entry = await Timesheet.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
      .populate('user', 'name email')
      .populate('project', 'name clientName');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    await Timesheet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTimesheetStats = async (req, res) => {
  try {
    const { start, end, user } = req.query;
    const match = {};
    if (start && end) match.date = { $gte: new Date(start), $lte: new Date(end) };
    if (user) match.user = user;

    const stats = await Timesheet.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          billableHours: { $sum: { $cond: ['$billable', '$hours', 0] } },
          entries: { $sum: 1 },
        },
      },
    ]);
    const byUser = await Timesheet.aggregate([
      { $match: match },
      { $group: { _id: '$user', hours: { $sum: '$hours' }, entries: { $sum: 1 } } },
      { $sort: { hours: -1 } },
      { $limit: 10 },
    ]);
    const byProject = await Timesheet.aggregate([
      { $match: match },
      { $group: { _id: '$project', hours: { $sum: '$hours' }, billable: { $sum: { $cond: ['$billable', '$hours', 0] } } } },
      { $sort: { hours: -1 } },
      { $limit: 10 },
    ]);
    res.json({
      stats: stats[0] || { totalHours: 0, billableHours: 0, entries: 0 },
      byUser: byUser || [],
      byProject: byProject || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
