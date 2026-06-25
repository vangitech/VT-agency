import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  type: {
    type: String,
    enum: ['email', 'call', 'meeting', 'note', 'social', 'form_submission'],
    required: true,
  },
  subject: { type: String, default: '' },
  description: { type: String, default: '' },
  outcome: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  linkedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactMessage' },
}, { timestamps: true });

interactionSchema.index({ contact: 1, createdAt: -1 });

const Interaction = mongoose.model('Interaction', interactionSchema);
export default Interaction;