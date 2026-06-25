import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as crmController from '../controllers/crmController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Messages
router.get('/messages', crmController.getMessages);
router.get('/messages/stats', crmController.getStats);
router.get('/messages/:id', crmController.getMessage);
router.put('/messages/:id/read', crmController.markRead);
router.delete('/messages/:id', crmController.deleteMessage);
router.post('/messages/:id/reply', crmController.sendReplyMessage);
router.post('/messages/:id/sync-contact', crmController.syncMessageToContact);

// Contacts (unified profiles)
router.get('/contacts', crmController.getContacts);
router.get('/contacts/dedup/find', crmController.findDuplicates);
router.post('/contacts/dedup/merge', crmController.mergeDuplicates);
router.get('/contacts/:id', crmController.getContact);
router.post('/contacts', crmController.createContact);
router.put('/contacts/:id', crmController.updateContact);
router.delete('/contacts/:id', crmController.deleteContact);

// Interactions
router.get('/contacts/:id/interactions', crmController.getInteractions);
router.post('/contacts/:id/interactions', crmController.addInteraction);

export default router;