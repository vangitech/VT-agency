import CallLog from '../models/CallLog.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';

export const getCallLogs = async (req, res) => {
  try {
    const { contact, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (contact) filter.contact = contact;
    const total = await CallLog.countDocuments(filter);
    const logs = await CallLog.find(filter)
      .populate('contact', 'name email phone')
      .populate('initiatedBy', 'name')
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCallLog = async (req, res) => {
  try {
    const log = await CallLog.findById(req.params.id)
      .populate('contact', 'name email phone')
      .populate('initiatedBy', 'name');
    if (!log) return res.status(404).json({ message: 'Call log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCallLog = async (req, res) => {
  try {
    const data = { ...req.body, initiatedBy: req.user._id };
    if (data.startedAt && data.endedAt) {
      const start = new Date(data.startedAt);
      const end = new Date(data.endedAt);
      data.duration = Math.round((end - start) / 1000);
      const mins = Math.floor(data.duration / 60);
      const secs = data.duration % 60;
      data.durationFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    const log = await CallLog.create(data);

    if (log.contact) {
      await Interaction.create({
        contact: log.contact,
        type: 'call',
        subject: `${log.direction === 'inbound' ? 'Received' : 'Made'} a call`,
        description: log.notes || `Call (${log.durationFormatted})`,
        outcome: log.outcome || log.status,
        metadata: { callLogId: log._id, duration: log.duration, direction: log.direction },
      });
    }
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCallLog = async (req, res) => {
  try {
    const log = await CallLog.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!log) return res.status(404).json({ message: 'Call log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCallLog = async (req, res) => {
  try {
    await CallLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Call log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const initiateCall = async (req, res) => {
  try {
    const { contactId, phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number required' });

    const contact = contactId ? await Contact.findById(contactId) : null;

    const log = await CallLog.create({
      contact: contactId || null,
      direction: 'outbound',
      status: 'ringing',
      to: phoneNumber,
      from: req.body.fromNumber || '',
      initiatedBy: req.user._id,
      startedAt: new Date(),
      callType: 'voip',
    });

    res.status(201).json({ message: 'Call initiated', call: log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCallStats = async (req, res) => {
  try {
    const [total, missed, totalDuration] = await Promise.all([
      CallLog.countDocuments(),
      CallLog.countDocuments({ status: 'missed' }),
      CallLog.aggregate([
        { $group: { _id: null, total: { $sum: '$duration' } } },
      ]),
    ]);
    res.json({
      total,
      missed,
      completed: await CallLog.countDocuments({ status: 'completed' }),
      totalDuration: totalDuration[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
