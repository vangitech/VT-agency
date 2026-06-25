import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as crmController from '../controllers/crmController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/messages', crmController.getMessages);
router.get('/messages/stats', crmController.getStats);
router.get('/messages/:id', crmController.getMessage);
router.put('/messages/:id/read', crmController.markRead);
router.delete('/messages/:id', crmController.deleteMessage);
router.post('/messages/:id/reply', crmController.sendReplyMessage);

export default router;