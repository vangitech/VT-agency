import Expense from '../models/Expense.js';

export const getExpenses = async (req, res) => {
  try {
    const { project, deal, category, start, end, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (deal) filter.deal = deal;
    if (category) filter.category = category;
    if (start && end) filter.date = { $gte: new Date(start), $lte: new Date(end) };
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .populate('project', 'name clientName')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ expenses, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, submittedBy: req.user._id });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { approvedBy: req.user._id, approvedAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseStats = async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const total = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' }, billable: { $sum: { $cond: ['$billable', '$amount', 0] } } } },
    ]);
    res.json({
      byCategory: stats || [],
      totalAmount: total[0]?.total || 0,
      billableAmount: total[0]?.billable || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
