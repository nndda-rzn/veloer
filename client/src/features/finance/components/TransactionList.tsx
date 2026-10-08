import { useMemo, useState } from 'react';
import type { Transaction } from '../types/finance';
import { formatIDR, formatDate } from '@/shared/lib/utils';
import { CATEGORY_LABELS } from '../lib/finance-meta';
import { useTableControls } from '@/shared/lib/useTableControls';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState, TableToolbar, SortableHead, TablePagination } from '@/shared/components/ui';
import { selectClass } from '@/shared/lib/form-styles';
import { Receipt } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
}

type SortKey = 'date' | 'description' | 'category' | 'amount';
export function TransactionList({ transactions, loading, onDelete, onEdit }: TransactionListProps) {
  const [category, setCategory] = useState<'all' | Transaction['category']>('all');
  const [type, setType] = useState<'all' | Transaction['type']>('all');

  const rows = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (category === 'all' || t.category === category) && (type === 'all' || t.type === type),
      ),
    [transactions, category, type],
  );

  const comparators = useMemo(
    () => ({
      date: (a: Transaction, b: Transaction) => a.date.localeCompare(b.date),
      description: (a: Transaction, b: Transaction) =>
        (a.description ?? a.merchant ?? '').localeCompare(b.description ?? b.merchant ?? ''),
      category: (a: Transaction, b: Transaction) => a.category.localeCompare(b.category),
      amount: (a: Transaction, b: Transaction) => a.amount - b.amount,
    }),
    [],
  );

  const searchText = (t: Transaction) =>
    `${t.description ?? ''} ${t.merchant ?? ''} ${t.category} ${t.payment_method ?? ''}`;

  const table = useTableControls<Transaction, SortKey>({
    rows,
    searchText,
    comparators,
    initialSort: { key: 'date', dir: 'desc' },
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Add your first transaction to track your cycling finances."
      />
    );
  }

  const filters = (
    <>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as typeof type)}
        aria-label="Filter by type"
        className={`${selectClass} h-9 w-auto`}
      >
        <option value="all">All types</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
        aria-label="Filter by category"
        className={`${selectClass} h-9 w-auto`}
      >
        <option value="all">All categories</option>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </>
  );

  return (
    <div className="space-y-3">
      <TableToolbar
        query={table.query}
        onQueryChange={table.setQuery}
        placeholder="Search transactions…"
        filters={filters}
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        total={table.total}
      />

      {table.total === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No matching transactions"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label="Date"
                sortKey="date"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
              />
              <SortableHead
                label="Description"
                sortKey="description"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
              />
              <SortableHead
                label="Category"
                sortKey="category"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
              />
              <SortableHead
                label="Amount"
                sortKey="amount"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
                align="right"
              />
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.pageRows.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {tx.description || tx.merchant || '–'}
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{CATEGORY_LABELS[tx.category]}</Badge>
                </TableCell>
                <TableCell
                  className={`whitespace-nowrap text-right text-sm font-medium tabular-nums ${
                    tx.type === 'income' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatIDR(tx.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(tx)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(tx)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TablePagination page={table.page} pageCount={table.pageCount} onPageChange={table.setPage} />
    </div>
  );
}
