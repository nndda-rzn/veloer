# PR E — Discoverability + Mixed Strength Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make strength sessions findable in the UI, and add three mixed strength + cycling plan templates so a rider can start a strength-aware plan in one click.

**Architecture:** Two independent fixes. (1) Discoverability: the plan detail page has no "add session" affordance at all - the form only opens from an invisible calendar click - so a primary button is added to the header and to the next-workout empty state. (2) Templates: `GeneratePlanFromTemplate` gains a `discipline` field on its weekly pattern and three mixed templates; the generator must stop writing power/cadence onto strength sessions (the current code writes them unconditionally, which would leak cycling numbers into a gym session - the same leak PRs A-C removed).

**Tech Stack:** TypeScript (strict), tsyringe DI, Supabase, React 19, Vitest (server + client).

**Spec:** `docs/superpowers/specs/2026-10-04-strength-training-design.md`

## Global Constraints

- No em dashes (`—`). En dash `–` for ranges/empty values, middle dot `·` for separators.
- A strength session carries **no** cycling targets: `target_avg_power`, `target_cadence_min`, `target_cadence_max`, `target_tss` must be `null` for every strength workout. This is the central rule of this PR.
- `weight_kg` on a template exercise is always `null`: load is individual, and a template that pre-fills a weight would be wrong for most riders.
- Templates use `goal_type: 'custom'` (the existing CHECK constraint allows it; no migration needed).
- No new dependencies.
- Every task ends with lint + type-check green, tests green, and a commit.

## Review Focus

- **Generating a mixed template:** every strength session must have `target_avg_power === null`, `target_cadence_min === null`, `target_cadence_max === null`, `target_tss === null`, and a non-empty `exercises` array; every cycling session must be unchanged from today's behaviour.
- **Opening a strength session generated from a template:** the form must open in strength mode with its exercises listed, not in cycling mode with empty power fields.
- **The plan detail page with no workouts yet:** both the header button and the empty-state actions must open the form.
- **A template key the client sends but the server does not know:** must fail loudly, not silently create an empty plan.
- **The last week of a 4-week cycle:** volume must drop (deload), not climb.

---

### Task 1: Extract the template pattern builder as a tested pure function

**Files:**

- Modify: `server/src/application/use-cases/training/GeneratePlanFromTemplate.ts`
- Test: `server/src/application/use-cases/training/plan-template.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `type TemplateKey = 'BASE_BUILD_4W' | 'FTP_BUILDER_6W' | 'CENTURY_PREP_8W' | 'GRAN_FONDO_12W' | 'STRENGTH_FOCUS_4W' | 'BALANCED_6W' | 'ENDURANCE_STRENGTH_6W'`
  - `interface WeeklyPattern { day_offset: number; discipline: 'cycling' | 'strength'; workout_type: WorkoutType; title: string; duration_minutes: number; tss: number | null; exercises?: WorkoutExercise[] | null; intervals_*?: ... }`
  - `function getWeeklyPattern(template: TemplateKey, week: number): WeeklyPattern[]`
  - `function strengthExercises(type: WorkoutType, week: number): WorkoutExercise[]`

- [ ] **Step 1: Write the failing test**

Create `server/src/application/use-cases/training/plan-template.test.ts`. It must pin the central rule (strength carries no cycling targets) and the deload week:

```ts
import { describe, expect, it } from 'vitest';
import { getWeeklyPattern } from './GeneratePlanFromTemplate.js';

const MIXED: const = ['STRENGTH_FOCUS_4W', 'BALANCED_6W', 'ENDURANCE_STRENGTH_6W'] as const;

