import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as workflowController from '../controllers/workflowController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/sequences', workflowController.getSequences);
router.post('/sequences', workflowController.createSequence);
router.put('/sequences/:id', workflowController.updateSequence);
router.delete('/sequences/:id', workflowController.deleteSequence);

router.get('/rules', workflowController.getRules);
router.post('/rules', workflowController.createRule);
router.put('/rules/:id', workflowController.updateRule);
router.delete('/rules/:id', workflowController.deleteRule);

router.get('/lead-scores', workflowController.getLeadScores);
router.get('/lead-scores/stats', workflowController.getScoringStats);
router.post('/lead-scores/:id/recalculate', workflowController.recalculateScore);

export default router;
