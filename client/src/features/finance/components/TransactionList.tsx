import type { Transaction } from '../types/finance';
import { formatIDR, formatDate } from '@/shared/lib/utils';
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
import { EmptyState } from '@/shared/components/ui';
import { Receipt } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (tx: Transaction) => void;
}

const categoryLabels: Record<Transaction['category'], string> = {
  gear: 'Gear',
  maintenance: 'Maintenance',
  event: 'Event',
  nutrition: 'Nutrition',
  other: 'Other',
};

export function TransactionList({ transactions, loading, onDelete }: TransactionListProps) {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {formatDate(tx.date)}
            </TableCell>
            <TableCell className="text-sm text-foreground">
              {tx.description || tx.merchant || '–'}
            </TableCell>
            <TableCell>
              <Badge variant="neutral">{categoryLabels[tx.category]}</Badge>
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
              <Button variant="ghost" size="sm" onClick={() => onDelete(tx)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
