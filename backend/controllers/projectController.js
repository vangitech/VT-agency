import Project from '../models/Project.js';
import Timesheet from '../models/Timesheet.js';
import Expense from '../models/Expense.js';
import Interaction from '../models/Interaction.js';

export const getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
      ];
    }
    const projects = await Project.find(filter)
      .populate('deal', 'title value stage')
      .populate('lead', 'name email')
      .populate('team', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('deal', 'title value stage')
      .populate('lead', 'name email')
      .populate('team', 'name email')
      .populate('createdBy', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const hours = await Timesheet.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: null, total: { $sum: '$hours' }, billable: { $sum: { $cond: ['$billable', '$hours', 0] } } } },
    ]);
    const expenses = await Expense.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({
      project,
      totalHours: hours[0]?.total || 0,
      billableHours: hours[0]?.billable || 0,
      totalExpenses: expenses[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
      .populate('deal', 'title value stage')
      .populate('lead', 'name email')
      .populate('team', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await Timesheet.deleteMany({ project: req.params.id });
    await Expense.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOnboarding = async (req, res) => {
  try {
    const { checklistId, completed } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const item = project.onboardingChecklist.id(checklistId);
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });
    item.completed = completed;
    item.completedAt = completed ? new Date() : null;
    item.completedBy = completed ? req.user._id : null;
    await project.save();
    const allDone = project.onboardingChecklist.every((i) => i.completed);
    if (allDone && project.status === 'onboarding') {
      project.status = 'in_progress';
      await project.save();
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectStats = async (req, res) => {
  try {
    const [total, active, completed, hours] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['onboarding', 'in_progress'] } }),
      Project.countDocuments({ status: 'completed' }),
      Timesheet.aggregate([{ $group: { _id: null, total: { $sum: '$hours' } } }]),
    ]);
    res.json({ total, active, completed, totalHours: hours[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
