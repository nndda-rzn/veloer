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
          <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
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
            <TableCell className="whitespace-nowrap text-sm text-gray-500">
              {formatDate(tx.date)}
            </TableCell>
            <TableCell className="text-sm text-gray-900">
              {tx.description || tx.merchant || '—'}
            </TableCell>
            <TableCell>
              <Badge>{categoryLabels[tx.category]}</Badge>
            </TableCell>
            <TableCell
              className={`whitespace-nowrap text-right text-sm font-medium tabular-nums ${
                tx.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {tx.type === 'income' ? '+' : '-'}
              {formatIDR(tx.amount)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(tx)}
                className="text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
