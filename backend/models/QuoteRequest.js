import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    projectType: { type: String, required: true },
    budget: { type: String, default: '' },
    timeline: { type: String, default: '' },
    description: { type: String, required: true },
    read: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
    replies: [{
      body: { type: String, required: true },
      adminName: { type: String, required: true },
      sentAt: { type: Date, default: Date.now },
      provider: { type: String },
    }],
  },
  { timestamps: true }
);

const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);
export default QuoteRequest;
