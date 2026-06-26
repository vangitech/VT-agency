import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/revenue', analyticsController.getRevenueReport);
router.get('/activity', analyticsController.getActivityReport);
router.get('/attribution', analyticsController.getAttributionReport);
router.get('/win-loss', analyticsController.getWinLossReport);
router.get('/velocity', analyticsController.getSalesVelocity);

export default router;
