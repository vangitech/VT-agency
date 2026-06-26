import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'editor', 'manager', 'agent'],
      default: 'editor',
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: '' },
    twoFactorVerified: { type: Boolean, default: false },
    permissions: {
      deals: { type: String, enum: ['none', 'own', 'all'], default: 'all' },
      contacts: { type: String, enum: ['none', 'own', 'all'], default: 'all' },
      projects: { type: String, enum: ['none', 'own', 'all'], default: 'all' },
      reports: { type: Boolean, default: true },
      settings: { type: Boolean, default: false },
      users: { type: Boolean, default: false },
      crm: { type: Boolean, default: true },
      customObjects: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;