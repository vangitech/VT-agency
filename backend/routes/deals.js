import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as dealController from '../controllers/dealController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/', dealController.getDeals);
router.get('/pipeline-stats', dealController.getPipelineStats);
router.get('/forecast', dealController.getForecast);
router.get('/activities', dealController.getActivities);
router.get('/:id', dealController.getDeal);
router.post('/', dealController.createDeal);
router.put('/reorder', dealController.reorderDeals);
router.put('/:id', dealController.updateDeal);
router.delete('/:id', dealController.deleteDeal);
router.post('/activities', dealController.createActivity);
router.put('/activities/:id', dealController.updateActivity);
router.delete('/activities/:id', dealController.deleteActivity);

export default router;
