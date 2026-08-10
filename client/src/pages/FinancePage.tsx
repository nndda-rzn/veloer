import { useState } from 'react';
import {
  TransactionList,
  TransactionForm,
  CategoryChart,
  SummaryCards,
  useTransactions,
} from '@/features/finance';
import type { Transaction, TransactionFormData } from '@/features/finance';

export function FinancePage() {
  const { transactions, summary, loading, error, createTransaction, deleteTransaction } =
    useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const handleSubmit = async (data: TransactionFormData) => {
    await createTransaction(data);
    setShowForm(false);
  };

  const confirmDelete = async () => {
    if (deletingTx) {
      await deleteTransaction(deletingTx.id);
      setDeletingTx(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finance</h2>
          <p className="mt-1 text-sm text-gray-500">Track your cycling expenses and budgets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Add Transaction
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Transactions</h3>
          <TransactionList transactions={transactions} loading={loading} onDelete={setDeletingTx} />
        </div>
        <div>
          <CategoryChart summary={summary} />
        </div>
      </div>

      {showForm && <TransactionForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Transaction</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this transaction?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingTx(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
