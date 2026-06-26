import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  category: { type: String, enum: ['travel', 'software', 'hardware', 'subscription', 'consulting', 'marketing', 'food', 'transport', 'other'], default: 'other' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  description: { type: String, default: '' },
  receiptUrl: { type: String, default: '' },
  date: { type: Date, required: true },
  billable: { type: Boolean, default: true },
  billed: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  vendor: { type: String, default: '' },
}, { timestamps: true });

expenseSchema.index({ project: 1 });
expenseSchema.index({ submittedBy: 1 });

export default mongoose.model('Expense', expenseSchema);
