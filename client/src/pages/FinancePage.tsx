import { useMemo, useState } from 'react';
import { startOfMonth, endOfMonth, startOfYear, format } from 'date-fns';
import {
  TransactionList,
  TransactionForm,
  CategoryChart,
  SummaryCards,
  BudgetSection,
  BudgetForm,
  MonthlyTrendChart,
  useTransactions,
} from '@/features/finance';
import type {
  Transaction,
  TransactionFormData,
  Budget,
  BudgetStatus,
  BudgetFormData,
} from '@/features/finance';
import { PageHeader, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/shared/components/feedback/Toaster';
import { Alert } from '@/components/ui/alert';

type RangePreset = 'month' | 'year' | 'all';

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

/** The page-wide date filter; drives the summary and budget status. */
function rangeFor(preset: RangePreset): { startDate: string; endDate: string } | undefined {
  const now = new Date();
  if (preset === 'month')
    return { startDate: iso(startOfMonth(now)), endDate: iso(endOfMonth(now)) };
  if (preset === 'year') return { startDate: iso(startOfYear(now)), endDate: iso(now) };
  return undefined;
}

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
];

export function FinancePage() {
  const [preset, setPreset] = useState<RangePreset>('month');
  const range = useMemo(() => rangeFor(preset), [preset]);

  const {
    transactions,
    summary,
    budgets,
    budgetStatus,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useTransactions(range);
  const { pushToast } = useToast();

  const [showTxForm, setShowTxForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const handleTxSubmit = async (data: TransactionFormData) => {
    if (editingTx) await updateTransaction(editingTx.id, data);
    else await createTransaction(data);
    setShowTxForm(false);
    setEditingTx(null);
  };

  const confirmDeleteTx = async () => {
    if (!deletingTx) return;
    try {
      await deleteTransaction(deletingTx.id);
    } catch {
      pushToast('Failed to delete transaction.', { level: 'error' });
    } finally {
      setDeletingTx(null);
    }
  };

  const openBudgetEdit = (status: BudgetStatus) => {
    const match = budgets.find((b) => b.category === status.category && b.is_active);
    if (!match) {
      pushToast('Budget could not be loaded.', { level: 'error' });
      return;
    }
    setEditingBudget(match);
    setShowBudgetForm(true);
  };

  const openBudgetDelete = (status: BudgetStatus) => {
    const match = budgets.find((b) => b.category === status.category && b.is_active);
    if (match) setDeletingBudget(match);
  };

  const handleBudgetSubmit = async (data: BudgetFormData) => {
    if (editingBudget) await updateBudget(editingBudget.id, data);
    else await createBudget(data);
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const confirmDeleteBudget = async () => {
    if (!deletingBudget) return;
    try {
      await deleteBudget(deletingBudget.id);
    } catch {
      pushToast('Failed to delete budget.', { level: 'error' });
    } finally {
      setDeletingBudget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Track your cycling expenses and budgets"
        action={
          <Button
            onClick={() => {
              setEditingTx(null);
              setShowTxForm(true);
            }}
          >
            Add Transaction
          </Button>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={preset === p.value ? 'default' : 'outline'}
            onClick={() => setPreset(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <SummaryCards summary={summary} loading={loading} />

      <BudgetSection
        status={budgetStatus}
        loading={loading}
        onAdd={() => {
          setEditingBudget(null);
          setShowBudgetForm(true);
        }}
        onEdit={openBudgetEdit}
        onDelete={openBudgetDelete}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionList
            transactions={transactions}
            loading={loading}
            onDelete={setDeletingTx}
            onEdit={(tx) => {
              setEditingTx(tx);
              setShowTxForm(true);
            }}
          />
        </div>
        <div>
          <CategoryChart summary={summary} />
        </div>
      </div>

      <MonthlyTrendChart transactions={transactions} />

      {showTxForm && (
        <TransactionForm
          transaction={editingTx}
          onSubmit={handleTxSubmit}
          onCancel={() => {
            setShowTxForm(false);
            setEditingTx(null);
          }}
        />
      )}

      {showBudgetForm && (
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleBudgetSubmit}
          onCancel={() => {
            setShowBudgetForm(false);
            setEditingBudget(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deletingTx !== null}
        onOpenChange={(open) => !open && setDeletingTx(null)}
        title="Delete transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={confirmDeleteTx}
      />

      <ConfirmDialog
        open={deletingBudget !== null}
        onOpenChange={(open) => !open && setDeletingBudget(null)}
        title="Delete budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={confirmDeleteBudget}
      />
    </div>
  );
}
