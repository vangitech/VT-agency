import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'dropdown', 'boolean', 'email', 'phone', 'url', 'textarea'], default: 'text' },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  placeholder: { type: String, default: '' },
  defaultValue: { type: mongoose.Schema.Types.Mixed },
  order: { type: Number, default: 0 },
  showInList: { type: Boolean, default: true },
}, { _id: true });

const customObjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'FileText' },
  color: { type: String, default: '#6366f1' },
  fields: [fieldSchema],
  required: { type: Boolean, default: false },
  recordCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('CustomObject', customObjectSchema);
