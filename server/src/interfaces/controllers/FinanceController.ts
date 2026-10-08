import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import {
  AddTransaction,
  UpdateTransaction,
  DeleteTransaction,
  GetTransactions,
  GetFinanceSummary,
} from '../../application/use-cases/finance/TransactionUseCases.js';
import {
  AddBudget,
  UpdateBudget,
  DeleteBudget,
  GetBudgets,
  GetBudgetStatus,
} from '../../application/use-cases/finance/BudgetUseCases.js';

export class FinanceController {
  // --- TRANSACTIONS ---

  async listTransactions(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { limit, offset, category, type, startDate, endDate } = req.query;
    const getTransactions = container.resolve(GetTransactions);
    const transactions = await getTransactions.execute(req.user.userId, {
      limit: limit ? parseInt(String(limit), 10) : undefined,
      offset: offset ? parseInt(String(offset), 10) : undefined,
      category: category ? String(category) : undefined,
      type: type ? String(type) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    res.json(transactions);
  }

  async createTransaction(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addTransaction = container.resolve(AddTransaction);
    const tx = await addTransaction.execute(req.user.userId, req.body);
    res.status(201).json(tx);
  }

  async updateTransaction(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateTransaction = container.resolve(UpdateTransaction);
    const tx = await updateTransaction.execute(String(id), req.user.userId, req.body);
    if (!tx) {
      res.status(404).json({ error: 'Not Found', message: 'Transaction not found' });
      return;
    }
    res.json(tx);
  }

  async deleteTransaction(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteTransaction = container.resolve(DeleteTransaction);
    const deleted = await deleteTransaction.execute(String(id), req.user.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Transaction not found' });
      return;
    }
    res.status(204).send();
  }

  async getSummary(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { startDate, endDate } = req.query;
    const getSummary = container.resolve(GetFinanceSummary);
    const summary = await getSummary.execute(
      req.user.userId,
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined,
    );
    res.json(summary);
  }

  // --- BUDGETS ---

  async listBudgets(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const getBudgets = container.resolve(GetBudgets);
    const budgets = await getBudgets.execute(req.user.userId);
    res.json(budgets);
  }

  async createBudget(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addBudget = container.resolve(AddBudget);
    const budget = await addBudget.execute(req.user.userId, req.body);
    res.status(201).json(budget);
  }

  async updateBudget(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateBudget = container.resolve(UpdateBudget);
    const budget = await updateBudget.execute(String(id), req.user.userId, req.body);
    if (!budget) {
      res.status(404).json({ error: 'Not Found', message: 'Budget not found' });
      return;
    }
    res.json(budget);
  }

  async deleteBudget(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteBudget = container.resolve(DeleteBudget);
    const deleted = await deleteBudget.execute(String(id), req.user.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Budget not found' });
      return;
    }
    res.status(204).send();
  }

  async getBudgetStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Default to the current month when the caller omits a range, so the
    // endpoint is useful on its own (dashboard, scripts) without a query string.
    const today = new Date().toISOString().slice(0, 10);
    const { startDate, endDate } = req.query;
    const start = startDate ? String(startDate) : `${today.slice(0, 7)}-01`;
    const end = endDate ? String(endDate) : today;

    const getBudgetStatus = container.resolve(GetBudgetStatus);
    const status = await getBudgetStatus.execute(req.user.userId, start, end);
    res.json(status);
  }
}
