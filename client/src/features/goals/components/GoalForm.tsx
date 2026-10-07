import { useState } from 'react';
import type { Goal, GoalFormData } from '../types/goal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { selectClass } from '@/shared/lib/form-styles';

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: (data: GoalFormData) => Promise<void>;
  onCancel: () => void;
}

const goalTypes: { value: GoalFormData['type']; label: string; unit: string }[] = [
  { value: 'distance', label: 'Distance', unit: 'km' },
  { value: 'time', label: 'Time', unit: 'hours' },
  { value: 'elevation', label: 'Elevation', unit: 'm' },
  { value: 'activities_count', label: 'Activities count', unit: 'count' },
];

const periods: { value: GoalFormData['period']; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom range' },
];

interface QuickTemplate {
  label: string;
  type: GoalFormData['type'];
  target_value: number;
  unit: string;
  period: GoalFormData['period'];
  title: string;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    label: '500 km / month',
    type: 'distance',
    target_value: 500,
    unit: 'km',
    period: 'monthly',
    title: 'Ride 500 km this month',
  },
  {
    label: '2000 km / year',
    type: 'distance',
    target_value: 2000,
    unit: 'km',
    period: 'yearly',
    title: 'Ride 2000 km this year',
  },
  {
    label: '10 h / week',
    type: 'time',
    target_value: 10,
    unit: 'hours',
    period: 'weekly',
    title: 'Train 10 hours this week',
  },
  {
    label: '100 rides / year',
    type: 'activities_count',
    target_value: 100,
    unit: 'count',
    period: 'yearly',
    title: '100 rides this year',
  },
];

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Compute start/end dates for a period, anchored on today. */
function periodRange(period: GoalFormData['period']): { start: string; end: string } {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  switch (period) {
    case 'weekly': {
      const dow = (today.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(y, m, today.getDate() - dow);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: toISO(monday), end: toISO(sunday) };
    }
    case 'monthly':
      return { start: toISO(new Date(y, m, 1)), end: toISO(new Date(y, m + 1, 0)) };
    case 'yearly':
      return { start: toISO(new Date(y, 0, 1)), end: toISO(new Date(y, 11, 31)) };
    default:
      return { start: toISO(today), end: toISO(new Date(y, m, today.getDate() + 30)) };
  }
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const isEdit = Boolean(goal);
  const [formData, setFormData] = useState<GoalFormData>(() => {
    if (goal) {
      return {
        type: goal.type,
        target_value: goal.target_value,
        unit: goal.unit,
        period: goal.period,
        start_date: goal.start_date,
        end_date: goal.end_date,
        title: goal.title ?? '',
        description: goal.description ?? '',
      };
    }
    const range = periodRange('monthly');
    return {
      type: 'distance',
      target_value: 100,
      unit: 'km',
      period: 'monthly',
      start_date: range.start,
      end_date: range.end,
      title: '',
      description: '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (type: GoalFormData['type']) => {
    const found = goalTypes.find((t) => t.value === type);
    setFormData((f) => ({ ...f, type, unit: found?.unit ?? f.unit }));
  };

  const handlePeriodChange = (period: GoalFormData['period']) => {
    // Auto-fill the date range for fixed periods; leave custom untouched.
    if (period === 'custom') {
      setFormData((f) => ({ ...f, period }));
    } else {
      const range = periodRange(period);
      setFormData((f) => ({ ...f, period, start_date: range.start, end_date: range.end }));
    }
  };

  const applyTemplate = (tpl: QuickTemplate) => {
    const range = periodRange(tpl.period);
    setFormData((f) => ({
      ...f,
      type: tpl.type,
      target_value: tpl.target_value,
      unit: tpl.unit,
      period: tpl.period,
      title: f.title || tpl.title,
      start_date: range.start,
      end_date: range.end,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.end_date < formData.start_date) {
      setError('End date must be after start date.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...formData,
        title: formData.title || null,
        description: formData.description || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal.');
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Quick templates</Label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((tpl) => (
                  <Button
                    key={tpl.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(tpl)}
                  >
                    {tpl.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
                onChange={(e) => handlePeriodChange(e.target.value as GoalFormData['period'])}
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
              <Label htmlFor="start_date">Start date *</Label>
              <Input
                id="start_date"
                type="date"
                required
                value={formData.start_date}
                disabled={formData.period !== 'custom'}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">End date *</Label>
              <Input
                id="end_date"
                type="date"
                required
                value={formData.end_date}
                disabled={formData.period !== 'custom'}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          {formData.period !== 'custom' && (
            <p className="text-xs text-muted-foreground">
              Dates are set automatically from the period. Choose “Custom range” to edit them.
            </p>
          )}

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
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
