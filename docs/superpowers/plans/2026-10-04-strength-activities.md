# PR C — Strength in the Activity Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show strength sessions honestly in the activity views: no "0 km", a discipline filter, cycling-only summaries that say so, and microcopy that no longer calls every session a ride.

**Architecture:** The server already stores `discipline` and returns it in the activity payload (PR A). This PR teaches the client to read it: a shared `isStrength` helper, a discipline filter in the query model, and render guards so a strength row shows duration and load instead of distance and elevation. The page summary counts cycling only and states its scope, matching the server's cycling-only aggregates.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4 tokens, Vitest + Testing Library (client), React Router.

**Spec:** `docs/superpowers/specs/2026-10-04-strength-training-design.md` (sections E, D and the microcopy table)

## Global Constraints

- No em dashes (`—`). Use en dash `–` for empty values, middle dot `·` for separators.
- No hardcoded colours. Strength uses the token `--color-strength`; colour is never the only signal (icon + label).
- Never show a number that is not true: a strength session has no distance, so it must not read "0.0 km".
- Labels above fields; every control has an accessible name; icon-only buttons get `aria-label`.
- No new dependencies.
- Every task ends with lint + type-check green, tests green, and a commit.

## Review Focus

- **A strength session in the activity list:** it must not render a distance, elevation, speed or a bike; it shows duration and (when present) TSS.
- **The activity detail page for a strength session:** no Summary distance/elevation/speed tiles, no map, no lap breakdown; it shows duration, load and heart rate.
- **The page summary bar with only strength sessions in range:** it must not claim rides or distance; the cycling count is zero and the scope is stated.
- **Filtering to Strength, then to a cycling type:** the filter must reset cleanly and never return an empty list due to a stale bike filter.
- **A pre-PR row with no `discipline` field:** treated as cycling (backwards compatible), never hidden.

---

### Task 1: Discipline helper and query filter (pure)

**Files:**

- Create: `client/src/features/activity/lib/discipline.ts`
- Test: `client/src/features/activity/lib/discipline.test.ts`
- Modify: `client/src/features/activity/lib/activity-filters.ts`
- Test: `client/src/features/activity/lib/activity-filters.test.ts`

**Interfaces:**

- Consumes: `Activity` (has `discipline` from PR A).
- Produces:
  - `function isStrength(a: { discipline?: string | null }): boolean`
  - `ActivityQuery` gains `discipline: string` (a `Discipline` value or `ALL`)
  - `function summarizeActivities(activities)` counts **cycling only**

- [ ] **Step 1: Write the failing test for `isStrength`**

Create `client/src/features/activity/lib/discipline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isStrength } from './discipline';

describe('isStrength', () => {
  it('is true for a strength session', () => {
    expect(isStrength({ discipline: 'strength' })).toBe(true);
  });
  it('is false for a cycling session', () => {
    expect(isStrength({ discipline: 'cycling' })).toBe(false);
  });
  it('treats a row with no discipline as cycling (pre-PR data)', () => {
    expect(isStrength({})).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd client && npx vitest run src/features/activity/lib/discipline.test.ts`
Expected: FAIL — cannot resolve `./discipline`.

- [ ] **Step 3: Implement `isStrength`**

Create `client/src/features/activity/lib/discipline.ts`:

```ts
/** A row without a discipline predates the column and is cycling. */
export function isStrength(a: { discipline?: string | null }): boolean {
  return a.discipline === 'strength';
}
```

- [ ] **Step 4: Write the failing tests for the filter and summary**

Add to `client/src/features/activity/lib/activity-filters.test.ts` (create if absent) tests that pin the behaviour:

```ts
// summarizeActivities counts cycling only:
//  - a ride of 10_000 m plus a strength session => distance 10_000, count 1
//  - two rides => distance summed, count 2
//  - only strength => distance 0, count 0
// filterActivities with discipline 'strength' returns only strength rows
// filterActivities with discipline ALL returns everything
// a pre-PR row (no discipline) is included by the 'cycling' filter
```

Write the actual `it(...)` blocks with those assertions using `summarizeActivities` and `filterActivities` from `./activity-filters`.

- [ ] **Step 5: Run them to verify they fail**

