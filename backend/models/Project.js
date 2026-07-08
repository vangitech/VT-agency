import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  clientName: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['onboarding', 'in_progress', 'on_hold', 'completed', 'cancelled'], default: 'onboarding' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  startDate: { type: Date },
  endDate: { type: Date },
  estimatedHours: { type: Number, default: 0 },
  loggedHours: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  onboardingChecklist: [{
    task: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

projectSchema.index({ status: 1 });
projectSchema.index({ deal: 1 });
projectSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
