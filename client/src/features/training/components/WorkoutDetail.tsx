import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { TrainingWorkout, WorkoutStatus } from '../types/training';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../types/training';
import { formatDate, formatEnumLabel } from '@/shared/lib/utils';

interface WorkoutDetailProps {
  workout: TrainingWorkout;
  onClose: () => void;
  onMarkComplete: (id: string) => Promise<void>;
  onMarkSkipped: (id: string) => Promise<void>;
  onEdit: (workout: TrainingWorkout) => void;
  onDelete: (id: string) => Promise<void>;
  onLinkActivity: (workout: TrainingWorkout) => void;
}

const statusBadge: Record<WorkoutStatus, string> = {
  planned: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-yellow-100 text-yellow-700',
  missed: 'bg-gray-100 text-gray-600',
};

function MetricRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function WorkoutDetail({
  workout,
  onClose,
  onMarkComplete,
  onMarkSkipped,
  onEdit,
  onDelete,
  onLinkActivity,
}: WorkoutDetailProps) {
  const color = WORKOUT_TYPE_COLORS[workout.workout_type];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button
        className="absolute inset-0 w-full cursor-default"
        onClick={onClose}
        aria-label="Close workout detail"
      />
      <div
        className="relative h-full w-full max-w-sm overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4" style={{ borderBottom: `3px solid ${color}` }}>
          <div className="flex items-start justify-between">
            <div>
              <span
                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {WORKOUT_TYPE_LABELS[workout.workout_type]}
              </span>
              <h2 className="mt-1 text-lg font-bold text-gray-900">{workout.title}</h2>
              <p className="text-sm text-gray-500">{formatDate(workout.scheduled_date)}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[workout.status]}`}
          >
            {formatEnumLabel(workout.status)}
          </span>
        </div>

        <div className="space-y-4 p-4">
          {workout.description && <p className="text-sm text-gray-600">{workout.description}</p>}

          {/* Target metrics */}
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Targets
            </h3>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-gray-50 px-3">
              <MetricRow
                label="Duration"
                value={
                  workout.target_duration_minutes ? `${workout.target_duration_minutes} min` : null
                }
              />
              <MetricRow label="TSS" value={workout.target_tss} />
              <MetricRow
                label="Power"
                value={workout.target_avg_power ? `${workout.target_avg_power} W` : null}
              />
              <MetricRow
                label="HR"
                value={workout.target_avg_hr ? `${workout.target_avg_hr} bpm` : null}
              />
              <MetricRow
                label="Cadence"
                value={
                  workout.target_cadence_min && workout.target_cadence_max
                    ? `${workout.target_cadence_min}–${workout.target_cadence_max} rpm`
                    : null
                }
              />
            </div>
          </div>

          {/* Interval structure */}
          {workout.intervals_count && workout.intervals_count > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Intervals
              </h3>
              <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MetricRow label="Reps" value={workout.intervals_count} />
                <MetricRow
                  label="On"
                  value={
                    workout.interval_duration_seconds
                      ? `${workout.interval_duration_seconds}s @ ${workout.interval_power_pct_ftp}% FTP`
                      : null
                  }
                />
                <MetricRow
                  label="Rest"
                  value={
                    workout.rest_duration_seconds
                      ? `${workout.rest_duration_seconds}s @ ${workout.rest_power_pct_ftp}% FTP`
                      : null
                  }
                />
              </div>
            </div>
          )}

          {/* Actual results */}
          {workout.status === 'completed' && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actual
              </h3>
              <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MetricRow
                  label="Duration"
                  value={
                    workout.actual_duration_minutes
                      ? `${workout.actual_duration_minutes} min`
                      : null
                  }
                />
                <MetricRow label="TSS" value={workout.actual_tss ?? null} />
                {workout.actual_activity_id && (
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-gray-500">Activity</span>
                    <Link
                      to={`/activities/${workout.actual_activity_id}`}
                      className="font-medium text-primary hover:underline"
                      onClick={onClose}
                    >
                      View Activity →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {workout.notes && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Notes
              </h3>
              <p className="text-sm text-gray-600">{workout.notes}</p>
            </div>
          )}

          {/* Actions */}
          {workout.status === 'planned' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onMarkComplete(workout.id)}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Mark Complete
              </button>
              <button
                onClick={() => onMarkSkipped(workout.id)}
                className="w-full rounded-lg border border-yellow-400 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
              >
                Skip
              </button>
            </div>
          )}

          <button
            onClick={() => onLinkActivity(workout)}
            className="w-full rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50"
          >
            Link Activity
          </button>

          <div className="flex gap-2 border-t border-gray-100 pt-2">
            <button
              onClick={() => onEdit(workout)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(workout.id)}
              className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
