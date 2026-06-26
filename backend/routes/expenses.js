import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/', expenseController.getExpenses);
router.get('/stats', expenseController.getExpenseStats);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.put('/:id/approve', expenseController.approveExpense);

export default router;
