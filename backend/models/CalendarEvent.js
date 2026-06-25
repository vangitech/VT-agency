import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  isAllDay: { type: Boolean, default: false },
  color: { type: String, default: '#2563eb' },
  status: { type: String, enum: ['confirmed', 'tentative', 'cancelled'], default: 'confirmed' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    response: { type: String, enum: ['pending', 'accepted', 'declined', 'tentative'], default: 'pending' },
  }],
  reminders: [{
    method: { type: String, enum: ['email', 'notification'], default: 'notification' },
    minutes: { type: Number, default: 15 },
  }],
  recurrence: {
    freq: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    interval: { type: Number, default: 1 },
    endDate: Date,
    count: Number,
  },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  relatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'CalendarEvent' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

calendarEventSchema.index({ start: 1, end: 1 });
calendarEventSchema.index({ 'attendees.user': 1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);
