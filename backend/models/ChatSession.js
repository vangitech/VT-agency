import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  visitorId: { type: String, default: '' },
  visitorName: { type: String, default: 'Website Visitor' },
  visitorEmail: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  pageUrl: { type: String, default: '' },
  pageTitle: { type: String, default: '' },
  status: { type: String, enum: ['active', 'waiting', 'ended'], default: 'active' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  source: { type: String, default: 'website_widget' },
  tags: [{ type: String }],
  customFields: mongoose.Schema.Types.Mixed,
  endedAt: { type: Date },
  endedBy: { type: String, enum: ['visitor', 'agent', 'timeout'], default: 'visitor' },
  rating: { type: Number, min: 1, max: 5 },
  ratingComment: { type: String, default: '' },
}, { timestamps: true });

chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ assignedTo: 1 });

export default mongoose.model('ChatSession', chatSessionSchema);
