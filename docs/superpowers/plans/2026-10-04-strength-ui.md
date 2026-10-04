# PR B — Strength Training UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make strength a plannable, editable session in the existing training UI: a discipline toggle, a strength-specific form with an optional exercise list, and strength rendering in the calendar, next-workout panel and detail sheet.

**Architecture:** The server already stores `discipline` and `exercises` (PR A). This PR threads them through the workout API/use case, adds one shared `WorkoutTypeChip` (replacing three hand-rolled chips), and makes `WorkoutForm` progressive: choosing Strength swaps the cycling target fields for strength fields. A single steel token (`--color-strength`) plus a `Dumbbell` icon distinguishes the discipline; colour is never the only signal.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4 tokens, Base UI primitives, Vitest (client, added in PR A).

**Spec:** `docs/superpowers/specs/2026-10-04-strength-training-design.md` (sections E and F)

## Global Constraints

- No em dashes (`—`). Use en dash `–` for ranges/empty values, middle dot `·` for separators, colon `:` for labels.
- No hardcoded colours in components. Strength accent is the token `--color-strength: #475569`; everything else uses existing tokens.
- Colour is never the only signal: always pair the accent with an icon (`Dumbbell`) and a text label.
- One `<Card>` primitive, one button set, `rounded-lg` for structural elements. No new dependencies.
- Labels above fields; every control has an accessible name; icon-only buttons get `aria-label`; tap targets ≥44px on mobile.
- Body text ≥16px on inputs (prevents iOS zoom).
- Every task ends with lint + type-check green, tests green, and a commit.

## Review Focus

- **A strength workout opened in the edit form:** the cycling fields (power, cadence, intervals, target TSS) must not reappear or be submitted as stale values.
- **A strength workout with zero exercises:** the exercise list is optional, so an empty list must save as `null` and the detail sheet must not render an empty "Exercises" section.
- **Switching discipline on an existing workout:** cycling target fields must be cleared so a saved strength workout cannot carry leftover power/cadence numbers.
- **An exercise row with a blank name:** must not be saved as a phantom entry; blank rows are dropped on submit.
- **A long workout title in the calendar and next-workout panel:** must truncate, not overflow the event box.

---

### Task 1: Strength token, labels and workout-type chip

**Files:**

- Modify: `client/src/index.css`
- Modify: `client/src/features/training/types/training.ts`
- Create: `client/src/features/training/components/WorkoutTypeChip.tsx`
- Create: `client/src/features/training/lib/discipline.ts`
- Test: `client/src/features/training/lib/discipline.test.ts`
- Modify: `client/src/features/training/index.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `type Discipline = 'cycling' | 'strength'`
  - `const STRENGTH_WORKOUT_TYPES: readonly WorkoutType[]`
  - `function disciplineOf(workoutType: WorkoutType): Discipline`
  - `function isStrengthType(t: WorkoutType): boolean`
  - `<WorkoutTypeChip type={WorkoutType} className? />`

- [ ] **Step 1: Add the strength token**

In `client/src/index.css`, inside `@theme`, after the semantic block, add:

```css
/* Strength accent: slate. Distinguished from cycling's ride-green, and
     outside the semantic set so it never reads as success/warning/error. */
--color-strength: #475569;
```

- [ ] **Step 2: Write the failing test**

Create `client/src/features/training/lib/discipline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { disciplineOf, isStrengthType, STRENGTH_WORKOUT_TYPES } from './discipline';

