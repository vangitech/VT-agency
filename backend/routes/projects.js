import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as projectController from '../controllers/projectController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/', projectController.getProjects);
router.get('/stats', projectController.getProjectStats);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.put('/:id/onboarding', projectController.updateOnboarding);

export default router;
