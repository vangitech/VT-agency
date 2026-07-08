import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    // Universal Baseline
    name: { type: String, required: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    website: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    industry: {
      type: String,
      enum: ['', 'Banking/Fintech', 'E-commerce', 'Healthcare', 'Government', 'Logistics', 'Oil & Gas', 'Other'],
      default: '',
    },
    companySize: {
      type: String,
      enum: ['', '1-10 employees', '11-50 employees', '51-200 employees', '200+ employees'],
      default: '',
    },
    budget: {
      type: String,
      enum: ['', 'Under ₦5M', '₦5M – ₦15M', '₦15M – ₦50M', '₦50M+'],
      default: '',
    },
    timeline: {
      type: String,
      enum: ['', 'Emergency/Immediate', 'Within 1 month', '1-3 months', '3+ months'],
      default: '',
    },

    // Category
    category: {
      type: String,
      enum: ['', 'Software Development', 'Cyber-Security', 'ISO Implementation', 'Fintech Solutions'],
      required: true,
    },

    // Software Development
    softwareScope: [{ type: String }],
    targetPlatforms: [{ type: String }],
    coreFeatures: [{ type: String }],
    preferredTechStack: { type: String, default: '' },

    // Cyber Security
    securityNeed: { type: String, default: '' },
    infrastructureType: [{ type: String }],
    complianceFramework: [{ type: String }],
    recentAttack: { type: String, enum: ['', 'Yes', 'No', 'Unsure'], default: '' },

    // ISO Implementation
    targetCertification: [{ type: String }],
    currentStatus: { type: String, default: '' },
    locationsInScope: { type: Number, default: 0 },

    // Fintech Solutions
    solutionCategory: [{ type: String }],
    regulatoryLicenseStatus: { type: String, default: '' },
    expectedTransactionVolume: { type: String, default: '' },

    // Closeout
    documentPath: { type: String, default: '' },
    documentOriginalName: { type: String, default: '' },
    additionalSpecs: { type: String, default: '' },

    // Admin
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

quoteRequestSchema.index({ email: 1, createdAt: -1 });

const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);
export default QuoteRequest;
