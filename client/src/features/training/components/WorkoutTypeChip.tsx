import { Dumbbell } from 'lucide-react';
import type { WorkoutType } from '../types/training';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS } from '../types/training';
import { isStrengthType } from '../lib/discipline';
import { cn } from '@/lib/utils';

interface WorkoutTypeChipProps {
  type: WorkoutType;
  className?: string;
}

/**
 * The one chip used everywhere a workout type is shown. Replaces the three
 * hand-rolled chips that had drifted apart. Strength types carry a Dumbbell
 * icon so the discipline is legible without relying on the colour alone.
 */
export function WorkoutTypeChip({ type, className }: WorkoutTypeChipProps) {
  const color = WORKOUT_TYPE_COLORS[type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {isStrengthType(type) && <Dumbbell className="h-3 w-3" aria-hidden="true" />}
      {WORKOUT_TYPE_LABELS[type]}
    </span>
  );
}
