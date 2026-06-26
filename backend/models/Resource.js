import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, default: '' },
  skills: [{ type: String }],
  hourlyRate: { type: Number, default: 0 },
  weeklyCapacity: { type: Number, default: 40 },
  currentAllocation: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'partial', 'full', 'overbooked'], default: 'available' },
  assignments: [{
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    allocation: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    role: String,
  }],
  timeOff: [{
    start: Date,
    end: Date,
    reason: String,
  }],
}, { timestamps: true });

resourceSchema.index({ status: 1 });

export default mongoose.model('Resource', resourceSchema);
