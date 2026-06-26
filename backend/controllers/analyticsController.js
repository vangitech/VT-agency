import Deal from '../models/Deal.js';
import Contact from '../models/Contact.js';
import Project from '../models/Project.js';
import Timesheet from '../models/Timesheet.js';
import Expense from '../models/Expense.js';
import Interaction from '../models/Interaction.js';
import ContactMessage from '../models/ContactMessage.js';

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalDeals, wonDeals, lostDeals, pipelineValue, totalProjects,
      activeProjects, totalHours, totalExpenses, totalContacts,
      newContactsThisMonth, messagesUnread, mrrResult, recentInteractions,
    ] = await Promise.all([
      Deal.countDocuments(),
      Deal.countDocuments({ stage: { $in: ['Closed Won', 'closed_won'] } }),
      Deal.countDocuments({ stage: { $in: ['Closed Lost', 'closed_lost'] } }),
      Deal.aggregate([
        { $match: { stage: { $nin: ['Closed Lost', 'closed_lost', 'Closed Won', 'closed_won'] } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } } } },
      ]),
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['onboarding', 'in_progress'] } }),
      Timesheet.aggregate([
        { $match: { date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Contact.countDocuments(),
      Contact.countDocuments({ createdAt: { $gte: monthStart } }),
      ContactMessage.countDocuments({ read: false }),
      Deal.aggregate([
        { $match: { stage: { $in: ['Closed Won', 'closed_won'] }, closedAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
      Interaction.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const activeDeals = totalDeals - wonDeals - lostDeals;
    const mrr = Math.round(mrrResult[0]?.total || 0);
    const totalDecided = wonDeals + lostDeals;
    const winRate = totalDecided > 0 ? Math.round((wonDeals / totalDecided) * 100) : 0;

    const recentActivity = (recentInteractions || []).map((i) => ({
      type: i.type === 'email' ? 'deal' : i.type === 'note' ? 'project' : 'contact',
      description: i.subject || i.description || 'Interaction',
      date: i.createdAt,
    }));

    res.json({
      kpis: {
        totalDeals, wonDeals, activeDeals, lostDeals,
        pipelineValue: Math.round(pipelineValue[0]?.total || 0),
        totalProjects, activeProjects,
        hoursThisMonth: Math.round(totalHours[0]?.total || 0),
        expensesThisMonth: Math.round(totalExpenses[0]?.total || 0),
        totalContacts, newContactsThisMonth, messagesUnread,
        mrr, winRate,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const wonDeals = await Deal.find({
      stage: { $in: ['Closed Won', 'closed_won'] },
      closedAt: { $exists: true },
    }).sort({ closedAt: -1 });

    const monthlyRevenue = await Deal.aggregate([
      { $match: { stage: { $in: ['Closed Won', 'closed_won'] }, closedAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$closedAt' } },
          revenue: { $sum: '$value' },
          deals: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const thisMonth = new Date();
    const prevMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const thisMonthRevenue = await Deal.aggregate([
      { $match: { stage: 'Closed Won', closedAt: { $gte: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const prevMonthRevenue = await Deal.aggregate([
      { $match: { stage: 'Closed Won', closedAt: { $gte: prevMonth, $lt: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);

    const mrr = thisMonthRevenue[0]?.total || 0;
    const prevMrr = prevMonthRevenue[0]?.total || 0;

    res.json({
      monthlyRevenue: monthlyRevenue || [],
      totalRevenue: wonDeals.reduce((s, d) => s + d.value, 0),
      mrr: Math.round(mrr),
      mrrGrowth: prevMrr > 0 ? Math.round(((mrr - prevMrr) / prevMrr) * 100) : 0,
      dealCount: wonDeals.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityReport = async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    const dateFilter = {};
    if (start && end) {
      dateFilter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const interactions = await Interaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { type: '$type', user: '$createdBy' },
          count: { $sum: 1 },
        },
      },
    ]);

    const topPerformers = await Interaction.aggregate([
      { $match: { ...dateFilter, type: { $in: ['email', 'call'] } } },
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      byType: interactions || [],
      topPerformers: topPerformers || [],
      total: interactions.reduce((s, i) => s + i.count, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttributionReport = async (req, res) => {
  try {
    const bySource = await Deal.aggregate([
      { $match: { source: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          value: { $sum: '$value' },
          won: { $sum: { $cond: [{ $in: ['$stage', ['Closed Won', 'closed_won']] }, 1, 0] } },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const totalDeals = await Deal.countDocuments();
    const totalWon = await Deal.countDocuments({ stage: { $in: ['Closed Won', 'closed_won'] } });

    res.json({
      bySource: bySource || [],
      totalDeals,
      totalWon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWinLossReport = async (req, res) => {
  try {
    const byReason = await Deal.aggregate([
      { $match: { stage: { $in: ['Closed Lost', 'closed_lost'] }, lostReason: { $exists: true, $ne: '' } } },
      { $group: { _id: '$lostReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalWon = await Deal.countDocuments({ stage: { $in: ['Closed Won', 'closed_won'] } });
    const totalLost = await Deal.countDocuments({ stage: { $in: ['Closed Lost', 'closed_lost'] } });
    const total = totalWon + totalLost;
    const winRate = total > 0 ? Math.round((totalWon / total) * 100) : 0;

    res.json({
      winRate,
      totalWon,
      totalLost,
      byLostReason: byReason || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesVelocity = async (req, res) => {
  try {
    const wonDeals = await Deal.find({
      stage: { $in: ['Closed Won', 'closed_won'] },
      createdAt: { $exists: true },
      closedAt: { $exists: true },
    });

    const totalDays = wonDeals.reduce((s, d) => {
      return s + Math.round((new Date(d.closedAt) - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
    }, 0);
    const avgCycleDays = wonDeals.length > 0 ? Math.round(totalDays / wonDeals.length) : 0;

    const monthlyDeals = await Deal.aggregate([
      { $match: { stage: { $in: ['Closed Won', 'closed_won'] }, closedAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$closedAt' } },
          count: { $sum: 1 },
          value: { $sum: '$value' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 3 },
    ]);

    const avgMonthlyDeals = monthlyDeals.length > 0
      ? Math.round(monthlyDeals.reduce((s, m) => s + m.count, 0) / monthlyDeals.length)
      : 0;

    res.json({
      avgCycleDays,
      avgMonthlyDeals,
      velocityScore: avgCycleDays > 0 ? Math.round((avgMonthlyDeals * 100) / avgCycleDays) : 0,
      monthlyHistory: monthlyDeals || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
