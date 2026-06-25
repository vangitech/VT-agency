import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/sessions', chatController.getSessions);
router.get('/sessions/stats', chatController.getStats);
router.get('/sessions/:id', chatController.getSession);
router.post('/sessions', chatController.createSession);
router.post('/sessions/:id/messages', chatController.sendMessage);
router.put('/sessions/:id/end', chatController.endSession);
router.put('/sessions/:id/assign', chatController.assignSession);
router.post('/sessions/:id/sync-contact', chatController.syncContact);

export default router;
