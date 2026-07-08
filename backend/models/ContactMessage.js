import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
    followUpSent: { type: Boolean, default: false },
    replies: [{
      body: { type: String, required: true },
      adminName: { type: String, required: true },
      sentAt: { type: Date, default: Date.now },
      provider: { type: String },
    }],
  },
  { timestamps: true }
);

contactMessageSchema.index({ email: 1, createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;