# PR D — Training Area Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the training area in line with the design system: one primary action per context, semantic tokens instead of hardcoded hex, shared form/skeleton/empty patterns, consistent punctuation and dates, and a discipline-aware activity linker.

**Architecture:** This PR is refinement, not new capability. Each finding is a small, independently testable change to an existing component. The two behavioural changes worth testing are the FormGauge tone mapping (a pure function) and the activity linker's discipline filter (a pure filter over a fetched list).

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4 tokens, Vitest + Testing Library, Recharts, react-big-calendar.

**Spec:** `docs/superpowers/specs/2026-10-04-strength-training-design.md` (section F, findings 1–9)

## Global Constraints

- No em dashes (`—`). En dash `–` for ranges/empty values, middle dot `·` for separators.
- No hardcoded colours in components. Use the tokens from `client/src/index.css`.
- Never signal hierarchy with a second hue; use opacity or weight (except the documented discipline accent, which is paired with an icon).
- One `<Card>` primitive; `rounded-lg` for structural elements; shared `Section`/`FormField`/`Alert`/`Skeleton*`/`EmptyState`.
- Colour is never the only signal. Icon-only buttons get `aria-label`. Tap targets ≥44px on mobile where practical.
- No new dependencies.
- Every task ends with lint + type-check green, tests green, and a commit.

## Review Focus

- **A TSB at a band boundary (e.g. exactly -10, 5, 20):** the label and the bar colour must agree, so the gauge never shows "Fresh" with a fatigue colour.
- **A plan with no upcoming workout:** the panel must show the shared `EmptyState`, not a bespoke empty box.
- **Opening the activity linker for a strength workout:** only strength activities are offered; for a cycling workout, only rides.
- **A plan page with a long title and both secondary actions:** the header must not present three competing primary buttons.
- **The training load chart with no data:** it shows the shared empty state, not a bare message box.

---

### Task 1: FormGauge uses tokens and agrees with its label

**Files:**

- Create: `client/src/features/training/lib/form-tone.ts`
- Test: `client/src/features/training/lib/form-tone.test.ts`
- Modify: `client/src/features/training/components/FormGauge.tsx`

**Interfaces:**

- Consumes: nothing.
- Produces: `type FormTone = 'danger' | 'warning' | 'neutral' | 'success'`; `function formTone(tsb: number): FormTone`; `function formLabel(tsb: number): string`.

- [ ] **Step 1: Write the failing test**

Create `client/src/features/training/lib/form-tone.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formLabel, formTone } from './form-tone';

describe('formTone / formLabel', () => {
  it('marks a very negative TSB as danger', () => {
    expect(formTone(-31)).toBe('danger');
    expect(formLabel(-31)).toBe('Very fatigued');
  });

  it('marks -30 as danger (boundary is inclusive)', () => {
    expect(formTone(-30)).toBe('danger');
  });

  it('marks -10 to 5 as neutral', () => {
    expect(formTone(-10)).toBe('neutral');
    expect(formTone(0)).toBe('neutral');
    expect(formTone(5)).toBe('neutral');
  });

  it('marks a positive TSB as success', () => {
    expect(formTone(21)).toBe('success');
    expect(formLabel(21)).toBe('Fresh');
  });

  it('uses one band per tone so label and colour never disagree', () => {
    // Every tone has exactly one label.
    expect(formLabel(-20)).toBe('Fatigued');
    expect(formTone(-20)).toBe('warning');
    expect(formLabel(10)).toBe('Neutral');
    expect(formTone(10)).toBe('neutral');
    expect(formLabel(15)).toBe('Fresh');
    expect(formTone(15)).toBe('success');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd client && npx vitest run src/features/training/lib/form-tone.test.ts`
Expected: FAIL — cannot resolve `./form-tone`.

- [ ] **Step 3: Implement the tone mapping**

Create `client/src/features/training/lib/form-tone.ts`. Bands (from the existing labels, made consistent):

- `tsb <= -30` → `danger` / `Very fatigued`
- `tsb <= -10` → `warning` / `Fatigued`
- `tsb <= 5` → `neutral` / `Neutral`
- otherwise → `success` / `Fresh`

The point of the change: the old component had four bar colours but five labels, so a TSB of 15 showed "Fresh" with the yellow band. One tone per band fixes that.

- [ ] **Step 4: Run it to verify it passes**

Run: `cd client && npx vitest run src/features/training/lib/form-tone.test.ts`
Expected: PASS.

- [ ] **Step 5: Rewrite FormGauge to use tokens**

Replace the hardcoded hex and the two separate colour maps in `FormGauge.tsx`:

- import `formLabel`, `formTone` from `../lib/form-tone`;
- map tone → Tailwind classes, e.g. `danger: 'bg-danger text-white'`, `warning: 'bg-warning text-white'`, `neutral: 'bg-stone-400 text-white'`, `success: 'bg-success text-white'` for the bar, and `text-*/bg-*-50` for the pill;
- delete the `barColor` hex expression.

