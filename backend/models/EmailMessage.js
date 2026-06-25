import mongoose from 'mongoose';

const emailMessageSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAccount' },
  messageId: { type: String },
  folder: { type: String, default: 'INBOX' },
  from: { name: String, address: String },
  to: [{ name: String, address: String }],
  cc: [{ name: String, address: String }],
  bcc: [{ name: String, address: String }],
  subject: { type: String, default: '' },
  bodyHtml: { type: String, default: '' },
  bodyText: { type: String, default: '' },
  attachments: [{
    filename: String,
    contentType: String,
    size: Number,
    url: String,
  }],
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  isDraft: { type: Boolean, default: false },
  isSent: { type: Boolean, default: false },
  isTrash: { type: Boolean, default: false },
  labels: [{ type: String }],
  receivedAt: { type: Date },
  sentAt: { type: Date },
  inReplyTo: { type: String, default: '' },
  references: [{ type: String }],
  threadId: { type: String },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
}, { timestamps: true });

emailMessageSchema.index({ account: 1, folder: 1 });
emailMessageSchema.index({ account: 1, threadId: 1 });
emailMessageSchema.index({ 'from.address': 1 });

export default mongoose.model('EmailMessage', emailMessageSchema);
