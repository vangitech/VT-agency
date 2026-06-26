import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/suggestions', aiController.getSuggestions);
router.post('/reply', aiController.getReplySuggestions);
router.post('/meeting-summary', aiController.getMeetingSummary);
router.get('/predictive-insights', aiController.getPredictiveInsightsAction);
router.post('/generate-email', aiController.generateEmail);

export default router;
