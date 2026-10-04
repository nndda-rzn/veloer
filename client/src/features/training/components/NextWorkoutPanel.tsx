import { Play, SkipForward, Check, Plus, LayoutTemplate } from 'lucide-react';
import type { TrainingWorkout } from '../types/training';
import { WORKOUT_TYPE_COLORS } from '../types/training';
import { isStrengthType } from '../lib/discipline';
import { WorkoutTypeChip } from './WorkoutTypeChip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NextWorkoutPanelProps {
  workout: TrainingWorkout | null;
  onOpen: (workout: TrainingWorkout) => void;
  onMarkComplete: (id: string) => void;
  onMarkSkipped: (id: string) => void;
  /** Opens the workout form (the plan page has no other add affordance). */
  onAddSession: () => void;
  onBrowseTemplates: () => void;
}

function relativeDay(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1) return `In ${diff} days`;
  if (diff === -1) return 'Yesterday';
  return `${Math.abs(diff)} days ago`;
}

export function NextWorkoutPanel({
  workout,
  onOpen,
  onMarkComplete,
  onMarkSkipped,
  onAddSession,
  onBrowseTemplates,
}: NextWorkoutPanelProps) {
  if (!workout) {
    return (
      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Next workout
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing scheduled. Add a session or start from a template.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={onAddSession}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add session
            </Button>
            <Button variant="outline" onClick={onBrowseTemplates}>
              <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
              Browse templates
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const color = WORKOUT_TYPE_COLORS[workout.workout_type];
  const isStrength = isStrengthType(workout.workout_type);

  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Next workout · {relativeDay(workout.scheduled_date)}
            </p>
            <button
              type="button"
              onClick={() => onOpen(workout)}
              className="mt-1 block truncate text-left text-lg font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {workout.title}
            </button>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <WorkoutTypeChip type={workout.workout_type} />
              {workout.target_duration_minutes ? (
                <span>· {workout.target_duration_minutes} min</span>
              ) : null}
              {!isStrength && workout.target_tss ? <span>· TSS {workout.target_tss}</span> : null}
              {!isStrength && workout.target_avg_power ? (
                <span>· {workout.target_avg_power}W</span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onMarkComplete(workout.id)}>
            <Check className="h-4 w-4" aria-hidden="true" />
            Mark complete
          </Button>
          <Button variant="outline" onClick={() => onMarkSkipped(workout.id)}>
            <SkipForward className="h-4 w-4" aria-hidden="true" />
            Skip
          </Button>
          <Button variant="ghost" onClick={() => onOpen(workout)}>
            <Play className="h-4 w-4" aria-hidden="true" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
