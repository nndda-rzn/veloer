import { Plus, X } from 'lucide-react';
import type { WorkoutExercise } from '../types/training';
import { emptyExercise } from '../lib/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExerciseListEditorProps {
  value: WorkoutExercise[];
  onChange: (rows: WorkoutExercise[]) => void;
}

/**
 * Repeating rows for a strength workout's optional exercise list.
 *
 * Desktop shows a header row and a 4-column grid. Mobile stacks each row with a
 * visible label per field, because the header row is hidden there. Weight is
 * optional (bodyweight exercises have none).
 */
export function ExerciseListEditor({ value, onChange }: ExerciseListEditorProps) {
  const update = (index: number, patch: Partial<WorkoutExercise>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...value, emptyExercise()]);
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="hidden grid-cols-[1fr_4rem_4rem_5rem_2rem] gap-2 px-1 sm:grid">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Exercise
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sets
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Reps
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Weight (kg)
          </span>
          <span className="sr-only">Remove</span>
        </div>
      )}

      {value.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_4rem_4rem_5rem_2rem] sm:items-center sm:border-0 sm:p-0"
        >
          <div className="col-span-2 space-y-1.5 sm:col-span-1 sm:space-y-0">
            <Label htmlFor={`exercise-name-${index}`} className="sm:sr-only">
              Exercise
            </Label>
            <Input
              id={`exercise-name-${index}`}
              value={row.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="e.g. Squat"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-0">
            <Label htmlFor={`exercise-sets-${index}`} className="sm:sr-only">
              Sets
            </Label>
            <Input
              id={`exercise-sets-${index}`}
              type="number"
              min={1}
              value={row.sets}
              onChange={(e) => update(index, { sets: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-1.5 sm:space-y-0">
            <Label htmlFor={`exercise-reps-${index}`} className="sm:sr-only">
              Reps
            </Label>
            <Input
              id={`exercise-reps-${index}`}
              type="number"
              min={1}
              value={row.reps}
              onChange={(e) => update(index, { reps: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-1.5 sm:space-y-0">
            <Label htmlFor={`exercise-weight-${index}`} className="sm:sr-only">
              Weight (kg)
            </Label>
            <Input
              id={`exercise-weight-${index}`}
              type="number"
              min={0}
              value={row.weight_kg ?? ''}
              onChange={(e) =>
                update(index, { weight_kg: e.target.value === '' ? null : Number(e.target.value) })
              }
              placeholder="–"
            />
          </div>

          <div className="col-span-2 flex justify-end sm:col-span-1 sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${row.name || 'exercise'}`}
              onClick={() => remove(index)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus aria-hidden="true" />
        Add exercise
      </Button>
    </div>
  );
}
