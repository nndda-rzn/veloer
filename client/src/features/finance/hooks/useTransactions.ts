import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../api/finance.api';
import type {
  Transaction,
  FinanceSummary,
  Budget,
  BudgetStatus,
  TransactionFormData,
  BudgetFormData,
} from '../types/finance';

export const financeKeys = {
  all: ['finance'] as const,
  transactions: ['finance', 'transactions'] as const,
  summary: (startDate?: string, endDate?: string) =>
    ['finance', 'summary', startDate ?? null, endDate ?? null] as const,
  budgets: ['finance', 'budgets'] as const,
  budgetStatus: (startDate: string, endDate: string) =>
    ['finance', 'budget-status', startDate, endDate] as const,
};

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  summary: FinanceSummary | null;
  budgets: Budget[];
  budgetStatus: BudgetStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createTransaction: (data: TransactionFormData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createBudget: (data: BudgetFormData) => Promise<void>;
  updateBudget: (id: string, data: Partial<BudgetFormData>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

/**
 * Finance reads/writes on React Query, matching the rest of the app (goals,
 * activities, dashboard). The range only affects the summary and the budget
 * status — the transaction list is loaded once and filtered client-side.
 */
export function useTransactions(range?: DateRange): UseTransactionsReturn {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: financeKeys.transactions,
    queryFn: () => financeApi.listTransactions(),
  });
  const summaryQuery = useQuery({
    queryKey: financeKeys.summary(range?.startDate, range?.endDate),
    queryFn: () => financeApi.getSummary(range?.startDate, range?.endDate),
  });
  const budgetsQuery = useQuery({
    queryKey: financeKeys.budgets,
    queryFn: () => financeApi.listBudgets(),
  });
  const budgetStatusQuery = useQuery({
    queryKey: financeKeys.budgetStatus(range?.startDate ?? '', range?.endDate ?? ''),
    queryFn: () => financeApi.getBudgetStatus(range?.startDate ?? '', range?.endDate ?? ''),
    enabled: range != null,
  });

  // Finance mutations change numbers the dashboard mirrors (Finance Summary,
  // budget alerts), so both caches are invalidated. The dashboard keys are
  // matched by predicate rather than imported: dashboard imports finance, and a
  // direct import here would create a cycle.
  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: financeKeys.all }),
      queryClient.invalidateQueries({ predicate: isDashboardQuery, refetchType: 'active' }),
    ]);
  }, [queryClient]);

  const createTransaction = useCallback(
    async (data: TransactionFormData) => {
      await financeApi.createTransaction(data);
      await invalidate();
    },
    [invalidate],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<TransactionFormData>) => {
      await financeApi.updateTransaction(id, data);
      await invalidate();
    },
    [invalidate],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await financeApi.deleteTransaction(id);
      await invalidate();
    },
    [invalidate],
  );

  const createBudget = useCallback(
    async (data: BudgetFormData) => {
      await financeApi.createBudget(data);
      await invalidate();
    },
    [invalidate],
  );

  const updateBudget = useCallback(
    async (id: string, data: Partial<BudgetFormData>) => {
      await financeApi.updateBudget(id, data);
      await invalidate();
    },
    [invalidate],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      await financeApi.deleteBudget(id);
      await invalidate();
    },
    [invalidate],
  );

  const refetch = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: financeKeys.all });
  }, [queryClient]);

  const query = transactionsQuery;
  const error =
    query.error instanceof Error
      ? query.error.message
      : summaryQuery.error instanceof Error
        ? summaryQuery.error.message
        : budgetsQuery.error instanceof Error
          ? budgetsQuery.error.message
          : budgetStatusQuery.error instanceof Error
            ? budgetStatusQuery.error.message
            : null;

  return {
    transactions: transactionsQuery.data ?? [],
    summary: summaryQuery.data ?? null,
    budgets: budgetsQuery.data ?? [],
    budgetStatus: budgetStatusQuery.data ?? [],
    loading: transactionsQuery.isPending || summaryQuery.isPending,
    error,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}

function isDashboardQuery(query: { queryKey: readonly unknown[] }): boolean {
  return query.queryKey[0] === 'dashboard';
}