Run: `cd client && npx vitest run src/features/activity/lib/activity-filters.test.ts`
Expected: FAIL — `discipline` is not part of `ActivityQuery`; summary still counts strength.

- [ ] **Step 6: Extend the query model and the summary**

In `client/src/features/activity/lib/activity-filters.ts`:

- add `discipline: string;` to `ActivityQuery` (value is a `Discipline` or `ALL`);
- add `discipline: ALL` to `defaultActivityQuery`;
- in `filterActivities`, add the predicate `if (query.discipline !== ALL && (a.discipline ?? 'cycling') !== query.discipline) return false;` for both the current and the previous window;
- in `summarizeActivities`, skip strength rows for every metric (`if (isStrength(a)) continue;`) so distance, elevation, time, TSS and count are cycling only. Import `isStrength` from `./discipline`.

- [ ] **Step 7: Run to verify they pass**

Run: `cd client && npx vitest run src/features/activity/lib/`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add client/src/features/activity/lib/discipline.ts client/src/features/activity/lib/discipline.test.ts client/src/features/activity/lib/activity-filters.ts client/src/features/activity/lib/activity-filters.test.ts
git commit -m "feat(activity): discipline filter and cycling-only summary"
```

---

### Task 2: Discipline filter control in the filter bar

**Files:**

- Modify: `client/src/features/activity/components/ActivityFilters.tsx`
- Modify: `client/src/pages/ActivitiesPage.tsx`

**Interfaces:**

- Consumes: `ActivityQuery.discipline` (Task 1).
- Produces: a Discipline select (`All · Cycling · Strength`) in the filter bar; the Reset button clears it too.

- [ ] **Step 1: Add the control**

In `ActivityFilters`, add a `select` with `aria-label="Filter by discipline"` between the date presets and the type select. Options: `All disciplines` (`ALL`), `Cycling` (`cycling`), `Strength` (`strength`). Include `query.discipline` in the `isFiltered` check and reset it to `ALL` in the Reset handler.

- [ ] **Step 2: Seed the query**

In `ActivitiesPage`, add `discipline: 'all'` to the initial query object (it currently builds the query inline; keep the shape in sync with `defaultActivityQuery`).

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run`

```bash
git add client/src/features/activity/components/ActivityFilters.tsx client/src/pages/ActivitiesPage.tsx
git commit -m "feat(activity): add a discipline filter to the activity bar"
```

---

### Task 3: Honest rows in the activity list

**Files:**

- Modify: `client/src/features/activity/components/ActivityList.tsx`
- Modify: `client/src/features/activity/lib/activity-type-style.ts`
- Test: `client/src/features/activity/components/ActivityList.test.tsx`

**Interfaces:**

- Consumes: `isStrength` (Task 1).
- Produces: strength rows show duration (and TSS) with a Strength badge and icon; no distance, speed or elevation.

- [ ] **Step 1: Write the failing test**

Create `client/src/features/activity/components/ActivityList.test.tsx` (`// @vitest-environment jsdom`) rendering `ActivityList` with one ride and one strength session and asserting:

- the ride row shows its formatted distance;
- the strength row does **not** contain `km`;
- the strength row shows its duration.

- [ ] **Step 2: Run it to verify it fails**

Run: `cd client && npx vitest run src/features/activity/components/ActivityList.test.tsx`
Expected: FAIL — the strength row currently renders `0.0 km`.

- [ ] **Step 3: Add the strength accent and guard the rows**

In `activity-type-style.ts`, add `WeightTraining: { dot: 'bg-strength', badge: 'bg-slate-100 text-slate-700' }` (and `Workout`/`Crossfit` similarly) so a strength activity has a visible accent. If `bg-strength` is not a generated utility, use the existing `bg-stone-500` accent instead and note it.

In `ActivityList.tsx` `ActivityRow` and `ActivityCard`: for a strength row, render a `Dumbbell` badge/label instead of the distance column, hide the speed and elevation cells, and keep the duration and `LoadBadge`. Guard the `distance` sort comparator with `?? 0` (already done in PR A).

- [ ] **Step 4: Run to verify it passes**

Run: `cd client && npx vitest run src/features/activity/components/ActivityList.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/features/activity/components/ActivityList.tsx client/src/features/activity/lib/activity-type-style.ts client/src/features/activity/components/ActivityList.test.tsx
git commit -m "feat(activity): render strength rows without distance or elevation"
```

