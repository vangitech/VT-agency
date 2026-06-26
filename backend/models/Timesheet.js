import mongoose from 'mongoose';

const timesheetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  date: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0, max: 24 },
  description: { type: String, default: '' },
  category: { type: String, enum: ['development', 'design', 'consulting', 'meeting', 'research', 'support', 'admin', 'other'], default: 'development' },
  billable: { type: Boolean, default: true },
  billed: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  hourlyRate: { type: Number, default: 0 },
}, { timestamps: true });

timesheetSchema.index({ user: 1, date: -1 });
timesheetSchema.index({ project: 1 });
timesheetSchema.index({ deal: 1 });

export default mongoose.model('Timesheet', timesheetSchema);
