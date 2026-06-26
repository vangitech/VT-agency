import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  probability: { type: Number, default: 0, min: 0, max: 100 },
  stage: { type: String, required: true },
  pipeline: { type: String, default: 'default' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  company: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  source: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expectedCloseDate: { type: Date },
  closedAt: { type: Date },
  wonReason: { type: String, default: '' },
  lostReason: { type: String, default: '' },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  products: [{
    name: String,
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

dealSchema.index({ stage: 1, pipeline: 1 });
dealSchema.index({ owner: 1 });
dealSchema.index({ contact: 1 });

export default mongoose.model('Deal', dealSchema);
