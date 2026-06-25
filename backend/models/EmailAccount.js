import mongoose from 'mongoose';

const emailAccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  provider: { type: String, enum: ['gmail', 'outlook', 'zoho', 'imap', 'other'], default: 'imap' },
  imapHost: { type: String, default: '' },
  imapPort: { type: Number, default: 993 },
  imapSecure: { type: Boolean, default: true },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpSecure: { type: Boolean, default: false },
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  oauthToken: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastSynced: { type: Date },
  syncInterval: { type: Number, default: 5 },
  signature: { type: String, default: '' },
  folders: [{ name: String, path: String, unread: { type: Number, default: 0 } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('EmailAccount', emailAccountSchema);
