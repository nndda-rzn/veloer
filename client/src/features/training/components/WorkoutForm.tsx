import { useState } from 'react';
import type {
  Discipline,
  TrainingWorkout,
  WorkoutExercise,
  WorkoutFormData,
  WorkoutType,
} from '../types/training';
import { WORKOUT_TYPE_LABELS } from '../types/training';
import { disciplineOf } from '../lib/discipline';
import { cleanExercises } from '../lib/exercises';
import { DisciplineToggle } from './DisciplineToggle';
import { ExerciseListEditor } from './ExerciseListEditor';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { FormField } from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WorkoutFormProps {
  workout?: TrainingWorkout;
  defaultDate?: string;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  onCancel: () => void;
}

const CYCLING_TYPES: WorkoutType[] = [
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

const STRENGTH_TYPES: WorkoutType[] = ['lower', 'upper', 'full_body', 'core', 'mobility'];

const DEFAULT_TYPE: Record<Discipline, WorkoutType> = {
  cycling: 'endurance',
  strength: 'full_body',
};

export function WorkoutForm({ workout, defaultDate, onSubmit, onCancel }: WorkoutFormProps) {
  const initialDiscipline: Discipline = workout ? disciplineOf(workout.workout_type) : 'cycling';

  const [discipline, setDiscipline] = useState<Discipline>(initialDiscipline);
  const [type, setType] = useState<WorkoutType>(workout?.workout_type ?? 'endurance');
  const [title, setTitle] = useState(workout?.title ?? '');
  const [description, setDescription] = useState(workout?.description ?? '');
  const [scheduledDate, setScheduledDate] = useState(workout?.scheduled_date ?? defaultDate ?? '');
  const [durationMin, setDurationMin] = useState(workout?.target_duration_minutes ?? 60);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(workout?.exercises ?? []);
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

  const isStrength = discipline === 'strength';

  /**
   * Switching discipline resets the type and clears the other discipline's
   * fields, so a saved strength workout can never carry leftover power/cadence
   * numbers (and a cycling workout never carries exercises).
   */
  const handleDisciplineChange = (next: Discipline) => {
    if (next === discipline) return;
    setDiscipline(next);
    setType(DEFAULT_TYPE[next]);
    setTargetTss('');
    setTargetPower('');
    setTargetHr('');
    setCadenceMin('');
    setCadenceMax('');
    setShowIntervals(false);
    if (next === 'cycling') setExercises([]);
  };

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
        discipline,
        workout_type: type,
        title: title.trim(),
        description: description.trim() || null,
        target_duration_minutes: durationMin || null,
        // Strength carries no cycling targets; submit null so a switch cannot
        // leave stale values behind.
        target_tss: isStrength ? null : targetTss ? Number(targetTss) : null,
        target_avg_power: isStrength ? null : targetPower ? Number(targetPower) : null,
        target_avg_hr: isStrength ? null : targetHr ? Number(targetHr) : null,
        target_cadence_min: isStrength ? null : cadenceMin ? Number(cadenceMin) : null,
        target_cadence_max: isStrength ? null : cadenceMax ? Number(cadenceMax) : null,
        intervals_count: !isStrength && showIntervals ? intervalCount : null,
        interval_duration_seconds: !isStrength && showIntervals ? intervalDuration : null,
        interval_power_pct_ftp: !isStrength && showIntervals ? intervalPower : null,
        rest_duration_seconds: !isStrength && showIntervals ? restDuration : null,
        rest_power_pct_ftp: !isStrength && showIntervals ? restPower : null,
        exercises: isStrength ? cleanExercises(exercises) : null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout.');
      setSubmitting(false);
    }
  };

  const typeOptions = isStrength ? STRENGTH_TYPES : CYCLING_TYPES;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workout ? 'Edit Workout' : 'New Workout'}</DialogTitle>
          <DialogDescription>
            {isStrength
              ? 'Plan a strength session. Add exercises if you want to track load.'
              : 'Define the workout targets and optional interval structure.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="error" live="assertive">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Discipline decides which fields follow */}
          <div>
            <Label>Discipline</Label>
            <div className="mt-1.5">
              <DisciplineToggle value={discipline} onChange={handleDisciplineChange} />
            </div>
          </div>

          {/* Workout type */}
          <div>
            <Label>Type</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    type === t
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-border bg-card text-muted-foreground hover:border-input'
                  }`}
                >
                  {WORKOUT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="workout-title">Title</Label>
              <Input
                id="workout-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isStrength ? 'e.g. Lower body A' : 'e.g. 2x20 Threshold'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workout-date">Date</Label>
              <Input
                id="workout-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration (min)</Label>
            <Input
              id="duration"
              type="number"
              min={10}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </div>

          {/* Strength: optional exercise list */}
          {isStrength && (
            <FormField
              label="Exercises"
              optional
              hint="Add sets, reps and weight if you want to track load."
            >
              <ExerciseListEditor value={exercises} onChange={setExercises} />
            </FormField>
          )}

          {/* Cycling: target metrics + intervals */}
          {!isStrength && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="target-tss">Target TSS</Label>
                  <Input
                    id="target-tss"
                    type="number"
                    min={0}
                    value={targetTss}
                    onChange={(e) => setTargetTss(e.target.value)}
                    placeholder="–"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="target-power">Power (W)</Label>
                  <Input
                    id="target-power"
                    type="number"
                    min={0}
                    value={targetPower}
                    onChange={(e) => setTargetPower(e.target.value)}
                    placeholder="–"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="target-hr">HR (bpm)</Label>
                  <Input
                    id="target-hr"
                    type="number"
                    value={targetHr}
                    onChange={(e) => setTargetHr(e.target.value)}
                    placeholder="–"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cadence-min">Cadence min</Label>
                  <Input
                    id="cadence-min"
                    type="number"
                    value={cadenceMin}
                    onChange={(e) => setCadenceMin(e.target.value)}
                    placeholder="–"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cadence-max">Cadence max</Label>
                  <Input
                    id="cadence-max"
                    type="number"
                    value={cadenceMax}
                    onChange={(e) => setCadenceMax(e.target.value)}
                    placeholder="–"
                  />
                </div>
              </div>

              <div>
                <Label>
                  <input
                    type="checkbox"
                    checked={showIntervals}
                    onChange={(e) => setShowIntervals(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  Interval structure
                </Label>
                {showIntervals && (
                  <div className="mt-2 grid grid-cols-3 gap-3 rounded-lg border border-border p-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Reps</Label>
                      <Input
                        type="number"
                        min={1}
                        value={intervalCount}
                        onChange={(e) => setIntervalCount(Number(e.target.value))}
                        className="h-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">On (sec)</Label>
                      <Input
                        type="number"
                        min={10}
                        value={intervalDuration}
                        onChange={(e) => setIntervalDuration(Number(e.target.value))}
                        className="h-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">On % FTP</Label>
                      <Input
                        type="number"
                        min={50}
                        max={200}
                        value={intervalPower}
                        onChange={(e) => setIntervalPower(Number(e.target.value))}
                        className="h-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Rest (sec)</Label>
                      <Input
                        type="number"
                        min={10}
                        value={restDuration}
                        onChange={(e) => setRestDuration(Number(e.target.value))}
                        className="h-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Rest % FTP</Label>
                      <Input
                        type="number"
                        min={20}
                        max={100}
                        value={restPower}
                        onChange={(e) => setRestPower(Number(e.target.value))}
                        className="h-7"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="workout-desc">Description</Label>
            <Textarea
              id="workout-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workout-notes">Notes</Label>
            <Textarea
              id="workout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Saving…' : workout ? 'Save Changes' : 'Add Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
