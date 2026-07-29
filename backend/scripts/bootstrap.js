import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../models/User.js';
import Setting from '../models/Setting.js';

const email = process.env.BOOTSTRAP_EMAIL || 'evangel@vangitech.com';
const password = process.env.BOOTSTRAP_PASSWORD || process.env.SUPERADMIN_PASSWORD;

if (!password) {
  console.error('Set SUPERADMIN_PASSWORD or BOOTSTRAP_PASSWORD env var');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) {
    console.log(`Superadmin already exists: ${existing.email} — skipping creation`);
  } else {
    await User.create({ name: 'Evangel', email, password, role: 'superadmin' });
    console.log(`Superadmin created: ${email}`);
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
