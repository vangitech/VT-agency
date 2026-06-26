import mongoose from 'mongoose';

const customObjectRecordSchema = new mongoose.Schema({
  objectType: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomObject', required: true },
  values: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  title: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

customObjectRecordSchema.index({ objectType: 1 });
customObjectRecordSchema.index({ 'values.$**': 'text' });

export default mongoose.model('CustomObjectRecord', customObjectRecordSchema);
