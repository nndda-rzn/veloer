import { useState } from 'react';
import type { TransactionFormData } from '../types/finance';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

const categories: { value: string; label: string }[] = [
  { value: 'gear', label: 'Gear' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'event', label: 'Event' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'other', label: 'Other' },
];

export function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    category: 'gear',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
    payment_method: '',
    merchant: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        description: formData.description || null,
        payment_method: formData.payment_method || null,
        merchant: formData.merchant || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Add Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
                Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as TransactionFormData['category'],
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
                Amount (IDR) *
              </label>
              <input
                id="amount"
                type="number"
                required
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="merchant" className="mb-1 block text-sm font-medium text-gray-700">
                Merchant
              </label>
              <input
                id="merchant"
                type="text"
                value={formData.merchant ?? ''}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="payment_method"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Payment Method
              </label>
              <input
                id="payment_method"
                type="text"
                value={formData.payment_method ?? ''}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
