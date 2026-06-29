import express from 'express';
import bcrypt from 'bcryptjs';
import { register, login, getMe, updateProfile, changePassword, getUsers, createUser, updateUserRole, deleteUser } from '../controllers/authController.js';
import { protect, superadminOnly } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', protect, superadminOnly, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Superadmin user management
router.get('/users', protect, superadminOnly, getUsers);
router.post('/users', protect, superadminOnly, createUser);
router.put('/users/:id/role', protect, superadminOnly, updateUserRole);
router.delete('/users/:id', protect, superadminOnly, deleteUser);

// Emergency superadmin reset — visit in browser to reset password
router.get('/reset-superadmin', async (req, res) => {
  try {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: { $regex: /^evangel@vangitech\.com$/i } },
      { $set: { password: hashed, role: 'superadmin', name: 'Evangel' } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Superadmin reset to evangel@vangitech.com / admin123' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;