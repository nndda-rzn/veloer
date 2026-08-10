import { useState } from 'react';
import type { TrainingPlan, TrainingPlanFormData, PlanGoalType } from '../types/training';
import { PLAN_GOAL_TYPE_LABELS } from '../types/training';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {plan ? 'Edit Training Plan' : 'New Training Plan'}
        </h2>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FTP Builder 6 Weeks"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Goal Type</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as PlanGoalType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {goalTypes.map((type) => (
                <option key={type} value={type}>
                  {PLAN_GOAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              FTP Baseline (watts)
            </label>
            <input
              type="number"
              min={50}
              max={600}
              value={ftpBaseline}
              onChange={(e) => setFtpBaseline(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Your FTP at the start of this plan. Used for TSS targets.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What do you want to achieve?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? 'Saving...' : plan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
