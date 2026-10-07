import { useState } from 'react';
import type { TrainingPlan, TrainingPlanFormData, PlanGoalType } from '../types/training';
import { PLAN_GOAL_TYPE_LABELS } from '../types/training';
import { selectClass } from '@/shared/lib/form-styles';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { FormField } from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TrainingPlanFormProps {
  plan?: TrainingPlan;
  defaultFtp?: number;
  onSubmit: (data: TrainingPlanFormData) => Promise<void>;
  onCancel: () => void;
}

const goalTypes: PlanGoalType[] = ['ftp', 'endurance', 'century', 'gran_fondo', 'custom'];

export function TrainingPlanForm({
  plan,
  defaultFtp = 250,
  onSubmit,
  onCancel,
}: TrainingPlanFormProps) {
  const [title, setTitle] = useState(plan?.title ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  const [goalType, setGoalType] = useState<PlanGoalType>(plan?.goal_type ?? 'custom');
  const [startDate, setStartDate] = useState(plan?.start_date ?? '');
  const [endDate, setEndDate] = useState(plan?.end_date ?? '');
  const [ftpBaseline, setFtpBaseline] = useState(plan?.ftp_baseline ?? defaultFtp);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      setError('Title, start date, and end date are required.');
      return;
    }
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        goal_type: goalType,
        start_date: startDate,
        end_date: endDate,
        ftp_baseline: ftpBaseline,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan.');
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Training Plan' : 'New Training Plan'}</DialogTitle>
          <DialogDescription>Set up a training plan with FTP-based targets.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="error" live="assertive">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan-title">Title</Label>
            <Input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FTP Builder 6 Weeks"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-type">Goal Type</Label>
            <select
              id="goal-type"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as PlanGoalType)}
              className={selectClass}
            >
              {goalTypes.map((type) => (
                <option key={type} value={type}>
                  {PLAN_GOAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-start">Start Date</Label>
              <Input
                id="plan-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-end">End Date</Label>
              <Input
                id="plan-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <FormField
            label="FTP Baseline (watts)"
            htmlFor="plan-ftp"
            hint="Your FTP at the start of this plan. Used for TSS targets."
          >
            <Input
              id="plan-ftp"
              type="number"
              min={50}
              max={600}
              value={ftpBaseline}
              onChange={(e) => setFtpBaseline(Number(e.target.value))}
            />
          </FormField>

          <div className="space-y-1.5">
            <Label htmlFor="plan-desc">Description (optional)</Label>
            <Textarea
              id="plan-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What do you want to achieve?"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Saving…' : plan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
