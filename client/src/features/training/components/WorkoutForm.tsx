import { useState } from 'react';
import type { TrainingWorkout, WorkoutFormData, WorkoutType } from '../types/training';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../types/training';

interface WorkoutFormProps {
  workout?: TrainingWorkout;
  defaultDate?: string;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  onCancel: () => void;
}

const workoutTypes: WorkoutType[] = [
  'recovery',
  'endurance',
  'tempo',
  'sweet_spot',
  'threshold',
  'vo2max',
  'anaerobic',
  'sprint',
  'race',
  'interval',
];

export function WorkoutForm({ workout, defaultDate, onSubmit, onCancel }: WorkoutFormProps) {
  const [type, setType] = useState<WorkoutType>(workout?.workout_type ?? 'endurance');
  const [title, setTitle] = useState(workout?.title ?? '');
  const [description, setDescription] = useState(workout?.description ?? '');
  const [scheduledDate, setScheduledDate] = useState(workout?.scheduled_date ?? defaultDate ?? '');
  const [durationMin, setDurationMin] = useState(workout?.target_duration_minutes ?? 60);
  const [targetTss, setTargetTss] = useState(workout?.target_tss ?? '');
  const [targetPower, setTargetPower] = useState(workout?.target_avg_power ?? '');
  const [targetHr, setTargetHr] = useState(workout?.target_avg_hr ?? '');
  const [cadenceMin, setCadenceMin] = useState(workout?.target_cadence_min ?? '');
  const [cadenceMax, setCadenceMax] = useState(workout?.target_cadence_max ?? '');
  const [showIntervals, setShowIntervals] = useState(
    !!(workout?.intervals_count && workout.intervals_count > 0),
  );
  const [intervalCount, setIntervalCount] = useState(workout?.intervals_count ?? 5);
  const [intervalDuration, setIntervalDuration] = useState(
    workout?.interval_duration_seconds ?? 240,
  );
  const [intervalPower, setIntervalPower] = useState(workout?.interval_power_pct_ftp ?? 105);
  const [restDuration, setRestDuration] = useState(workout?.rest_duration_seconds ?? 120);
  const [restPower, setRestPower] = useState(workout?.rest_power_pct_ftp ?? 55);
  const [notes, setNotes] = useState(workout?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledDate) {
      setError('Title and scheduled date are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        scheduled_date: scheduledDate,
        workout_type: type,
        title: title.trim(),
        description: description.trim() || null,
        target_duration_minutes: durationMin || null,
        target_tss: targetTss ? Number(targetTss) : null,
        target_avg_power: targetPower ? Number(targetPower) : null,
        target_avg_hr: targetHr ? Number(targetHr) : null,
        target_cadence_min: cadenceMin ? Number(cadenceMin) : null,
        target_cadence_max: cadenceMax ? Number(cadenceMax) : null,
        intervals_count: showIntervals ? intervalCount : null,
        interval_duration_seconds: showIntervals ? intervalDuration : null,
        interval_power_pct_ftp: showIntervals ? intervalPower : null,
        rest_duration_seconds: showIntervals ? restDuration : null,
        rest_power_pct_ftp: showIntervals ? restPower : null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {workout ? 'Edit Workout' : 'New Workout'}
        </h2>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workout type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: WORKOUT_TYPE_COLORS[t],
                    opacity: type === t ? 1 : 0.35,
                  }}
                >
                  {WORKOUT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2x20 Threshold"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Duration (min)</label>
              <input
                type="number"
                min={10}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Target TSS</label>
              <input
                type="number"
                min={0}
                value={targetTss}
                onChange={(e) => setTargetTss(e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Power (W)</label>
              <input
                type="number"
                min={0}
                value={targetPower}
                onChange={(e) => setTargetPower(e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">HR (bpm)</label>
              <input
                type="number"
                value={targetHr}
                onChange={(e) => setTargetHr(e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cadence min</label>
              <input
                type="number"
                value={cadenceMin}
                onChange={(e) => setCadenceMin(e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cadence max</label>
              <input
                type="number"
                value={cadenceMax}
                onChange={(e) => setCadenceMax(e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Interval builder */}
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={showIntervals}
                onChange={(e) => setShowIntervals(e.target.checked)}
                className="rounded"
              />
              Interval structure
            </label>
            {showIntervals && (
              <div className="mt-2 grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Reps</label>
                  <input
                    type="number"
                    min={1}
                    value={intervalCount}
                    onChange={(e) => setIntervalCount(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">On (sec)</label>
                  <input
                    type="number"
                    min={10}
                    value={intervalDuration}
                    onChange={(e) => setIntervalDuration(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">On % FTP</label>
                  <input
                    type="number"
                    min={50}
                    max={200}
                    value={intervalPower}
                    onChange={(e) => setIntervalPower(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Rest (sec)</label>
                  <input
                    type="number"
                    min={10}
                    value={restDuration}
                    onChange={(e) => setRestDuration(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Rest % FTP</label>
                  <input
                    type="number"
                    min={20}
                    max={100}
                    value={restPower}
                    onChange={(e) => setRestPower(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
              {submitting ? 'Saving...' : workout ? 'Save Changes' : 'Add Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
