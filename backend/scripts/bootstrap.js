import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../models/User.js';
import SetupToken from '../models/SetupToken.js';
import Setting from '../models/Setting.js';
import { sendSuperAdminSetupEmail } from '../services/mailer.js';

const email = process.env.BOOTSTRAP_EMAIL || 'evangel@vangitech.com';

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) {
    console.log(`Superadmin already exists: ${existing.email}`);
  } else {
    const existingToken = await SetupToken.findOne({ email, used: false, expiresAt: { $gt: new Date() } });
    if (existingToken) {
      console.log(`Setup token already sent to ${email} — check inbox`);
    } else {
      const token = crypto.randomBytes(32).toString('hex');
      await SetupToken.create({ token, email, expiresAt: new Date(Date.now() + 86400000) });
      const setupLink = `https://vangitech.com/vaccess/setup?token=${token}`;
      await sendSuperAdminSetupEmail({ to: email, name: 'Super Admin', setupLink });
      console.log(`Superadmin setup email sent to ${email}`);
    }
  }

  const defaults = {
    companyEmail: 'support@vangitech.com',
    companyAddress: 'House C18A FRSC Estate Lokogoma FCT-Abuja',
    companyPhone: '+234 806 975 2912',
    companyName: 'Vangitech Limited',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
  }
  console.log('Default settings seeded');

  await mongoose.disconnect();
  console.log('Done');
} catch (err) {
  console.error('Bootstrap failed:', err.message);
  process.exit(1);
}
