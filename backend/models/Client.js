import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['finance', 'education', 'healthcare', 'technology', 'government', 'other'],
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

clientSchema.index({ isActive: 1, name: 1 });

const Client = mongoose.model('Client', clientSchema);
export default Client;