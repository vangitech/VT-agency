import mongoose from 'mongoose';

const leadScoreSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true, unique: true },
  score: { type: Number, default: 0 },
  level: { type: String, enum: ['cold', 'warm', 'hot'], default: 'cold' },
  rules: [{
    rule: { type: mongoose.Schema.Types.ObjectId, ref: 'AutomationRule' },
    points: Number,
    reason: String,
    appliedAt: Date,
  }],
  factors: {
    emailOpens: { type: Number, default: 0 },
    emailClicks: { type: Number, default: 0 },
    websiteVisits: { type: Number, default: 0 },
    formSubmissions: { type: Number, default: 0 },
    dealValue: { type: Number, default: 0 },
    timeSinceContact: { type: Number, default: 0 },
  },
  lastUpdated: { type: Date },
}, { timestamps: true });

leadScoreSchema.index({ score: -1 });

export default mongoose.model('LeadScore', leadScoreSchema);
