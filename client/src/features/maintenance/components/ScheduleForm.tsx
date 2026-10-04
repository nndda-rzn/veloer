import { useState } from 'react';
import type { MaintenanceSchedule, ScheduleFormData } from '../types/maintenance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField } from '@/shared/components/ui';
import { selectClass } from '@/shared/lib/form-styles';

interface ScheduleFormProps {
  bikeId: string;
  /** Components available to attach the reminder to. */
  components: { id: string; name: string }[];
  schedule?: MaintenanceSchedule;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel: () => void;
}

/**
 * Create or edit a reminder. An interval is what makes it recur; the optional
 * next-due fields are a manual override for a one-off.
 */
export function ScheduleForm({
  bikeId,
  components,
  schedule,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [taskName, setTaskName] = useState(schedule?.task_name ?? '');
  const [componentId, setComponentId] = useState(schedule?.component_id ?? '');
  const [intervalKm, setIntervalKm] = useState<number | ''>(schedule?.interval_km ?? '');
  const [intervalDays, setIntervalDays] = useState<number | ''>(schedule?.interval_days ?? '');
  const [nextDueKm, setNextDueKm] = useState<number | ''>(schedule?.next_due_km ?? '');
  const [nextDueDate, setNextDueDate] = useState(schedule?.next_due_date?.slice(0, 10) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Give the reminder a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        bike_id: bikeId,
        component_id: componentId || null,
        task_name: taskName.trim(),
        interval_km: intervalKm === '' ? null : Number(intervalKm),
        interval_days: intervalDays === '' ? null : Number(intervalDays),
        next_due_km: nextDueKm === '' ? null : Number(nextDueKm),
        next_due_date: nextDueDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the reminder.');
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit reminder' : 'New reminder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <FormField label="Task" htmlFor="schedule-task">
            <Input
              id="schedule-task"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Chain lube"
            />
          </FormField>

          {components.length > 0 && (
            <FormField label="Component" htmlFor="schedule-component" optional>
              <select
                id="schedule-component"
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
                className={selectClass}
              >
                <option value="">Whole bike</option>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Every (km)"
              htmlFor="schedule-km"
              optional
              hint="Recurs at this distance."
            >
              <Input
                id="schedule-km"
                type="number"
                min={1}
                value={intervalKm}
                onChange={(e) => setIntervalKm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="–"
              />
            </FormField>
            <FormField
              label="Every (days)"
              htmlFor="schedule-days"
              optional
              hint="Recurs after this long."
            >
              <Input
                id="schedule-days"
                type="number"
                min={1}
                value={intervalDays}
                onChange={(e) =>
                  setIntervalDays(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="–"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Next due (km)"
              htmlFor="schedule-due-km"
              optional
              hint="Override the computed distance."
            >
              <Input
                id="schedule-due-km"
                type="number"
                min={0}
                value={nextDueKm}
                onChange={(e) => setNextDueKm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="–"
              />
            </FormField>
            <FormField label="Next due (date)" htmlFor="schedule-due-date" optional>
              <Input
                id="schedule-due-date"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : schedule ? 'Save changes' : 'Add reminder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
