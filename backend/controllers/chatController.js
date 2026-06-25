import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';

export const getSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await ChatSession.countDocuments(filter);
    const sessions = await ChatSession.find(filter)
      .populate('assignedTo', 'name email')
      .populate('contact', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ sessions, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('contact', 'name email');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const messages = await ChatMessage.find({ session: session._id }).sort({ createdAt: 1 });
    res.json({ session, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const session = await ChatSession.create(req.body);
    await ChatMessage.create({
      session: session._id,
      sender: 'system',
      content: 'Chat started',
      contentType: 'system',
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content, contentType, fileUrl, fileName, fileSize } = req.body;
    if (!content && !fileUrl) return res.status(400).json({ message: 'Content required' });

    const message = await ChatMessage.create({
      session: req.params.id,
      sender: 'agent',
      senderId: req.user._id,
      senderName: req.user.name,
      content: content || '',
      contentType: contentType || 'text',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
    });

    await ChatSession.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndUpdate(
      req.params.id,
      { status: 'ended', endedAt: new Date(), endedBy: 'agent' },
      { returnDocument: 'after' }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });

    await ChatMessage.create({
      session: session._id,
      sender: 'system',
      content: 'Chat ended by agent',
      contentType: 'system',
    });

    if (session.contact) {
      await Interaction.create({
        contact: session.contact,
        type: 'chat',
        subject: 'Live Chat Session',
        description: `Chat ended. ${session.visitorName} — ${session.pageTitle || session.pageUrl || ''}`,
        metadata: { sessionId: session._id, duration: session.updatedAt - session.createdAt },
      });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignSession = async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.user._id },
      { returnDocument: 'after' }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncContact = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const email = session.visitorEmail;
    if (!email) return res.status(400).json({ message: 'No visitor email' });
    let contact = await Contact.findOne({ email: email.toLowerCase() });
    if (!contact) {
      contact = await Contact.create({
        name: session.visitorName,
        email: email.toLowerCase(),
        source: 'live_chat',
      });
    }
    session.contact = contact._id;
    await session.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [active, waiting, total] = await Promise.all([
      ChatSession.countDocuments({ status: 'active' }),
      ChatSession.countDocuments({ status: 'waiting' }),
      ChatSession.countDocuments(),
    ]);
    res.json({ active, waiting, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
