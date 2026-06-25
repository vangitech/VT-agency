import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  industry: { type: String, default: '' },
  companySize: { type: String, default: '' },
  website: { type: String, default: '' },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  source: { type: String, default: 'contact_form' },
}, { timestamps: true });

contactSchema.index({ email: 1 });
contactSchema.index({ name: 1 });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;