- [ ] **Step 6: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run`

```bash
git add client/src/features/training/lib/form-tone.ts client/src/features/training/lib/form-tone.test.ts client/src/features/training/components/FormGauge.tsx
git commit -m "refactor(training): FormGauge uses tokens and one tone per band"
```

---

### Task 2: One primary action per context on the plan page

**Files:**

- Modify: `client/src/pages/TrainingPlanDetailPage.tsx`
- Modify: `client/src/features/training/components/RecommendationCard.tsx`

**Interfaces:**

- Consumes: nothing.
- Produces: header secondary actions move into the existing `DropdownMenu`; `Add to today` becomes an outline button.

- [ ] **Step 1: Demote the header actions**

In `TrainingPlanDetailPage`, move `Reschedule Missed` and `Retrospective` from header buttons into the existing `DropdownMenu` (the one that holds `Delete plan`), each with an icon. Keep `Delete plan` destructive. The header then has a single trigger.

- [ ] **Step 2: Demote `Add to today`**

In `RecommendationCard`, change the `Add to today` button from the bordered-primary style to `Button variant="outline"`. The plan's primary action is `Mark complete` in the next-workout panel; a recommendation is a suggestion, not the primary task.

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npm run build`

```bash
git add client/src/pages/TrainingPlanDetailPage.tsx client/src/features/training/components/RecommendationCard.tsx
git commit -m "refactor(training): one primary action per context on the plan page"
```

---

### Task 3: Shared patterns in the training forms

**Files:**

- Modify: `client/src/features/training/components/WorkoutForm.tsx`
- Modify: `client/src/features/training/components/TrainingPlanForm.tsx`
- Modify: `client/src/features/training/components/TemplateLibrary.tsx`

**Interfaces:**

- Consumes: `FormField`, `Alert` (existing shared components).
- Produces: form errors rendered with `Alert variant="error"`; label+control wrapped in `FormField` where a hint or error applies.

- [ ] **Step 1: Replace the hand-rolled error boxes**

In `WorkoutForm`, `TrainingPlanForm` and `TemplateLibrary` (if it has one), replace the `<div className="rounded-lg bg-red-50 …">` error blocks with `<Alert variant="error" live="assertive">…</Alert>`. This gives one error look and an `aria-live` announcement across the app.

- [ ] **Step 2: Adopt `FormField` for fields with a hint**

Where a field already carries a hint or is optional (`FTP Baseline` in `TrainingPlanForm`, `Exercises (optional)` in `WorkoutForm`), wrap it in `<FormField label=… htmlFor=… hint=… optional>`. Leave the dense numeric grids as-is (they have no hints and `FormField` would add spacing noise).

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/features/training/components/WorkoutForm.tsx client/src/features/training/components/TrainingPlanForm.tsx client/src/features/training/components/TemplateLibrary.tsx
git commit -m "refactor(training): use shared Alert and FormField in training forms"
```

---

### Task 4: Shared empty states and skeletons

**Files:**

- Modify: `client/src/features/training/components/UpcomingWorkoutsWidget.tsx`
- Modify: `client/src/features/training/components/TrainingLoadChart.tsx`
- Modify: `client/src/pages/TrainingPlanDetailPage.tsx`

**Interfaces:**

- Consumes: `EmptyState`, `Skeleton*` (existing shared components).
- Produces: the upcoming widget and the load chart use `EmptyState`; the plan page loading state uses `Skeleton*`.

- [ ] **Step 1: Empty states**

- `UpcomingWorkoutsWidget`: replace the bespoke empty box with `<EmptyState icon={CalendarDays} title="No upcoming workouts" description="Create a training plan to schedule sessions." action={{ label: 'Training plans', onClick: () => navigate('/training-plans') }} />`. It needs `useNavigate`.
- `TrainingLoadChart`: replace the bare "No training data available" box with `<EmptyState icon={Activity} title="No training load yet" description="Sync sessions with power or heart rate to build the curve." />`.

- [ ] **Step 2: Skeletons**

In `TrainingPlanDetailPage`, replace the ad-hoc `h-8 w-64 animate-pulse` / `h-96 animate-pulse` blocks with `Skeleton` / `SkeletonCard` matching the real layout.

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/features/training/components/UpcomingWorkoutsWidget.tsx client/src/features/training/components/TrainingLoadChart.tsx client/src/pages/TrainingPlanDetailPage.tsx
git commit -m "refactor(training): shared empty states and skeletons"
```

---

### Task 5: Consistency pass (punctuation, dates, chart tokens)

**Files:**

- Modify: `client/src/features/training/components/WorkoutCalendar.tsx`
- Modify: `client/src/features/training/components/TrainingLoadChart.tsx`
- Modify: `client/src/pages/TrainingPlanDetailPage.tsx`
- Modify: `client/src/pages/SettingsPage.tsx`

**Interfaces:**

