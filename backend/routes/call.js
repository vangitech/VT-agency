import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as callController from '../controllers/callController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/logs', callController.getCallLogs);
router.get('/logs/stats', callController.getCallStats);
router.get('/logs/:id', callController.getCallLog);
router.post('/logs', callController.createCallLog);
router.put('/logs/:id', callController.updateCallLog);
router.delete('/logs/:id', callController.deleteCallLog);
router.post('/initiate', callController.initiateCall);

export default router;
