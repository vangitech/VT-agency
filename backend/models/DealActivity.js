import mongoose from 'mongoose';

const dealActivitySchema = new mongoose.Schema({
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  type: { type: String, enum: ['task', 'call', 'email', 'meeting', 'note', 'follow_up'], required: true },
  subject: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reminderAt: { type: Date },
  outcome: { type: String, default: '' },
}, { timestamps: true });

dealActivitySchema.index({ deal: 1, status: 1 });
dealActivitySchema.index({ assignedTo: 1 });

export default mongoose.model('DealActivity', dealActivitySchema);
