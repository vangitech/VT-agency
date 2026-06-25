import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
  sender: { type: String, enum: ['visitor', 'agent', 'system'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId },
  senderName: { type: String, default: '' },
  content: { type: String, default: '' },
  contentType: { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

chatMessageSchema.index({ session: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
