import { useState } from 'react';
import type { Goal } from '../types/goal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GOAL_TYPE_LABELS } from '../lib/goal-progress';

interface LogProgressDialogProps {
  goal: Goal;
  onSubmit: (delta: number) => Promise<void>;
  onCancel: () => void;
}

export function LogProgressDialog({ goal, onSubmit, onCancel }: LogProgressDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [mode, setMode] = useState<'add' | 'set'>('add');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unit = goal.unit || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = mode === 'add' ? amount : amount - goal.current_value;
    if (!Number.isFinite(delta) || delta === 0) {
      setError('Enter a value that changes the total.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(delta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress.');
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log progress</DialogTitle>
          <DialogDescription>
            {goal.title || `${GOAL_TYPE_LABELS[goal.type]} goal`} · currently{' '}
            {goal.current_value.toFixed(1)} {unit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'add' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('add')}
            >
              Add to total
            </Button>
            <Button
              type="button"
              variant={mode === 'set' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('set')}
            >
              Set total
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">
              {mode === 'add' ? `Amount to add (${unit})` : `New total (${unit})`}
            </Label>
            <Input
              id="amount"
              type="number"
              step="any"
              autoFocus
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              This is stored as a manual adjustment and is never overwritten by recalculation.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : mode === 'add' ? 'Add' : 'Set'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
