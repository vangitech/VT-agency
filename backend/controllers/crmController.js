import ContactMessage from '../models/ContactMessage.js';
import { sendReply } from '../services/mailer.js';

export const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { returnDocument: 'after' }
    );
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendReplyMessage = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Reply body is required' });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const adminName = req.user?.name || 'Vangitech Team';

    const result = await sendReply({
      to: message.email,
      name: message.name,
      originalSubject: message.subject,
      originalMessage: message.message,
      replyBody: body,
      adminName,
    });

    message.replied = true;
    message.read = true;
    message.replies.push({
      body,
      adminName,
      provider: result.provider,
    });
    await message.save();

    res.json({ success: true, provider: result.provider, message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await ContactMessage.countDocuments();
    const unread = await ContactMessage.countDocuments({ read: false });
    const replied = await ContactMessage.countDocuments({ replied: true });
    res.json({ total, unread, replied });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};