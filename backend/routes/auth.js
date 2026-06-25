import express from 'express';
import { register, login, getMe, updateProfile, changePassword, getUsers, createUser, updateUserRole, deleteUser } from '../controllers/authController.js';
import { protect, superadminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Superadmin user management
router.get('/users', protect, superadminOnly, getUsers);
router.post('/users', protect, superadminOnly, createUser);
router.put('/users/:id/role', protect, superadminOnly, updateUserRole);
router.delete('/users/:id', protect, superadminOnly, deleteUser);

export default router;