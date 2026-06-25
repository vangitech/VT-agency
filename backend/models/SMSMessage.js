import mongoose from 'mongoose';

const smsMessageSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  body: { type: String, default: '' },
  status: { type: String, enum: ['sent', 'delivered', 'failed', 'received', 'queued'], default: 'queued' },
  segments: { type: Number, default: 1 },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  provider: { type: String, default: 'twilio' },
  providerMessageId: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  tags: [{ type: String }],
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversationId: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

smsMessageSchema.index({ contact: 1 });
smsMessageSchema.index({ conversationId: 1 });
smsMessageSchema.index({ createdAt: -1 });

export default mongoose.model('SMSMessage', smsMessageSchema);
