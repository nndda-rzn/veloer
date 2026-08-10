import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../api/finance.api';
import type { Transaction, FinanceSummary, TransactionFormData } from '../types/finance';

interface UseTransactionsReturn {
  transactions: Transaction[];
  summary: FinanceSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createTransaction: (data: TransactionFormData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([financeApi.listTransactions(), financeApi.getSummary()])
      .then(([list, sum]) => {
        setTransactions(list);
        setSummary(sum);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createTransaction = useCallback(async (data: TransactionFormData) => {
    await financeApi.createTransaction(data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await financeApi.deleteTransaction(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { transactions, summary, loading, error, refetch, createTransaction, deleteTransaction };
}
