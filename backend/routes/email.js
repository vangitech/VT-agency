import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as emailController from '../controllers/emailController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/accounts', emailController.getAccounts);
router.post('/accounts', emailController.createAccount);
router.put('/accounts/:id', emailController.updateAccount);
router.delete('/accounts/:id', emailController.deleteAccount);

router.get('/messages', emailController.getMessages);
router.get('/messages/:id', emailController.getMessage);
router.delete('/messages/:id', emailController.deleteMessage);
router.post('/messages/send', emailController.sendMessage);
router.put('/messages/:id/star', emailController.toggleStar);
router.put('/messages/:id/move', emailController.moveToFolder);
router.get('/messages/:id/thread', emailController.getThread);
router.post('/messages/:id/sync-contact', emailController.syncContact);

router.post('/sync/:id', emailController.syncEmails);
router.post('/sync-all', emailController.syncAllEmails);

export default router;
