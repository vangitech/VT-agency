import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as resourceController from '../controllers/resourceController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/', resourceController.getResources);
router.get('/capacity-report', resourceController.getCapacityReport);
router.get('/:id', resourceController.getResource);
router.post('/', resourceController.createOrUpdate);
router.delete('/:id', resourceController.deleteResource);
router.put('/:id/assignment', resourceController.updateAssignment);
router.post('/:id/timeoff', resourceController.addTimeOff);

export default router;
