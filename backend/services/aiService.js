import Deal from '../models/Deal.js';
import Contact from '../models/Contact.js';
import LeadScore from '../models/LeadScore.js';
import DealActivity from '../models/DealActivity.js';
import Interaction from '../models/Interaction.js';

export async function getNextBestActions(userId) {
  const suggestions = [];

  const overdueTasks = await DealActivity.find({
    assignedTo: userId,
    status: 'pending',
    dueDate: { $lte: new Date() },
  }).populate('deal', 'title stage value').limit(5);

  for (const task of overdueTasks) {
    suggestions.push({
      type: 'task',
      priority: 'high',
      title: `Complete: ${task.subject}`,
      description: `Overdue task for deal "${task.deal?.title || 'Unknown'}" (${task.deal?.stage || ''})`,
      action: 'View Task',
      link: `/admin/crm?tab=deals&deal=${task.deal?._id}`,
      reason: `${Math.abs(Math.round((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)))} days overdue`,
    });
  }

  const hotLeads = await LeadScore.find({ level: 'hot' })
    .populate('contact', 'name email phone company')
    .sort({ score: -1 })
    .limit(3);

  for (const ls of hotLeads) {
    if (ls.contact) {
      suggestions.push({
        type: 'lead',
        priority: 'high',
        title: `Follow up with ${ls.contact.name}`,
        description: `Hot lead (score: ${ls.score}) from ${ls.contact.company || 'Unknown'}`,
        action: 'View Contact',
        link: `/admin/crm?tab=contacts&contact=${ls.contact._id}`,
        reason: 'High engagement — prioritize this lead',
      });
    }
  }

  const staleDeals = await Deal.find({
    owner: userId,
    stage: { $nin: ['Closed Won', 'Closed Lost', 'closed_won', 'closed_lost'] },
    updatedAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  }).limit(5);

  for (const deal of staleDeals) {
    suggestions.push({
      type: 'deal',
      priority: 'medium',
      title: `Re-engage: ${deal.title}`,
      description: `Deal ($${deal.value}) has been idle for ${Math.round((Date.now() - new Date(deal.updatedAt)) / (1000 * 60 * 60 * 24))} days`,
      action: 'View Deal',
      link: `/admin/crm?tab=deals&deal=${deal._id}`,
      reason: 'No activity in over a week — risk of losing momentum',
    });
  }

  const contactsWithoutScore = await Contact.countDocuments({
    _id: { $nin: await LeadScore.distinct('contact') },
    createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (contactsWithoutScore > 0) {
    suggestions.push({
      type: 'system',
      priority: 'medium',
      title: `Score ${contactsWithoutScore} unscored contacts`,
      description: 'Contacts without lead scores may be missing opportunities',
      action: 'Recalculate All',
      link: `/admin/crm?tab=workflows`,
      reason: 'Incomplete lead scoring data',
    });
  }

  const dealsWithoutNextStep = await Deal.countDocuments({
    owner: userId,
    stage: { $nin: ['Closed Won', 'Closed Lost', 'closed_won', 'closed_lost'] },
    _id: { $nin: await DealActivity.distinct('deal', { status: 'pending' }) },
  });

  if (dealsWithoutNextStep > 0) {
    suggestions.push({
      type: 'deal',
      priority: 'medium',
      title: `${dealsWithoutNextStep} deals have no next step`,
      description: 'Add tasks or activities to move these deals forward',
      action: 'View Deals',
      link: `/admin/crm?tab=deals`,
      reason: 'Deals without defined next steps stall',
    });
  }

  return suggestions.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

export async function generateReply(emailBody, context) {
  const templates = [];

  if (!emailBody) {
    templates.push(
      `Thank you for reaching out. I'd be happy to help with your inquiry. Could you provide a bit more detail about what you're looking for so I can assist you better?\n\nBest regards,\n${context.userName || 'Team'}`
    );
    return templates;
  }

  const lower = emailBody.toLowerCase();

  if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('pricing') || lower.includes('how much')) {
    templates.push(
      `Thank you for your interest in our services. I'd be happy to provide you with a customized quote based on your specific requirements.\n\nCould you please share more details about the scope of work you need? This will help me prepare an accurate estimate.\n\nIn the meantime, here's a brief overview of our pricing structure:\n- Initial consultation: Complimentary\n- Custom development projects: Starting from $5,000\n- Monthly retainers: Available upon request\n\nWould you be available for a quick call this week to discuss further?\n\nBest regards,\n${context.userName || 'Team'}`
    );
  }

  if (lower.includes('demo') || lower.includes('see how') || lower.includes('show me') || lower.includes('walkthrough')) {
    templates.push(
      `I'd be delighted to show you how our solutions can meet your needs. I can schedule a personalized demo at your convenience.\n\nOur demos typically run 30-45 minutes and cover:\n- Overview of our platform/capabilities\n- Live walkthrough tailored to your industry\n- Q&A session\n\nPlease let me know what time works best for you this week. I have availability:\n- Monday: 10am - 4pm EST\n- Wednesday: 9am - 3pm EST\n- Friday: 10am - 12pm EST\n\nLooking forward to showing you around!\n\nBest regards,\n${context.userName || 'Team'}`
    );
  }

  if (lower.includes('meeting') || lower.includes('schedule') || lower.includes('call') || lower.includes('book')) {
    templates.push(
      `Thank you for reaching out. I'd be happy to schedule a meeting to discuss your needs.\n\nHere's a link to my calendar where you can pick a time that works best for you: [Insert Calendar Link]\n\nAlternatively, let me know your preferred time and I'll send an invitation.\n\nLooking forward to connecting!\n\nBest regards,\n${context.userName || 'Team'}`
    );
  }

  if (lower.includes('thank') || lower.includes('appreciate') || lower.includes('grateful')) {
    templates.push(
      `You're very welcome! It was my pleasure to assist you.\n\nIf you have any more questions or need further assistance, please don't hesitate to reach out. We're here to help!\n\nBest regards,\n${context.userName || 'Team'}`
    );
  }

  if (lower.includes('follow') || lower.includes('check in') || lower.includes('update')) {
    templates.push(
      `Thank you for following up. I wanted to check in and see if you had any questions about what we discussed previously.\n\nWe're ready to move forward whenever you are. Is there anything else I can clarify or provide to help with your decision?\n\nBest regards,\n${context.userName || 'Team'}`
    );
  }

  templates.push(
    `Thank you for your message. I've reviewed your inquiry and wanted to get back to you promptly.\n\nTo ensure I address your needs accurately, could you confirm a few details?\n\n1. What specific challenge are you looking to solve?\n2. What timeline are you working with?\n3. Is there a budget range you have in mind?\n\nOnce I have this information, I'll prepare a tailored proposal for you.\n\nBest regards,\n${context.userName || 'Team'}`
  );

  return templates;
}

export async function generateMeetingSummary(title, attendees, duration, notes) {
  const defaultSummary = {
    title: title || 'Meeting Summary',
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    attendees: Array.isArray(attendees) ? attendees : ['Attendee'],
    duration: duration || '30 minutes',
    keyPoints: [
      'Reviewed current project status and milestones',
      'Discussed timeline adjustments and resource allocation',
      'Identified potential risks and mitigation strategies',
      'Agreed on next steps and action items',
    ],
    actionItems: [
      { owner: 'Team', task: 'Follow up on outstanding deliverables', priority: 'High' },
      { owner: 'Team', task: 'Schedule follow-up meeting', priority: 'Medium' },
      { owner: 'Team', task: 'Share meeting notes with stakeholders', priority: 'Low' },
    ],
    decisions: [
      'Next milestone review scheduled',
      'Budget reallocation approved for Q3',
    ],
    notes: notes || 'No additional notes recorded.',
  };

  return defaultSummary;
}

export async function getPredictiveInsights() {
  const totalDeals = await Deal.countDocuments();
  const wonDeals = await Deal.countDocuments({ stage: { $in: ['Closed Won', 'closed_won'] } });
  const lostDeals = await Deal.countDocuments({ stage: { $in: ['Closed Lost', 'closed_lost'] } });
  const closedTotal = wonDeals + lostDeals;

  const winRate = closedTotal > 0 ? Math.round((wonDeals / closedTotal) * 100) : 0;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const dealsThisMonth = await Deal.countDocuments({ createdAt: { $gte: thisMonth } });
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const dealsLastMonth = await Deal.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } });

  const dealGrowth = dealsLastMonth > 0 ? Math.round(((dealsThisMonth - dealsLastMonth) / dealsLastMonth) * 100) : 0;

  const pipelineValue = await Deal.aggregate([
    { $match: { stage: { $nin: ['Closed Won', 'closed_won', 'Closed Lost', 'closed_lost'] } } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } } } },
  ]);

  const avgDealValue = await Deal.aggregate([
    { $match: { stage: { $in: ['Closed Won', 'closed_won'] } } },
    { $group: { _id: null, avg: { $avg: '$value' } } },
  ]);

  const avgCycle = await Deal.aggregate([
    { $match: { stage: { $in: ['Closed Won', 'closed_won'] }, closedAt: { $exists: true } } },
    { $project: { days: { $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } } },
    { $group: { _id: null, avg: { $avg: '$days' } } },
  ]);

  return {
    winRate,
    predictedMonthlyRevenue: Math.round((pipelineValue[0]?.total || 0) * (winRate / 100)),
    dealGrowth,
    avgDealValue: Math.round(avgDealValue[0]?.avg || 0),
    avgSalesCycle: Math.round(avgCycle[0]?.avg || 0),
    dealsThisMonth,
    dealsLastMonth,
    confidence: winRate >= 50 ? 'high' : winRate >= 30 ? 'medium' : 'low',
  };
}
