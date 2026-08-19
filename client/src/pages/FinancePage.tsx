import { useState } from 'react';
import {
  TransactionList,
  TransactionForm,
  CategoryChart,
  SummaryCards,
  useTransactions,
} from '@/features/finance';
import type { Transaction, TransactionFormData } from '@/features/finance';
import { PageHeader } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
        action={<Button onClick={() => setShowForm(true)}>Add Transaction</Button>}
      />

      {error && <Alert variant="error">{error}</Alert>}

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
        <AlertDialog open onOpenChange={(open) => !open && setDeletingTx(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this transaction?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="danger" onClick={() => void confirmDelete()}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
