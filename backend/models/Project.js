import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['software', 'cybersecurity', 'fintech', 'edutech', 'medical', 'consulting'],
      required: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    client: {
      type: String,
      default: '',
    },
    completionDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;