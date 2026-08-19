import type { Transaction } from '../types/finance';
import { formatIDR, formatDate } from '@/shared/lib/utils';

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
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Category
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Amount
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {formatDate(tx.date)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {tx.description || tx.merchant || '—'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {categoryLabels[tx.category]}
                </span>
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatIDR(tx.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onDelete(tx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
