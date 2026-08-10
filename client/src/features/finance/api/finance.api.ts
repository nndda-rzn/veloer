import { apiClient } from '@/shared/lib/api-client';
import type {
  Transaction,
  Budget,
  FinanceSummary,
  TransactionFormData,
  BudgetFormData,
} from '../types/finance';

export const financeApi = {
  // Transactions
  async listTransactions(filters?: {
    category?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    const { data } = await apiClient.get<Transaction[]>('/api/finance/transactions', {
      params: filters,
    });
    return data;
  },

  async createTransaction(formData: TransactionFormData): Promise<Transaction> {
    const { data } = await apiClient.post<Transaction>('/api/finance/transactions', formData);
    return data;
  },

  async updateTransaction(
    id: string,
    formData: Partial<TransactionFormData>,
  ): Promise<Transaction> {
    const { data } = await apiClient.patch<Transaction>(
      `/api/finance/transactions/${id}`,
      formData,
    );
    return data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/api/finance/transactions/${id}`);
  },

  // Summary
  async getSummary(startDate?: string, endDate?: string): Promise<FinanceSummary> {
    const { data } = await apiClient.get<FinanceSummary>('/api/finance/summary', {
      params: { startDate, endDate },
    });
    return data;
  },

  // Budgets
  async listBudgets(): Promise<Budget[]> {
    const { data } = await apiClient.get<Budget[]>('/api/finance/budgets');
    return data;
  },

  async createBudget(formData: BudgetFormData): Promise<Budget> {
    const { data } = await apiClient.post<Budget>('/api/finance/budgets', formData);
    return data;
  },

  async updateBudget(id: string, formData: Partial<BudgetFormData>): Promise<Budget> {
    const { data } = await apiClient.patch<Budget>(`/api/finance/budgets/${id}`, formData);
    return data;
  },

  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/api/finance/budgets/${id}`);
  },
};
