import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  status: { type: String, enum: ['completed', 'missed', 'voicemail', 'failed', 'ringing'], default: 'completed' },
  from: { type: String, default: '' },
  to: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  durationFormatted: { type: String, default: '0:00' },
  notes: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  voicemailUrl: { type: String, default: '' },
  voicemailTranscript: { type: String, default: '' },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  callType: { type: String, enum: ['voip', 'phone', 'sip'], default: 'phone' },
  provider: { type: String, default: 'twilio' },
  providerCallId: { type: String, default: '' },
  tags: [{ type: String }],
  outcome: { type: String, default: '' },
}, { timestamps: true });

callLogSchema.index({ contact: 1 });
callLogSchema.index({ startedAt: -1 });

export default mongoose.model('CallLog', callLogSchema);