describe('disciplineOf', () => {
  it('classifies the five strength types as strength', () => {
    for (const t of STRENGTH_WORKOUT_TYPES) {
      expect(disciplineOf(t)).toBe('strength');
    }
  });

  it('classifies cycling intensity types as cycling', () => {
    expect(disciplineOf('endurance')).toBe('cycling');
    expect(disciplineOf('vo2max')).toBe('cycling');
    expect(disciplineOf('recovery')).toBe('cycling');
  });

  it('agrees with isStrengthType', () => {
    expect(isStrengthType('lower')).toBe(true);
    expect(isStrengthType('threshold')).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd client && npx vitest run src/features/training/lib/discipline.test.ts`
Expected: FAIL — cannot resolve `./discipline`.

- [ ] **Step 4: Extend types and implement the helper**

In `client/src/features/training/types/training.ts`:

- extend `WorkoutType` with `| 'lower' | 'upper' | 'full_body' | 'core' | 'mobility'`;
- add `discipline: Discipline;` and `exercises: WorkoutExercise[] | null;` to `TrainingWorkout`;
- add `discipline?: Discipline;` and `exercises?: WorkoutExercise[] | null;` to `WorkoutFormData`;
- add `export interface WorkoutExercise { name: string; sets: number; reps: number; weight_kg: number | null }`;
- add labels for the five new types to `WORKOUT_TYPE_LABELS` (`lower: 'Lower body'`, `upper: 'Upper body'`, `full_body: 'Full body'`, `core: 'Core'`, `mobility: 'Mobility'`);
- add colours for the five new types to `WORKOUT_TYPE_COLORS`, all set to the steel value `'#475569'`.

Create `client/src/features/training/lib/discipline.ts`:

```ts
import type { WorkoutType } from '../types/training';

export type Discipline = 'cycling' | 'strength';

/** Workout types that belong to the strength discipline. */
export const STRENGTH_WORKOUT_TYPES: readonly WorkoutType[] = [
  'lower',
  'upper',
  'full_body',
  'core',
  'mobility',
];

export function isStrengthType(t: WorkoutType): boolean {
  return STRENGTH_WORKOUT_TYPES.includes(t);
}

export function disciplineOf(t: WorkoutType): Discipline {
  return isStrengthType(t) ? 'strength' : 'cycling';
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd client && npx vitest run src/features/training/lib/discipline.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Create `WorkoutTypeChip`**

Create `client/src/features/training/components/WorkoutTypeChip.tsx`. It replaces the three hand-rolled chips in `WorkoutDetail`, `RecommendationCard` and `UpcomingWorkoutsWidget`. Render a `Dumbbell` icon for strength types and nothing for cycling; use `WORKOUT_TYPE_COLORS`/`WORKOUT_TYPE_LABELS`; surface uses `${color}1a` and text uses `color`, exactly like the existing chips so the look does not change.

```tsx
import { Dumbbell } from 'lucide-react';
import type { WorkoutType } from '../types/training';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS } from '../types/training';
import { isStrengthType } from '../lib/discipline';
import { cn } from '@/lib/utils';

interface WorkoutTypeChipProps {
  type: WorkoutType;
  className?: string;
}

/** The one chip used everywhere a workout type is shown. */
export function WorkoutTypeChip({ type, className }: WorkoutTypeChipProps) {
  const color = WORKOUT_TYPE_COLORS[type];
  const strength = isStrengthType(type);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {strength && <Dumbbell className="h-3 w-3" aria-hidden="true" />}
      {WORKOUT_TYPE_LABELS[type]}
    </span>
  );
}
```

- [ ] **Step 7: Export from the barrel**

In `client/src/features/training/index.ts` add `export * from './lib/discipline';`.

- [ ] **Step 8: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run`

```bash
git add client/src/index.css client/src/features/training/types/training.ts client/src/features/training/lib/discipline.ts client/src/features/training/lib/discipline.test.ts client/src/features/training/components/WorkoutTypeChip.tsx client/src/features/training/index.ts
git commit -m "feat(training): strength token, labels and shared WorkoutTypeChip"
```

---

### Task 2: Thread discipline and exercises through the workout API

**Files:**

- Modify: `server/src/application/use-cases/training/WorkoutUseCases.ts`
- Modify: `client/src/features/training/api/training.api.ts` (types only, if needed)

**Interfaces:**

- Consumes: `TrainingWorkoutCreateData` with optional `discipline`/`exercises` (PR A).
- Produces: `POST/PATCH /api/training-plans/:planId/workouts` accepts and persists `discipline` and `exercises`.

- [ ] **Step 1: Extend `WorkoutCreateInput` and pass through**

In `server/src/application/use-cases/training/WorkoutUseCases.ts`, add to `WorkoutCreateInput`: `discipline?: TrainingWorkout['discipline'];` and `exercises?: TrainingWorkout['exercises'];`. In `CreateWorkout.execute`, pass `discipline: input.discipline ?? 'cycling'` and `exercises: input.exercises ?? null` into the `TrainingWorkoutCreateData`.

- [ ] **Step 2: Verify the server accepts them**

Run: `cd server && npx tsc --noEmit && npx vitest run`
Expected: clean, 20/20.

- [ ] **Step 3: Commit**

```bash
git add server/src/application/use-cases/training/WorkoutUseCases.ts
git commit -m "feat(server): accept discipline and exercises on workout create"
```

---

### Task 3: Exercise list helpers (pure)

**Files:**

- Create: `client/src/features/training/lib/exercises.ts`
- Test: `client/src/features/training/lib/exercises.test.ts`

**Interfaces:**

- Consumes: `WorkoutExercise` (Task 1).
- Produces:
  - `function emptyExercise(): WorkoutExercise`
  - `function cleanExercises(rows: WorkoutExercise[]): WorkoutExercise[] | null`
  - `function formatExercise(e: WorkoutExercise): string`

- [ ] **Step 1: Write the failing test**

Create `client/src/features/training/lib/exercises.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cleanExercises, emptyExercise, formatExercise } from './exercises';

describe('cleanExercises', () => {
  it('returns null for an empty list (the list is optional)', () => {
    expect(cleanExercises([])).toBeNull();
  });

  it('drops rows with a blank name', () => {
    const rows = [
      { name: '  ', sets: 3, reps: 5, weight_kg: 60 },
      { name: 'Squat', sets: 5, reps: 5, weight_kg: 100 },
    ];
    expect(cleanExercises(rows)).toEqual([{ name: 'Squat', sets: 5, reps: 5, weight_kg: 100 }]);
  });

  it('returns null when every row is blank', () => {
    expect(cleanExercises([{ name: '', sets: 3, reps: 5, weight_kg: null }])).toBeNull();
  });

  it('trims the name', () => {
    const out = cleanExercises([{ name: '  Bench  ', sets: 4, reps: 8, weight_kg: 60 }]);
    expect(out?.[0].name).toBe('Bench');
  });
});

describe('formatExercise', () => {
  it('formats name, sets x reps and weight', () => {
    expect(formatExercise({ name: 'Squat', sets: 5, reps: 5, weight_kg: 100 })).toBe(
      'Squat · 5×5 · 100 kg',
    );
  });

  it('omits the weight when it is null', () => {
    expect(formatExercise({ name: 'Plank', sets: 3, reps: 1, weight_kg: null })).toBe(
      'Plank · 3×1',
    );
  });
});

describe('emptyExercise', () => {
  it('starts a blank row with sensible defaults', () => {
    expect(emptyExercise()).toEqual({ name: '', sets: 3, reps: 8, weight_kg: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/features/training/lib/exercises.test.ts`
Expected: FAIL — cannot resolve `./exercises`.

- [ ] **Step 3: Implement**

Create `client/src/features/training/lib/exercises.ts`:

```ts
import type { WorkoutExercise } from '../types/training';

export function emptyExercise(): WorkoutExercise {
  return { name: '', sets: 3, reps: 8, weight_kg: null };
}

/** Drop blank rows and return null when nothing is left (the list is optional). */
export function cleanExercises(rows: WorkoutExercise[]): WorkoutExercise[] | null {
  const cleaned = rows.map((r) => ({ ...r, name: r.name.trim() })).filter((r) => r.name.length > 0);
  return cleaned.length > 0 ? cleaned : null;
}

export function formatExercise(e: WorkoutExercise): string {
  const base = `${e.name} · ${e.sets}×${e.reps}`;
  return e.weight_kg != null ? `${base} · ${e.weight_kg} kg` : base;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/features/training/lib/exercises.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/features/training/lib/exercises.ts client/src/features/training/lib/exercises.test.ts
git commit -m "feat(training): exercise list helpers"
```

---

### Task 4: DisciplineToggle and ExerciseListEditor

**Files:**

- Create: `client/src/features/training/components/DisciplineToggle.tsx`
- Create: `client/src/features/training/components/ExerciseListEditor.tsx`

**Interfaces:**

- Consumes: `Discipline` (Task 1), `WorkoutExercise`/`emptyExercise` (Tasks 1, 3).
- Produces:
  - `<DisciplineToggle value={Discipline} onChange={(d: Discipline) => void} />`
  - `<ExerciseListEditor value={WorkoutExercise[]} onChange={(rows: WorkoutExercise[]) => void} />`

- [ ] **Step 1: Build `DisciplineToggle`**

Two-option segmented control. Reuse the `aria-pressed` chip pattern already used for workout types in `WorkoutForm`. Labels: `Cycling` and `Strength`. No icon needed at this size.

- [ ] **Step 2: Build `ExerciseListEditor`**

Repeating rows of `Exercise · Sets · Reps · Weight`. Desktop: a grid with a header row. Mobile: stacked with a visible label per field (do not rely on the header). Each row has an icon-only remove button with `aria-label={`Remove ${row.name || 'exercise'}`}`. A full-width `+ Add exercise` button appends `emptyExercise()`. Weight is optional (placeholder `–`). This is the only component in the app that renders `WorkoutExercise` rows.

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint`

```bash
git add client/src/features/training/components/DisciplineToggle.tsx client/src/features/training/components/ExerciseListEditor.tsx
git commit -m "feat(training): discipline toggle and exercise list editor"
```

---

### Task 5: Progressive WorkoutForm

**Files:**

- Modify: `client/src/features/training/components/WorkoutForm.tsx`

**Interfaces:**

- Consumes: `DisciplineToggle` (Task 4), `ExerciseListEditor` (Task 4), `cleanExercises` (Task 3), `disciplineOf` (Task 1).
- Produces: a form that submits `discipline`, `workout_type` and `exercises` correctly for both disciplines.

- [ ] **Step 1: Add discipline state and the toggle**

Derive the initial discipline from the edited workout's type via `disciplineOf(workout.workout_type)`, else `'cycling'`. Render `<DisciplineToggle>` above the type chips. When discipline changes: clear the type to a sensible default (`'endurance'` for cycling, `'full_body'` for strength) and clear the exercise rows when switching to cycling.

- [ ] **Step 2: Swap the field set by discipline**

For `'strength'`: show the five strength type chips, Title, Date, Duration, the `ExerciseListEditor`, Description and Notes. Hide Power, HR, Cadence, Target TSS and the interval builder entirely (do not render them, so they cannot submit stale values). For `'cycling'`: keep the existing fields unchanged.

- [ ] **Step 3: Submit the right payload**

Include `discipline` in the submitted `WorkoutFormData`. For strength, submit `exercises: cleanExercises(rows)` and send `null` for every cycling target field (power, hr, cadence, tss, interval fields). For cycling, submit `exercises: null`.

- [ ] **Step 4: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run`

```bash
git add client/src/features/training/components/WorkoutForm.tsx
git commit -m "feat(training): progressive workout form with strength mode"
```

---

### Task 6: Strength rendering in detail, calendar and next panel

**Files:**

- Modify: `client/src/features/training/components/WorkoutDetail.tsx`
- Modify: `client/src/features/training/components/WorkoutCalendar.tsx`
- Modify: `client/src/features/training/components/NextWorkoutPanel.tsx`
- Modify: `client/src/features/training/components/UpcomingWorkoutsWidget.tsx`
- Modify: `client/src/features/training/components/RecommendationCard.tsx`

**Interfaces:**

- Consumes: `WorkoutTypeChip` (Task 1), `formatExercise` (Task 3), `isStrengthType` (Task 1).
- Produces: strength sessions render without cycling metrics, and all type chips come from `WorkoutTypeChip`.

- [ ] **Step 1: `WorkoutDetail`**

Replace the hand-rolled type chip with `<WorkoutTypeChip>`. For a strength workout: the Targets block shows only Duration; hide TSS, Power, HR, Cadence; hide the Intervals block; and render an **Exercises** section (only when `exercises?.length`) using `formatExercise`, one row each. Keep the Actual block as-is (duration + TSS from the linked activity).

- [ ] **Step 2: `NextWorkoutPanel` and `UpcomingWorkoutsWidget`**

Use `<WorkoutTypeChip>`. In `NextWorkoutPanel`, omit the `· TSS` and `· <power>W` segments for strength. In `UpcomingWorkoutsWidget`, omit `· TSS` for strength and keep the steel rail colour.

- [ ] **Step 3: `RecommendationCard`**

Replace its hand-rolled chip with `<WorkoutTypeChip>` (recommendations are always cycling, so behaviour is unchanged).

- [ ] **Step 4: `WorkoutCalendar`**

Event title becomes `Strength: <title>` for strength types (the type label already prefixes cycling events). Colour already comes from `WORKOUT_TYPE_COLORS`, which now returns steel for strength types, so no other change is needed.

- [ ] **Step 5: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npm run build`

```bash
git add client/src/features/training/components/WorkoutDetail.tsx client/src/features/training/components/WorkoutCalendar.tsx client/src/features/training/components/NextWorkoutPanel.tsx client/src/features/training/components/UpcomingWorkoutsWidget.tsx client/src/features/training/components/RecommendationCard.tsx
git commit -m "feat(training): render strength sessions without cycling metrics"
```

---

### Task 7: Document the token and verify end to end

**Files:**

- Modify: `docs/20-design-system.md`

**Interfaces:**

- Consumes: everything above.
- Produces: the strength token documented; the mixed plan verified in a browser.

- [ ] **Step 1: Document the token**

Add `--color-strength` (`#475569`) to the semantic colour table in `docs/20-design-system.md` with the note that it marks the strength discipline and is always paired with the `Dumbbell` icon and a label.

- [ ] **Step 2: Verify in the browser**

Run `npm run dev`, open a plan, and check: create a strength workout (type, duration, two exercises) → it saves; open it → the detail sheet shows Type, Duration and Exercises with no power/cadence; the calendar event is steel and titled `Strength: …`; edit it → the strength fields are shown, no cycling fields; switch it to Cycling → cycling fields return and the exercises are gone. Then render at 375px and 1440px and confirm the exercise rows stack cleanly on mobile.

- [ ] **Step 3: Commit**

```bash
git add docs/20-design-system.md
git commit -m "docs: record the strength discipline token"
```

---

## Self-Review Notes

- **Spec coverage:** section E → Tasks 1, 4, 5, 6; the API gap left by PR A (discipline not accepted on create) → Task 2; the token documentation → Task 7. Section F findings are PR D.
- **Review Focus tests:** blank exercise name → Task 3 (`cleanExercises`); empty list → Task 3; strength form hiding cycling fields → Task 5 (verified by inspection + browser in Task 7, since it is render logic); stale values on discipline switch → Task 5 Step 1/3.
- **Type consistency:** `Discipline` and `WorkoutExercise` are defined once (Task 1) and imported; `cleanExercises`/`formatExercise`/`emptyExercise` are named identically where referenced.
- **Deferred:** the discipline filter on the activities list and the honest-data rendering there are PR C.
