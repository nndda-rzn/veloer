import { useState } from 'react';
import type { TransactionFormData } from '../types/finance';
import { Modal, Button } from '@/shared/components/ui';

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

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

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
    <Modal open onClose={onCancel} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className={labelClass}>
              Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
              }
              className={inputClass}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
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
              className={inputClass}
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
            <label htmlFor="amount" className={labelClass}>
              Amount (IDR) *
            </label>
            <input
              id="amount"
              type="number"
              required
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="date" className={labelClass}>
              Date *
            </label>
            <input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <input
            id="description"
            type="text"
            value={formData.description ?? ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="merchant" className={labelClass}>
              Merchant
            </label>
            <input
              id="merchant"
              type="text"
              value={formData.merchant ?? ''}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="payment_method" className={labelClass}>
              Payment Method
            </label>
            <input
              id="payment_method"
              type="text"
              value={formData.payment_method ?? ''}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
