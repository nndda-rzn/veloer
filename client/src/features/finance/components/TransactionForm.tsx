import { useState } from 'react';
import type { TransactionFormData } from '../types/finance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { selectClass } from '@/shared/lib/form-styles';

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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
                }
                className={selectClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as TransactionFormData['category'],
                  })
                }
                className={selectClass}
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
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (IDR) *</Label>
              <Input
                id="amount"
                type="number"
                required
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="merchant">Merchant</Label>
              <Input
                id="merchant"
                type="text"
                value={formData.merchant ?? ''}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Input
                id="payment_method"
                type="text"
                value={formData.payment_method ?? ''}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
