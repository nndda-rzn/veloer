import type { WorkoutRecommendation } from '../types/training';
import { WorkoutTypeChip } from './WorkoutTypeChip';
import { Button } from '@/components/ui/button';

interface RecommendationCardProps {
  recommendation: WorkoutRecommendation;
  onAddToPlan?: (rec: WorkoutRecommendation) => void;
}

export function RecommendationCard({ recommendation: rec, onAddToPlan }: RecommendationCardProps) {
  const { metrics } = rec;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <WorkoutTypeChip type={rec.workout_type} />
          <h3 className="mt-1.5 font-semibold text-foreground">{rec.title}</h3>
          <p className="text-sm text-muted-foreground">{rec.description}</p>
        </div>
        <div className="flex-shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          <div>{rec.target_duration_minutes} min</div>
          <div>TSS {rec.target_tss}</div>
          {rec.target_avg_power && <div>{rec.target_avg_power}W</div>}
        </div>
      </div>

      {/* Reason */}
      <div className="mb-3 rounded-lg bg-secondary p-2 text-xs text-muted-foreground">
        {rec.reason}
      </div>

      {/* Interval structure */}
      {rec.intervals && (
        <div className="mb-3 text-xs tabular-nums text-muted-foreground">
          {rec.intervals.count}×{rec.intervals.duration_seconds}s @ {rec.intervals.power_pct_ftp}%
          FTP · {rec.intervals.rest_seconds}s rest @ {rec.intervals.rest_pct_ftp}% FTP
        </div>
      )}

      {/* CTL/ATL/TSB badges */}
      <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-md bg-secondary px-2 py-0.5 tabular-nums text-muted-foreground">
          CTL {metrics.ctl}
        </span>
        <span className="rounded-md bg-secondary px-2 py-0.5 tabular-nums text-muted-foreground">
          ATL {metrics.atl}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 tabular-nums ${
            metrics.tsb >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
          }`}
        >
          TSB {metrics.tsb > 0 ? '+' : ''}
          {metrics.tsb}
        </span>
        <span className="rounded-md bg-secondary px-2 py-0.5 tabular-nums text-muted-foreground">
          {metrics.weekly_hours}h this week
        </span>
      </div>

      {onAddToPlan && (
        <Button variant="outline" className="w-full" onClick={() => onAddToPlan(rec)}>
          Add to today
        </Button>
      )}
    </div>
  );
}
