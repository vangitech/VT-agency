import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as timesheetController from '../controllers/timesheetController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/', timesheetController.getEntries);
router.get('/stats', timesheetController.getTimesheetStats);
router.post('/', timesheetController.createEntry);
router.put('/:id', timesheetController.updateEntry);
router.delete('/:id', timesheetController.deleteEntry);

export default router;
