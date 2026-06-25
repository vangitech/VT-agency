import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as smsController from '../controllers/smsController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/messages', smsController.getMessages);
router.get('/conversations', smsController.getConversations);
router.post('/messages/send', smsController.sendMessage);
router.put('/messages/:id/read', smsController.markRead);

export default router;
