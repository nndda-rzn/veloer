import { Bike, Dumbbell } from 'lucide-react';
import type { Discipline } from '../types/training';
import { cn } from '@/lib/utils';

interface DisciplineToggleProps {
  value: Discipline;
  onChange: (discipline: Discipline) => void;
}

const OPTIONS: { value: Discipline; label: string; Icon: typeof Bike }[] = [
  { value: 'cycling', label: 'Cycling', Icon: Bike },
  { value: 'strength', label: 'Strength', Icon: Dumbbell },
];

/**
 * Segmented control for the workout discipline. Choosing the discipline is the
 * first decision, because it decides which fields the rest of the form shows.
 */
export function DisciplineToggle({ value, onChange }: DisciplineToggleProps) {
  return (
    <div
      role="group"
      aria-label="Discipline"
      className="inline-flex gap-1 rounded-lg bg-secondary p-1"
    >
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
