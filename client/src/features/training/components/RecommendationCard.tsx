import type { WorkoutRecommendation } from '../types/training';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../types/training';

interface RecommendationCardProps {
  recommendation: WorkoutRecommendation;
  onAddToPlan?: (rec: WorkoutRecommendation) => void;
}

export function RecommendationCard({ recommendation: rec, onAddToPlan }: RecommendationCardProps) {
  const color = WORKOUT_TYPE_COLORS[rec.workout_type];
  const { metrics } = rec;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span
            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {WORKOUT_TYPE_LABELS[rec.workout_type]}
          </span>
          <h3 className="mt-1 font-semibold text-gray-900">{rec.title}</h3>
          <p className="text-sm text-gray-500">{rec.description}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>{rec.target_duration_minutes} min</div>
          <div>TSS {rec.target_tss}</div>
          {rec.target_avg_power && <div>{rec.target_avg_power}W</div>}
        </div>
      </div>

      {/* Reason */}
      <div className="mb-3 rounded-lg bg-blue-50 p-2 text-xs text-blue-700">{rec.reason}</div>

      {/* Interval structure */}
      {rec.intervals && (
        <div className="mb-3 text-xs text-gray-500">
          {rec.intervals.count}×{rec.intervals.duration_seconds}s @ {rec.intervals.power_pct_ftp}%
          FTP — {rec.intervals.rest_seconds}s rest @ {rec.intervals.rest_pct_ftp}% FTP
        </div>
      )}

      {/* CTL/ATL/TSB badges */}
      <div className="mb-3 flex gap-2 text-xs">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">CTL {metrics.ctl}</span>
        <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-700">ATL {metrics.atl}</span>
        <span
          className={`rounded px-2 py-0.5 ${
            metrics.tsb >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          TSB {metrics.tsb > 0 ? '+' : ''}
          {metrics.tsb}
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
          {metrics.weekly_hours}h this week
        </span>
      </div>

      {onAddToPlan && (
        <button
          onClick={() => onAddToPlan(rec)}
          className="w-full rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-50"
        >
          Add to Plan
        </button>
      )}
    </div>
  );
}
