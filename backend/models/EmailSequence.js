import mongoose from 'mongoose';

const emailSequenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  trigger: { type: String, enum: ['lead_created', 'deal_stage', 'form_submission', 'tag_added', 'manual'], default: 'manual' },
  triggerValue: { type: String, default: '' },
  status: { type: String, enum: ['active', 'paused', 'draft'], default: 'draft' },
  steps: [{
    order: Number,
    subject: String,
    body: String,
    delayDays: { type: Number, default: 0 },
    condition: { type: String, default: '' },
  }],
  targets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  sentCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('EmailSequence', emailSequenceSchema);