- Consumes: nothing.
- Produces: `·` separators, `formatDate` for the plan date range, chart colours read from tokens, and the last em dash removed from the codebase.

- [ ] **Step 1: Dates and separators**

In `TrainingPlanDetailPage`, replace the raw `${plan.start_date} – ${plan.end_date}` with `${formatDate(plan.start_date)} – ${formatDate(plan.end_date)}`.

- [ ] **Step 2: Chart and calendar tokens**

In `TrainingLoadChart`, replace the hardcoded hex (`#e7e5e4`, `#78716c`, `#d6d3d1`, `#0f6e4e`, `#c2410c`) with values read from the CSS custom properties via `getComputedStyle(document.documentElement)` in a small `useMemo`, falling back to the current literals. Do the same for the `WorkoutCalendar` event colours where a token exists (`#0f6e4e` → primary, `#a8a29e` → stone).

- [ ] **Step 3: Remove the pre-existing em dash**

In `SettingsPage.tsx` line ~241, change `value="IDR — Indonesian Rupiah"` to use an en dash: `value="IDR – Indonesian Rupiah"`. This is a pre-existing violation (PR #153), fixed here so the codebase has zero em dashes.

- [ ] **Step 4: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`
Then grep the client for the em dash character and confirm zero matches outside of `node_modules`.

```bash
git add client/src/features/training/components/WorkoutCalendar.tsx client/src/features/training/components/TrainingLoadChart.tsx client/src/pages/TrainingPlanDetailPage.tsx client/src/pages/SettingsPage.tsx
git commit -m "refactor(training): consistent dates, separators and chart tokens"
```

---

### Task 6: Discipline-aware activity linker

**Files:**

- Create: `client/src/features/training/lib/filter-linkable.ts`
- Test: `client/src/features/training/lib/filter-linkable.test.ts`
- Modify: `client/src/features/training/components/ActivityLinker.tsx`
- Modify: `client/src/pages/TrainingPlanDetailPage.tsx`

**Interfaces:**

- Consumes: `isStrengthType` (training) and a workout discipline.
- Produces: `function filterLinkable<T extends { discipline?: string | null }>(activities: T[], workoutIsStrength: boolean): T[]`.

- [ ] **Step 1: Write the failing test**

Create `client/src/features/training/lib/filter-linkable.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterLinkable } from './filter-linkable';

const rows = [
  { id: 'r1', discipline: 'cycling' },
  { id: 's1', discipline: 'strength' },
  { id: 'legacy' }, // pre-PR row, no discipline
];

describe('filterLinkable', () => {
  it('offers only strength activities to a strength workout', () => {
    expect(filterLinkable(rows, true).map((r) => r.id)).toEqual(['s1']);
  });

  it('offers rides (and pre-PR rows) to a cycling workout', () => {
    expect(filterLinkable(rows, false).map((r) => r.id)).toEqual(['r1', 'legacy']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd client && npx vitest run src/features/training/lib/filter-linkable.test.ts`
Expected: FAIL — cannot resolve `./filter-linkable`.

- [ ] **Step 3: Implement the filter**

Create `client/src/features/training/lib/filter-linkable.ts`:

```ts
export function filterLinkable<T extends { discipline?: string | null }>(
  activities: T[],
  workoutIsStrength: boolean,
): T[] {
  return activities.filter((a) =>
    workoutIsStrength ? a.discipline === 'strength' : (a.discipline ?? 'cycling') !== 'strength',
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd client && npx vitest run src/features/training/lib/filter-linkable.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire the linker**

`ActivityLinker` needs to know the workout's discipline. Add a `workoutIsStrength: boolean` prop; `TrainingPlanDetailPage` passes `isStrengthType(selectedWorkout.workout_type)`. Apply `filterLinkable` to the fetched list before rendering options, and when the filtered list is empty show a short inline message ("No matching sessions in this window") instead of an empty select.

- [ ] **Step 6: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/features/training/lib/filter-linkable.ts client/src/features/training/lib/filter-linkable.test.ts client/src/features/training/components/ActivityLinker.tsx client/src/pages/TrainingPlanDetailPage.tsx
git commit -m "feat(training): only offer matching-discipline activities to link"
```

---

## Self-Review Notes

- **Spec coverage:** section F findings 1 (Task 2), 2 (Task 1), 3 (Task 3), 4 (already done in PR B, verified in Task 5 grep), 5/6 (Task 5), 7 (Task 4), 8 (Task 6), 9 (Task 5).
- **Review Focus tests:** FormGauge tone/label agreement → Task 1 (unit test); linker discipline → Task 6 (unit test); empty states and header hierarchy → verified by inspection and build in Tasks 2 and 4.
- **Type consistency:** `formTone`/`formLabel` defined once (Task 1); `filterLinkable` defined once (Task 6).
- **Deferred:** the `ActivityLinker` empty-state styling is a short inline message, not a full `EmptyState`, because it renders inside a dialog.
