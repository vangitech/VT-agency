import SMSMessage from '../models/SMSMessage.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';

export const getMessages = async (req, res) => {
  try {
    const { contact, conversationId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (contact) filter.contact = contact;
    if (conversationId) filter.conversationId = conversationId;
    const total = await SMSMessage.countDocuments(filter);
    const messages = await SMSMessage.find(filter)
      .populate('contact', 'name email phone')
      .populate('initiatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ messages, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { to, body, contactId } = req.body;
    if (!to || !body) return res.status(400).json({ message: 'To and body required' });

    let contact = contactId ? await Contact.findById(contactId) : null;
    if (!contact) {
      contact = await Contact.findOne({ phone: to.replace(/\D/g, '') });
    }

    const sms = await SMSMessage.create({
      contact: contact?._id || null,
      direction: 'outbound',
      from: req.body.from || process.env.TWILIO_PHONE || '',
      to,
      body,
      status: 'sent',
      sentAt: new Date(),
      initiatedBy: req.user._id,
      conversationId: req.body.conversationId || `${Date.now()}`,
    });

    if (contact) {
      await Interaction.create({
        contact: contact._id,
        type: 'sms',
        subject: 'SMS Sent',
        description: body.substring(0, 200),
        metadata: { smsId: sms._id, to },
      });
    }
    res.status(201).json(sms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await SMSMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $ifNull: ['$conversationId', '$_id'] },
          contact: { $first: '$contact' },
          lastMessage: { $first: '$body' },
          lastDate: { $first: '$createdAt' },
          direction: { $first: '$direction' },
          from: { $first: '$from' },
          to: { $first: '$to' },
          count: { $sum: 1 },
        },
      },
      { $sort: { lastDate: -1 } },
      { $limit: 50 },
    ]);

    await SMSMessage.populate(conversations, { path: 'contact', select: 'name email phone' });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    await SMSMessage.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
