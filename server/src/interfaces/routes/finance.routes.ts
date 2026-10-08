import { Router } from 'express';
import { FinanceController } from '../controllers/FinanceController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new FinanceController();

// Transactions
router.get('/transactions', authMiddleware, (req, res, next) => {
  void controller.listTransactions(req, res).catch(next);
});
router.post('/transactions', authMiddleware, (req, res, next) => {
  void controller.createTransaction(req, res).catch(next);
});
router.patch('/transactions/:id', authMiddleware, (req, res, next) => {
  void controller.updateTransaction(req, res).catch(next);
});
router.delete('/transactions/:id', authMiddleware, (req, res, next) => {
  void controller.deleteTransaction(req, res).catch(next);
});

// Summary
router.get('/summary', authMiddleware, (req, res, next) => {
  void controller.getSummary(req, res).catch(next);
});

router.get('/budget-status', authMiddleware, (req, res, next) => {
  void controller.getBudgetStatus(req, res).catch(next);
});

// Budgets
router.get('/budgets', authMiddleware, (req, res, next) => {
  void controller.listBudgets(req, res).catch(next);
});
router.post('/budgets', authMiddleware, (req, res, next) => {
  void controller.createBudget(req, res).catch(next);
});
router.patch('/budgets/:id', authMiddleware, (req, res, next) => {
  void controller.updateBudget(req, res).catch(next);
});
router.delete('/budgets/:id', authMiddleware, (req, res, next) => {
  void controller.deleteBudget(req, res).catch(next);
});

export const financeRoutes = router;
