import type { Transaction, Budget, BudgetStatus } from '../../entities/finance/Transaction.js';

export interface TransactionRepository {
  findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      category?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction | null>;
  delete(id: string): Promise<void>;
  getSummary(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ totalIncome: number; totalExpense: number; byCategory: Record<string, number> }>;
}

export interface BudgetRepository {
  findByUserId(userId: string): Promise<Budget[]>;
  findActiveByUserId(userId: string): Promise<Budget[]>;
  findById(id: string): Promise<Budget | null>;
  create(data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget>;
  update(id: string, data: Partial<Budget>): Promise<Budget | null>;
  delete(id: string): Promise<void>;
  /** Active budgets paired with the expense recorded in each one's window. */
  getStatus(userId: string, startDate: string, endDate: string): Promise<BudgetStatus[]>;
}