---

### Task 4: Honest detail page and cycling-only summary bar

**Files:**

- Modify: `client/src/features/activity/components/ActivityDetail.tsx`
- Modify: `client/src/features/activity/components/ActivityStatsBar.tsx`
- Modify: `client/src/features/activity/components/ActivityVolumeSparkline.tsx`
- Modify: `client/src/features/activity/lib/activity-volume.ts`

**Interfaces:**

- Consumes: `isStrength` (Task 1).
- Produces: a strength detail page without cycling tiles; a stats bar whose label states it is rides only; a volume sparkline that counts rides only.

- [ ] **Step 1: Detail page**

In `ActivityDetail`, when `isStrength(activity)`: the Summary section shows Moving Time and Elapsed Time only (no Distance, Elevation, Avg/Max Speed, Elev/Low); the Performance section shows Training Load, Calories and the power/cadence metrics only when they exist (they will be null, so `m()` already drops them); the page shows a Strength badge with a `Dumbbell` icon instead of the raw type string.

- [ ] **Step 2: Summary bar scope**

In `ActivityStatsBar`, add a scope line under the grid: `Rides only · strength sessions are not counted` (plain `text-xs text-muted-foreground`). Keep the metrics as they are; they now receive cycling-only numbers from `summarizeActivities`.

- [ ] **Step 3: Sparkline counts rides**

In `activity-volume.ts` `weeklyVolume`, skip strength rows so the distance sparkline is rides only (add `if (isStrength(a)) continue;` inside the `inWeek` filter). This keeps it consistent with the summary bar.

- [ ] **Step 4: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/features/activity/components/ActivityDetail.tsx client/src/features/activity/components/ActivityStatsBar.tsx client/src/features/activity/components/ActivityVolumeSparkline.tsx client/src/features/activity/lib/activity-volume.ts
git commit -m "feat(activity): strength-aware detail and rides-only summary"
```

---

### Task 5: Recent activities and microcopy

**Files:**

- Modify: `client/src/features/dashboard/components/RecentActivities.tsx`
- Modify: `client/src/features/dashboard/components/MetricTooltip.tsx`
- Modify: `client/src/features/dashboard/components/TrainingLoadCard.tsx`
- Modify: `client/src/pages/ActivitiesPage.tsx`

**Interfaces:**

- Consumes: `isStrength` (Task 1).
- Produces: dashboard recent list shows duration for strength; copy no longer says "ride" where it means "session".

- [ ] **Step 1: Recent list**

In `RecentActivities`, for a strength row show the duration instead of the distance, with a `Dumbbell` icon. The slim type in `useDashboardData` already carries `distance: number | null`; add `discipline` to `RecentActivitySlim` and its mapper so the component can branch.

- [ ] **Step 2: Microcopy**

- `MetricTooltip`: change the TSS description from "How hard a ride was…" to "How hard a session was, combining duration and intensity."
- `TrainingLoadCard`: change "Sync rides with power meter data…" and "Keep syncing rides…" to say _sessions_ (the load curve now includes strength).
- `ActivitiesPage`: change the header description to "Your rides and strength sessions synced from Strava."

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/features/dashboard/components/RecentActivities.tsx client/src/features/dashboard/components/MetricTooltip.tsx client/src/features/dashboard/components/TrainingLoadCard.tsx client/src/features/dashboard/hooks/useDashboardData.ts client/src/pages/ActivitiesPage.tsx
git commit -m "feat(activity): strength in recent activities and honest copy"
```

---

## Self-Review Notes

- **Spec coverage:** section D (cycling-only aggregates surface in the UI) → Tasks 1, 3, 4; section E (honest data, discipline filter) → Tasks 1, 2, 3, 4; the microcopy table → Task 5.
- **Review Focus tests:** strength row without distance → Task 3 (component test); cycling-only summary → Task 1 (unit test); pre-PR row treated as cycling → Task 1 (`isStrength` test).
- **Type consistency:** `isStrength` is defined once (Task 1) in the activity feature and imported by the dashboard components.
- **Deferred:** the `ActivityLinker` discipline filter in the plan sheet (mentioned in PR B's deferred list) is included here as part of Task 2's filter work only if it is cheap; otherwise it stays a ledgered minor.
