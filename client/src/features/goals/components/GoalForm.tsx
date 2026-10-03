import { useState } from 'react';
import type { GoalFormData } from '../types/goal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { selectClass } from '@/shared/lib/form-styles';

interface GoalFormProps {
  onSubmit: (data: GoalFormData) => Promise<void>;
  onCancel: () => void;
}

const goalTypes: { value: GoalFormData['type']; label: string; unit: string }[] = [
  { value: 'distance', label: 'Distance', unit: 'km' },
  { value: 'time', label: 'Time', unit: 'hours' },
  { value: 'elevation', label: 'Elevation', unit: 'm' },
  { value: 'activities_count', label: 'Activities Count', unit: 'count' },
];

const periods: { value: GoalFormData['period']; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    type: 'distance',
    target_value: 100,
    unit: 'km',
    period: 'monthly',
    start_date: getDateOffset(0),
    end_date: getDateOffset(30),
    title: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (type: GoalFormData['type']) => {
    const found = goalTypes.find((t) => t.value === type);
    setFormData({ ...formData, type, unit: found?.unit ?? 'km' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        title: formData.title || null,
        description: formData.description || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={formData.title ?? ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Ride 500km this month"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as GoalFormData['type'])}
                className={selectClass}
              >
                {goalTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="period">Period *</Label>
              <select
                id="period"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value as GoalFormData['period'] })
                }
                className={selectClass}
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="target_value">Target *</Label>
              <Input
                id="target_value"
                type="number"
                required
                min="1"
                value={formData.target_value || ''}
                onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