describe('mixed templates', () => {
  it.each(MIXED)('%s has both disciplines every week', (key) => {
    const week = getWeeklyPattern(key, 1);
    expect(week.some((p) => p.discipline === 'strength')).toBe(true);
    expect(week.some((p) => p.discipline === 'cycling')).toBe(true);
  });

  it.each(MIXED)('%s strength sessions carry exercises and no cycling targets', (key) => {
    for (let week = 1; week <= 6; week++) {
      for (const p of getWeeklyPattern(key, week)) {
        if (p.discipline !== 'strength') continue;
        expect(p.tss).toBeNull();
        expect(p.exercises && p.exercises.length).toBeGreaterThan(0);
        expect(p.intervals_count ?? null).toBeNull();
      }
    }
  });

  it('progresses strength sets across the cycle and deloads on week 4', () => {
    const w1 = getWeeklyPattern('STRENGTH_FOCUS_4W', 1).find((p) => p.discipline === 'strength');
    const w3 = getWeeklyPattern('STRENGTH_FOCUS_4W', 3).find((p) => p.discipline === 'strength');
    const w4 = getWeeklyPattern('STRENGTH_FOCUS_4W', 4).find((p) => p.discipline === 'strength');
    const sets = (p?: { exercises?: { sets: number }[] | null }) =>
      (p?.exercises ?? []).reduce((s, e) => s + e.sets, 0);
    expect(sets(w3)).toBeGreaterThan(sets(w1));
    expect(sets(w4)).toBeLessThan(sets(w3));
  });

  it('keeps cycling sessions unchanged', () => {
    const p = getWeeklyPattern('BASE_BUILD_4W', 1);
    expect(p.every((x) => x.discipline === 'cycling')).toBe(true);
    expect(p.every((x) => typeof x.tss === 'number')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npx vitest run src/application/use-cases/training/plan-template.test.ts`
Expected: FAIL — `getWeeklyPattern` is not exported, and the mixed keys do not exist.

- [ ] **Step 3: Add the discipline field and export the builder**

In `GeneratePlanFromTemplate.ts`:

- export `getWeeklyPattern` and add `discipline` to `WeeklyPattern`;
- set `discipline: 'cycling'` on every existing pattern entry (mechanical, no behaviour change);
- widen `TemplateKey` with the three mixed keys;
- add `WorkoutExercise` to the entity import.

- [ ] **Step 4: Run it to verify it fails on the mixed keys only**

Run: `cd server && npx vitest run src/application/use-cases/training/plan-template.test.ts`
Expected: FAIL on the three mixed templates (unknown key), while the cycling-unchanged test passes.

- [ ] **Step 5: Commit**

```bash
git add server/src/application/use-cases/training/GeneratePlanFromTemplate.ts server/src/application/use-cases/training/plan-template.test.ts
git commit -m "test(server): pin template discipline and deload behaviour"
```

---

### Task 2: Three mixed templates with progressive strength work

**Files:**

- Modify: `server/src/application/use-cases/training/GeneratePlanFromTemplate.ts`
- Test: `server/src/application/use-cases/training/plan-template.test.ts`

**Interfaces:**

- Consumes: Task 1's `WeeklyPattern`, `getWeeklyPattern`.
- Produces: the three template patterns and `strengthExercises(type, week)`.

- [ ] **Step 1: Implement `strengthExercises`**

Add a helper that returns the exercise list for a strength workout type, progressing across the 4-week cycle. Deload (week 4 of each cycle) drops one set from each exercise. Example for `lower`:

```ts
// week within the 4-week cycle: 1..4 (4 = deload)
function setsFor(base: number, week: number): number {
  const inCycle = ((week - 1) % 4) + 1;
  if (inCycle === 4) return Math.max(1, base - 1); // deload
  return base + (inCycle - 1); // 4,5,6 build then deload
}
```

Exercises per type (all `weight_kg: null`):

- `lower`: Squat, Romanian deadlift, Walking lunge, Calf raise
- `upper`: Bench press, Bent-over row, Overhead press, Face pull
- `full_body`: Deadlift, Front squat, Pull-up, Plank
- `core`: Plank, Hanging leg raise, Cable crunch, Side plank
- `mobility`: Hip flexor stretch, Thoracic rotation, Hamstring stretch, Shoulder dislocate

Sets come from `setsFor`, reps are fixed per exercise (e.g. Squat 5, RDL 8, lunge 10).

- [ ] **Step 2: Add the three templates**

Add to `TEMPLATES` (title, description, weeks, goal_type `'custom'`, workouts_per_week, focus) and implement their patterns in `getWeeklyPattern`:

| Key                     | Weeks | Weekly pattern (day_offset Mon=0)                                                   |
| ----------------------- | ----- | ----------------------------------------------------------------------------------- |
| `STRENGTH_FOCUS_4W`     | 4     | 0 lower · 1 endurance · 2 upper · 4 full_body · 5 endurance(long)                   |
| `BALANCED_6W`           | 6     | 0 lower · 1 endurance · 3 upper · 4 tempo · 6 endurance(long)                       |
| `ENDURANCE_STRENGTH_6W` | 6     | 0 endurance · 1 full_body · 2 sweet_spot · 4 lower · 5 endurance(long) · 6 recovery |

Strength sessions: `tss: null`, `exercises: strengthExercises(type, week)`, no interval fields. Cycling sessions: exactly the existing shape (`tss` number, power from FTP via the generator).

- [ ] **Step 3: Run the tests**

Run: `cd server && npx vitest run src/application/use-cases/training/plan-template.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/src/application/use-cases/training/GeneratePlanFromTemplate.ts server/src/application/use-cases/training/plan-template.test.ts
git commit -m "feat(server): add three mixed strength + cycling templates"
```

---

### Task 3: Stop the generator leaking cycling targets onto strength sessions

**Files:**

- Modify: `server/src/application/use-cases/training/GeneratePlanFromTemplate.ts`
- Test: `server/src/application/use-cases/training/plan-template.test.ts`

**Interfaces:**

- Consumes: Task 2's patterns.
- Produces: strength workouts created with `discipline: 'strength'`, `exercises`, and all cycling targets `null`.

- [ ] **Step 1: Write the failing test**

Add to `plan-template.test.ts` a test that renders the **created workout payloads** rather than the raw patterns, so it pins what actually reaches the database. Extract a pure builder first:

```ts
// in the use case file, exported for the test:
export function buildWorkoutPayload(
  planId: string,
  userId: string,
  date: string,
  p: WeeklyPattern,
  ftp: number,
): TrainingWorkoutCreateData;
```

```ts
it('never writes cycling targets onto a strength workout', () => {
  const p = getWeeklyPattern('BALANCED_6W', 1).find((x) => x.discipline === 'strength')!;
  const payload = buildWorkoutPayload('plan', 'user', '2026-10-05', p, 250);
  expect(payload.discipline).toBe('strength');
  expect(payload.target_avg_power).toBeNull();
  expect(payload.target_cadence_min).toBeNull();
  expect(payload.target_cadence_max).toBeNull();
  expect(payload.target_tss).toBeNull();
  expect(payload.exercises && payload.exercises.length).toBeGreaterThan(0);
});

it('still writes cycling targets onto a ride', () => {
  const p = getWeeklyPattern('BALANCED_6W', 1).find((x) => x.discipline === 'cycling')!;
  const payload = buildWorkoutPayload('plan', 'user', '2026-10-05', p, 250);
  expect(payload.discipline).toBe('cycling');
  expect(payload.target_cadence_min).toBe(85);
  expect(payload.exercises).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npx vitest run src/application/use-cases/training/plan-template.test.ts`
Expected: FAIL — `buildWorkoutPayload` is not exported.

- [ ] **Step 3: Extract and fix the payload builder**

Move the object literal currently built inside the `for (const p of patterns)` loop (lines ~416-436) into `buildWorkoutPayload`, and branch on `p.discipline`:

```ts
const isStrength = p.discipline === 'strength';
return {
  plan_id: planId,
  user_id: userId,
  scheduled_date: date,
  discipline: p.discipline,
  workout_type: p.workout_type,
  title: p.title,
  description: null,
  target_duration_minutes: p.duration_minutes,
  // Strength carries no cycling targets.
  target_tss: isStrength ? null : p.tss,
  target_avg_power: isStrength
    ? null
    : p.workout_type !== 'recovery'
      ? Math.round(ftp * 0.75)
      : null,
  target_avg_hr: null,
  target_cadence_min: isStrength ? null : 85,
  target_cadence_max: isStrength ? null : 95,
  intervals_count: isStrength ? null : (p.intervals_count ?? null),
  interval_duration_seconds: isStrength ? null : (p.interval_duration_seconds ?? null),
  interval_power_pct_ftp: isStrength ? null : (p.interval_power_pct_ftp ?? null),
  rest_duration_seconds: isStrength ? null : (p.rest_duration_seconds ?? null),
  rest_power_pct_ftp: isStrength ? null : (p.rest_power_pct_ftp ?? null),
  exercises: isStrength ? (p.exercises ?? null) : null,
  notes: null,
  status: 'planned',
};
```

- [ ] **Step 4: Run the tests**

Run: `cd server && npx vitest run`
Expected: all PASS (the new ones plus the existing 20).

- [ ] **Step 5: Commit**

```bash
git add server/src/application/use-cases/training/GeneratePlanFromTemplate.ts server/src/application/use-cases/training/plan-template.test.ts
git commit -m "fix(server): never write cycling targets onto a strength workout"
```

---

### Task 4: Mirror the template metadata on the client

**Files:**

- Modify: `client/src/features/training/types/training.ts`
- Modify: `client/src/features/training/components/TemplateLibrary.tsx`

**Interfaces:**

- Consumes: the three template keys from Task 2.
- Produces: `TemplateKey` and `TEMPLATE_LIST` include the three mixed templates; `focusIcons` has entries for their focus strings.

- [ ] **Step 1: Extend the client types**

Add the three keys to `TemplateKey` and three matching entries to `TEMPLATE_LIST`, with titles/descriptions identical to the server's `TEMPLATES` so the two never drift. Focus strings (used as the `focusIcons` key): `'Strength focus'`, `'Balanced strength + cycling'`, `'Endurance with strength'`.

- [ ] **Step 2: Add the icons**

In `TemplateLibrary.tsx`, add `Dumbbell` (from lucide-react) for `'Strength focus'` and `'Balanced strength + cycling'`, and `Activity` or `HeartPulse` for `'Endurance with strength'`. The existing `?? ClipboardList` fallback stays as a safety net.

- [ ] **Step 3: Verify the keys match the server**

Grep both files and confirm the three keys are spelled identically:

```bash
grep -n "STRENGTH_FOCUS_4W\|BALANCED_6W\|ENDURANCE_STRENGTH_6W" server/src/application/use-cases/training/GeneratePlanFromTemplate.ts client/src/features/training/types/training.ts
```

Expected: three matches in each file, same spelling.

- [ ] **Step 4: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run`

```bash
git add client/src/features/training/types/training.ts client/src/features/training/components/TemplateLibrary.tsx
git commit -m "feat(training): offer the mixed templates in the template library"
```

---

### Task 5: Add-session affordance on the plan page

**Files:**

- Modify: `client/src/pages/TrainingPlanDetailPage.tsx`
- Modify: `client/src/features/training/components/NextWorkoutPanel.tsx`

**Interfaces:**

- Consumes: the existing `showForm` state and `handleSelectSlot`-style opener in `TrainingPlanDetailPage`.
- Produces: a primary "Add session" button in the plan header; `NextWorkoutPanel` gains `onAddSession` and `onBrowseTemplates` callbacks used by its empty state.

- [ ] **Step 1: Add the header button**

In `TrainingPlanDetailPage`, add a primary `Button` labelled **Add session** (icon `Plus`) next to the plan-actions menu, calling:

```ts
() => {
  setFormDate(new Date().toISOString().split('T')[0]);
  setEditWorkout(null);
  setShowForm(true);
};
```

This is the page's primary action again (PR D removed the competing header buttons, leaving none).

- [ ] **Step 2: Give the empty state real actions**

Add `onAddSession: () => void` and `onBrowseTemplates: () => void` props to `NextWorkoutPanel`. In the `!workout` branch, render the existing copy plus two buttons: **Add session** (primary, `Plus` icon) and **Browse templates** (outline, `LayoutTemplate` icon).

- [ ] **Step 3: Wire them**

In `TrainingPlanDetailPage`, pass `onAddSession` (same handler as Step 1) and `onBrowseTemplates` (`() => navigate('/training-plans')`, since the template library lives on the plans page).

- [ ] **Step 4: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/pages/TrainingPlanDetailPage.tsx client/src/features/training/components/NextWorkoutPanel.tsx
git commit -m "feat(training): add a visible way to add a session"
```

---

### Task 6: End-to-end verification

**Files:**

- Modify: `docs/20-design-system.md` only if a new token was needed (it should not be).

**Interfaces:**

- Consumes: everything above.
- Produces: a verified mixed plan in the browser.

- [ ] **Step 1: Run the full gate**

Run: `npm run lint && npm run type-check && (cd server && npx vitest run) && (cd client && npx vitest run) && npm run build`
Expected: all green.

- [ ] **Step 2: Verify in the browser**

Run `npm run dev`. Then:

1. Open a plan detail page → the header shows **Add session**; clicking it opens the form; create a strength session and confirm it appears on the calendar in steel.
2. On a plan with no upcoming workout, the next-workout card offers **Add session** and **Browse templates**, and both work.
3. Training Plans → Start from → Template → generate **Balanced · 6 Weeks**. Open a strength session from it: the detail sheet shows the exercises and no power/cadence; the form opens in strength mode.
4. Confirm the generated strength workouts carry no power (check the API response or the detail sheet).
5. Render at 375px and 1440px.

- [ ] **Step 3: Report**

No commit unless a fix was needed. Record the verification result.

---

## Self-Review Notes

- **Spec coverage:** the discoverability gap and the mixed templates are both new scope agreed after PR D; the spec's "out of scope: structured strength programs" is superseded by this PR for _mixed_ plans only (a pure-strength program remains out of scope).
- **Review Focus tests:** strength payload has no cycling targets → Task 3; template key mismatch → Task 4 Step 3 (grep both files); deload week → Task 1; empty-state actions → Task 5 (inspection + browser in Task 6).
- **Type consistency:** `WeeklyPattern.discipline` is defined once (Task 1); `buildWorkoutPayload` is defined once (Task 3) and used by both the generator loop and the tests.
- **Deferred:** a pure-strength template (no cycling) stays out of scope; so does any per-rider load progression based on actual lifted weight.
