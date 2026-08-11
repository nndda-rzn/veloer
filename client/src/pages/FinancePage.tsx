import { useState } from 'react';
import {
  TransactionList,
  TransactionForm,
  CategoryChart,
  SummaryCards,
  useTransactions,
} from '@/features/finance';
import type { Transaction, TransactionFormData } from '@/features/finance';
import { PageHeader, ConfirmDialog } from '@/shared/components/ui';

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
      <PageHeader
        title="Finance"
        description="Track your cycling expenses and budgets"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Add Transaction
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} loading={loading} onDelete={setDeletingTx} />
        </div>
        <div>
          <CategoryChart summary={summary} />
        </div>
      </div>

      {showForm && <TransactionForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      {deletingTx && (
        <ConfirmDialog
          title="Delete Transaction"
          description="Are you sure you want to delete this transaction?"
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeletingTx(null)}
        />
      )}
    </div>
  );
}
