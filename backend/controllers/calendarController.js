import CalendarEvent from '../models/CalendarEvent.js';

export const getEvents = async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    const filter = {
      $or: [{ createdBy: req.user._id }, { 'attendees.user': req.user._id }],
    };
    if (start && end) {
      filter.start = { $lte: new Date(end) };
      filter.end = { $gte: new Date(start) };
    }
    if (userId) {
      filter.$or = [{ createdBy: userId }, { 'attendees.user': userId }];
    }
    filter.status = { $ne: 'cancelled' };
    const events = await CalendarEvent.find(filter)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email')
      .sort({ start: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.create({ ...req.body, organizer: req.user._id, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { returnDocument: 'after' }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await CalendarEvent.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttendeeStatus = async (req, res) => {
  try {
    const { response } = req.body;
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const attendee = event.attendees.find(
      (a) => a.user?.toString() === req.user._id.toString() || a.email === req.user.email
    );
    if (attendee) {
      attendee.response = response;
    } else {
      event.attendees.push({ user: req.user._id, name: req.user.name, email: req.user.email, response });
    }
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find({
      $or: [{ createdBy: req.user._id }, { 'attendees.user': req.user._id }],
      start: { $gte: new Date() },
      status: { $ne: 'cancelled' },
    })
      .sort({ start: 1 })
      .limit(10)
      .populate('organizer', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
