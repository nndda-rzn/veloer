import { useState } from 'react';
import type { Budget, BudgetFormData } from '../types/finance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField } from '@/shared/components/ui';
import { selectClass } from '@/shared/lib/form-styles';

interface BudgetFormProps {
  budget?: Budget | null;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

const categories: { value: BudgetFormData['category']; label: string }[] = [
  { value: 'gear', label: 'Gear' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'event', label: 'Event' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'other', label: 'Other' },
  { value: 'total', label: 'Total (all categories)' },
];

const today = () => new Date().toISOString().slice(0, 10);

export function BudgetForm({ budget, onSubmit, onCancel }: BudgetFormProps) {
  const [formData, setFormData] = useState<BudgetFormData>(() =>
    budget
      ? {
          category: budget.category,
          amount: budget.amount,
          period: budget.period,
          start_date: budget.start_date,
          end_date: budget.end_date,
        }
      : {
          category: 'gear',
          amount: 0,
          period: 'monthly',
          start_date: today(),
          end_date: null,
        },
  );
  const [saving, setSaving] = useState(false);
  const isEdit = budget != null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ ...formData, end_date: formData.end_date || null });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" htmlFor="budget-category">
              <select
                id="budget-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as BudgetFormData['category'],
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
            </FormField>
            <FormField label="Period" htmlFor="budget-period">
              <select
                id="budget-period"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value as BudgetFormData['period'] })
                }
                className={selectClass}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </FormField>
          </div>

          <FormField label="Amount (IDR)" htmlFor="budget-amount">
            <Input
              id="budget-amount"
              type="number"
              required
              min="1"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date" htmlFor="budget-start">
              <Input
                id="budget-start"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </FormField>
            <FormField label="End date" htmlFor="budget-end" optional>
              <Input
                id="budget-end"
                type="date"
                value={formData.end_date ?? ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
