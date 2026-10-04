# PR A — Strength Discipline Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `discipline` axis to activities and planned workouts, ingest Strava `WeightTraining` as strength with an hrTSS load, and keep every cycling aggregate purely cycling.

**Architecture:** A new `discipline` column (`'cycling' | 'strength'`) on `activities` and `training_plan_workouts` separates the sports without touching the existing 10 cycling `workout_type` values. `activities.distance` becomes nullable because a gym session has no distance. Training load (CTL/ATL/TSB) includes strength automatically because it is derived from a `tssMap` that does not filter by discipline; every cycling-only aggregate gets an explicit `discipline = 'cycling'` filter.

**Tech Stack:** TypeScript (strict, NodeNext), tsyringe DI, Supabase (Postgres + JS client), Express, Vitest (new, server-side unit tests).

**Spec:** `docs/superpowers/specs/2026-10-04-strength-training-design.md`

## Global Constraints

- No em dashes (`—`) anywhere in code or copy. Use en dash `–` for ranges/empty values, middle dot `·` for separators, colon `:` for labels.
- Migrations are applied **manually** via the Supabase SQL Editor; there is no `DATABASE_URL`/`psql` locally. Every migration must be idempotent and the server must keep a working fallback if a function is absent.
- Currency is fixed to IDR. Do not introduce FX.
- No new runtime dependencies. `vitest` is a devDependency only.
- Server ESM: relative imports end in `.js` (NodeNext).
- Tests use **Vitest**, not Jest. Client tests run in the default `node` environment unless a file opts in.
- Every task ends with lint + type-check green and a commit.

## Review Focus

- **Strava `WeightTraining` with no heart rate:** `average_heartrate` is null and `max_heartrate` is null, so `tss` must be `null`, not `0` and not `NaN`. A reasonable person expects "unknown load", not "no load".
- **`distance` is `null` for strength:** every `Number(a.distance)` / `formatDistance(a.distance)` call site must not render `NaN km` or `0.0 km`.
- **`activity_stats` RPC absent or not yet applied:** the endpoint must still answer, via the Node fallback, with cycling-only numbers.
- **A gym session on the same day as a ride:** `days_since_last_ride` must still measure rides only, and `consecutive_days` must still count the gym day as a training day.
- **A strength workout scheduled with no matching Strava activity:** the plan must not auto-complete it, and nothing may crash when it stays `planned`.

---

### Task 1: Test runner + pure discipline mapping

**Files:**

- Create: `server/vitest.config.ts`
- Modify: `server/package.json` (scripts + devDependency)
- Create: `server/src/domain/entities/activity/discipline.ts`
- Test: `server/src/domain/entities/activity/discipline.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `type Discipline = 'cycling' | 'strength'`
  - `function disciplineForStravaType(type: string): Discipline`
  - `const STRENGTH_STRAVA_TYPES: readonly string[]`

- [ ] **Step 1: Add Vitest to the server**

Add to `server/package.json` `devDependencies`: `"vitest": "^3.2.4"`.
Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

Create `server/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing test**

Create `server/src/domain/entities/activity/discipline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { disciplineForStravaType, STRENGTH_STRAVA_TYPES } from './discipline.js';

describe('disciplineForStravaType', () => {
  it('classifies WeightTraining as strength', () => {
    expect(disciplineForStravaType('WeightTraining')).toBe('strength');
  });

  it('classifies every declared strength type as strength', () => {
    for (const type of STRENGTH_STRAVA_TYPES) {
      expect(disciplineForStravaType(type)).toBe('strength');
    }
  });

  it('classifies ride types as cycling', () => {
    expect(disciplineForStravaType('Ride')).toBe('cycling');
    expect(disciplineForStravaType('VirtualRide')).toBe('cycling');
  });

  it('classifies an unknown type as cycling', () => {
    expect(disciplineForStravaType('SomethingNew')).toBe('cycling');
  });

  it('is case-sensitive and does not guess from substrings', () => {
    expect(disciplineForStravaType('weighttraining')).toBe('cycling');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd server && npx vitest run src/domain/entities/activity/discipline.test.ts`
Expected: FAIL — cannot resolve `./discipline.js`.

- [ ] **Step 4: Implement the mapping**

Create `server/src/domain/entities/activity/discipline.ts`:

```ts
/** The two training disciplines Veloer tracks. */
export type Discipline = 'cycling' | 'strength';

/**
 * Strava activity types treated as strength training. Kept as a list so the
 * mapping is one edit when Strava adds another lifting type.
 */
export const STRENGTH_STRAVA_TYPES: readonly string[] = ['WeightTraining', 'Workout', 'Crossfit'];

/**
 * Map a Strava activity type to a discipline. Anything not listed is cycling,
 * which keeps the default behaviour identical to before this change.
 */
export function disciplineForStravaType(type: string): Discipline {
  return STRENGTH_STRAVA_TYPES.includes(type) ? 'strength' : 'cycling';
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd server && npx vitest run src/domain/entities/activity/discipline.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add server/package.json server/vitest.config.ts server/src/domain/entities/activity/discipline.ts server/src/domain/entities/activity/discipline.test.ts
git commit -m "test(server): add vitest and discipline mapping"
```

---

### Task 2: Strength load (hrTSS) as a pure function

**Files:**

- Create: `server/src/domain/entities/activity/training-load.ts`
- Test: `server/src/domain/entities/activity/training-load.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `function computeStrengthTss(input: StrengthTssInput): number | null`
  - `interface StrengthTssInput { moving_time: number; avg_hr: number | null; max_hr: number | null; lthr: number | null }`

- [ ] **Step 1: Write the failing test**

Create `server/src/domain/entities/activity/training-load.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { computeStrengthTss } from './training-load.js';

describe('computeStrengthTss', () => {
  it('returns null when there is no heart rate', () => {
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: null, max_hr: null, lthr: 165 }),
    ).toBeNull();
  });

  it('returns null when there is no usable LTHR', () => {
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: 120, max_hr: null, lthr: null }),
    ).toBeNull();
  });

  it('returns null for a zero-duration session', () => {
    expect(computeStrengthTss({ moving_time: 0, avg_hr: 120, max_hr: 180, lthr: 160 })).toBeNull();
  });

  it('uses the stored LTHR when present', () => {
    // hrIF = 160/160 = 1.0; TSS = 1h * 1^2 * 100 = 100
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: 160, max_hr: 190, lthr: 160 }),
    ).toBeCloseTo(100, 5);
  });

  it('falls back to 88% of max HR when LTHR is absent', () => {
    // effectiveLthr = round(180 * 0.88) = 158; hrIF = 158/158 = 1.0 → 100
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: 158, max_hr: 180, lthr: null }),
    ).toBeCloseTo(100, 5);
  });

  it('scales with duration and intensity', () => {
    // 30 min at hrIF 0.5 → 0.5 * 0.25 * 100 = 12.5
    expect(
      computeStrengthTss({ moving_time: 1800, avg_hr: 80, max_hr: 180, lthr: 160 }),
    ).toBeCloseTo(12.5, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npx vitest run src/domain/entities/activity/training-load.test.ts`
Expected: FAIL — cannot resolve `./training-load.js`.

- [ ] **Step 3: Implement `computeStrengthTss`**

Create `server/src/domain/entities/activity/training-load.ts`. Use the same hrTSS formula already used in `SyncStravaActivities` (lines 96–104): `tss = (moving_time / 3600) * hrIF^2 * 100`, with `effectiveLthr = lthr ?? Math.round(max_hr * 0.88)`. Return `null` when `avg_hr` is missing, when there is no usable LTHR, or when `moving_time <= 0`.

```ts
export interface StrengthTssInput {
  moving_time: number;
  avg_hr: number | null;
  max_hr: number | null;
  lthr: number | null;
}

/**
 * hrTSS for a strength session. Strength has no power, so load can only come
 * from heart rate; when there is none we return null rather than guessing.
 */
export function computeStrengthTss(input: StrengthTssInput): number | null {
  const { moving_time, avg_hr, max_hr, lthr } = input;
  if (!avg_hr || moving_time <= 0) return null;
  const effectiveLthr = lthr ?? (max_hr ? Math.round(max_hr * 0.88) : null);
  if (!effectiveLthr || effectiveLthr <= 0) return null;
  const hrIf = avg_hr / effectiveLthr;
  return (moving_time / 3600) * hrIf * hrIf * 100;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npx vitest run src/domain/entities/activity/training-load.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/domain/entities/activity/training-load.ts server/src/domain/entities/activity/training-load.test.ts
git commit -m "feat(server): extract strength hrTSS as a pure function"
```

---

### Task 3: Migration 021 — discipline columns and cycling-only stats

**Files:**

- Create: `supabase/migrations/021_strength_discipline.sql`

**Interfaces:**

- Consumes: nothing.
- Produces: DB columns `activities.discipline`, `activities.distance` (nullable), `training_plan_workouts.discipline`, `training_plan_workouts.exercises`; redefined function `activity_stats(uuid, date, date)` filtering `discipline = 'cycling'`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/021_strength_discipline.sql`. It must be idempotent and safe to run twice. Required contents:

- `ALTER TABLE activities ADD COLUMN IF NOT EXISTS discipline TEXT NOT NULL DEFAULT 'cycling'` plus a `CHECK (discipline IN ('cycling','strength'))` constraint added only if absent (guard with a `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activities_discipline_check') THEN ... END IF; $$;`).
- `ALTER TABLE activities ALTER COLUMN distance DROP NOT NULL;`
- Same `discipline` column + guarded check for `training_plan_workouts`.
- Drop the existing `workout_type` check and re-add it including the five strength types: `'recovery','endurance','tempo','sweet_spot','threshold','vo2max','anaerobic','sprint','race','interval','lower','upper','full_body','core','mobility'`. Drop by the constraint name that 015 created (find it first: it is the unnamed check on `workout_type`, so locate it in Step 2 and drop by the name you find).
- `ALTER TABLE training_plan_workouts ADD COLUMN IF NOT EXISTS exercises JSONB;`
- `CREATE INDEX IF NOT EXISTS idx_activities_discipline ON activities(user_id, discipline);`
- `CREATE OR REPLACE FUNCTION activity_stats(...)` — same signature and return columns as `019_activity_stats_aggregate.sql`, with an added `AND a.discipline = 'cycling'` in the `WHERE`, then re-`GRANT EXECUTE`.

- [ ] **Step 2: Find the real constraint name for the workout_type check**

Run this against the Supabase SQL Editor (there is no local psql) and record the result in the migration comment:

```sql
SELECT conname FROM pg_constraint
WHERE conrelid = 'training_plan_workouts'::regclass AND contype = 'c';
```

Use the returned name in a `DROP CONSTRAINT IF EXISTS` before re-adding the widened check. If 015 created it inline, Postgres names it `training_plan_workouts_workout_type_check`.

- [ ] **Step 3: Verify the SQL parses**

There is no local Postgres, so verify by inspection against `019_activity_stats_aggregate.sql` (same function body plus the discipline filter) and by confirming the file has no unbalanced `$$`. Re-read the file top to bottom once.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/021_strength_discipline.sql
git commit -m "feat(db): add discipline axis and cycling-only activity_stats"
```

Note in the commit body that the migration is applied manually via the SQL Editor.

---

### Task 4: Domain entities and repository contract

**Files:**

- Modify: `server/src/domain/entities/activity/Activity.ts`
- Modify: `server/src/domain/entities/training/TrainingWorkout.ts`
- Modify: `server/src/domain/repositories/activity/ActivityRepository.ts`

**Interfaces:**

- Consumes: `Discipline` from Task 1.
- Produces:
  - `Activity.discipline: Discipline`, `Activity.distance: number | null`
  - `TrainingWorkout.discipline: Discipline`, `TrainingWorkout.exercises: WorkoutExercise[] | null`
  - `interface WorkoutExercise { name: string; sets: number; reps: number; weight_kg: number | null }`
  - `ActivityRepository.findByUserId(userId, options?)` where `options` gains `discipline?: Discipline`
  - `ActivityRepository.getStats(userId, startDate?, endDate?)` unchanged in shape (cycling-only is enforced in the implementation)

- [ ] **Step 1: Update the Activity entity**

In `server/src/domain/entities/activity/Activity.ts`: import `Discipline`, add `discipline: Discipline;`, change `distance: number;` to `distance: number | null; // meters; null for strength`.

- [ ] **Step 2: Update the TrainingWorkout entity**

In `server/src/domain/entities/training/TrainingWorkout.ts`: add

```ts
export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
}
```

Extend the `WorkoutType` union with `'lower' | 'upper' | 'full_body' | 'core' | 'mobility'`, add `discipline: Discipline;` and `exercises: WorkoutExercise[] | null;` to `TrainingWorkout`, and add `discipline?: Discipline;` and `exercises?: WorkoutExercise[] | null;` to `TrainingWorkoutCreateData`.

- [ ] **Step 3: Extend the repository interface**

In `server/src/domain/repositories/activity/ActivityRepository.ts`: add `discipline?: Discipline` to the `findByUserId` options object and import the type.

- [ ] **Step 4: Type-check**

Run: `cd server && npx tsc --noEmit`
Expected: errors are **expected** at this point in the repositories/use-cases that construct `Activity`/`TrainingWorkout` (they do not yet supply `discipline`). Record the error list; Tasks 5–7 close them. Do not commit until the whole server compiles (Step 5 of Task 7).

- [ ] **Step 5: Commit the entity + contract change together with its consumers**

Do not commit here in isolation; commit at the end of Task 7 when the server compiles again. (Kept as a step so the ordering is explicit.)

---

### Task 5: Ingest — sync Strava strength sessions

**Files:**

- Modify: `server/src/application/use-cases/activity/SyncStravaActivities.ts`
- Modify: `server/src/application/ports/StravaPort.ts` (only if `StravaActivity` lacks a field used below; it already has `average_heartrate`, `max_heartrate`, `moving_time`)

**Interfaces:**

- Consumes: `disciplineForStravaType` (Task 1), `computeStrengthTss` (Task 2), `Activity.discipline`/`distance: number | null` (Task 4).
- Produces: synced strength rows with `discipline='strength'`, `distance=null`, `bike_id=null`, `tss` from hrTSS; strength auto-link to a same-day planned strength workout.

- [ ] **Step 1: Widen the fetch filter and split by discipline**

In `SyncStravaActivities.execute`, replace the ride-only filter (lines 68–70) so the fetched list keeps ride types **and** strength types:

```ts
const relevant = stravaActivities.filter(
  (a) => a.type === 'Ride' || a.type === 'VirtualRide' || STRENGTH_STRAVA_TYPES.includes(a.type),
);
```

- [ ] **Step 2: Branch the per-activity mapping**

Inside the `for (const sa of relevant)` loop, compute `const discipline = disciplineForStravaType(sa.type);`. For `'strength'`: `distance = null`, `bike_id = null`, `tss = computeStrengthTss({ moving_time: sa.moving_time, avg_hr: sa.average_heartrate, max_hr: sa.max_heartrate, lthr })`. For `'cycling'`: keep the existing power/HR TSS branch unchanged. Both branches push `discipline` into `toCreate`.

- [ ] **Step 3: Branch the auto-link**

In the auto-link block (lines 142–193): for a cycling activity keep the existing duration + zone scoring. For a strength activity, consider only planned workouts whose `discipline === 'strength'`, score by duration within ±30 minutes only (no zone term), and require the workout to be `status === 'planned'`. Link with `status: 'completed'`, `actual_activity_id`, `actual_tss`, `actual_duration_minutes`, `completed_at`.

- [ ] **Step 4: Verify by inspection + type-check**

Run: `cd server && npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 5: Commit**

```bash
git add server/src/application/use-cases/activity/SyncStravaActivities.ts
git commit -m "feat(server): sync Strava strength sessions with hrTSS"
```

---

### Task 6: Cycling-only aggregation boundary

**Files:**

- Modify: `server/src/infrastructure/database/repositories/activity/SupabaseActivityRepository.ts`
- Modify: `server/src/infrastructure/database/repositories/goals/SupabaseGoalRepository.ts`
- Test: `server/src/infrastructure/database/repositories/activity/cycling-filter.test.ts`

**Interfaces:**

- Consumes: `Discipline` (Task 1).
- Produces: `getStats` and `activityValueInRange` count cycling rows only.

- [ ] **Step 1: Write the failing test (pure predicate)**

Create `server/src/infrastructure/database/repositories/activity/cycling-filter.test.ts`. Because the Supabase query builder cannot be unit-tested without a DB, test the pure helper you will add: `isCycling(row: { discipline?: string | null }): boolean`.

```ts
import { describe, expect, it } from 'vitest';
import { isCycling } from './cycling-filter.js';

describe('isCycling', () => {
  it('treats an explicit cycling row as cycling', () => {
    expect(isCycling({ discipline: 'cycling' })).toBe(true);
  });
  it('treats a strength row as not cycling', () => {
    expect(isCycling({ discipline: 'strength' })).toBe(false);
  });
  it('treats a missing discipline (pre-migration row) as cycling', () => {
    expect(isCycling({})).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npx vitest run src/infrastructure/database/repositories/activity/cycling-filter.test.ts`
Expected: FAIL — cannot resolve `./cycling-filter.js`.

- [ ] **Step 3: Implement the predicate and wire the queries**

Create `server/src/infrastructure/database/repositories/activity/cycling-filter.ts`:

```ts
/** Rows without a discipline predate the column and are cycling. */
export function isCycling(row: { discipline?: string | null }): boolean {
  return (row.discipline ?? 'cycling') === 'cycling';
}
```

In `SupabaseActivityRepository`:

- add `'discipline'` to `LIST_COLUMNS`;
- in `getStats`, the RPC already filters cycling (Task 3), so only the fallback needs it: add `.eq('discipline', 'cycling')` to `getStatsFallback`'s query;
- in `findByUserId`, honour `options.discipline` with `.eq('discipline', options.discipline)` when present.

In `SupabaseGoalRepository.activityValueInRange`: add `.eq('discipline', 'cycling')` to the activities query so distance/time/elevation/count goals are never filled by gym sessions.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npx vitest run src/infrastructure/database/repositories/activity/cycling-filter.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/infrastructure/database/repositories/activity/cycling-filter.ts server/src/infrastructure/database/repositories/activity/cycling-filter.test.ts server/src/infrastructure/database/repositories/activity/SupabaseActivityRepository.ts server/src/infrastructure/database/repositories/goals/SupabaseGoalRepository.ts
git commit -m "fix(server): keep cycling aggregates cycling-only"
```

---

### Task 7: Recommendation + fitness analysis correctness

**Files:**

- Modify: `server/src/application/use-cases/training/GenerateRecommendation.ts`
- Modify: `server/src/application/use-cases/training/AnalyzeStravaFitness.ts`
- Test: `server/src/application/use-cases/training/last-ride.test.ts`

**Interfaces:**

- Consumes: `Activity.discipline` (Task 4), `isCycling` (Task 6).
- Produces: `days_since_last_ride` counts cycling only; `consecutive_days` counts all disciplines; `AnalyzeStravaFitness` volume/CTL are cycling-only.

- [ ] **Step 1: Write the failing test**

Create `server/src/application/use-cases/training/last-ride.test.ts` for a pure helper `daysSinceLastRide(activities, today)` you will add.

```ts
import { describe, expect, it } from 'vitest';
import { daysSinceLastRide } from './last-ride.js';

const today = new Date('2026-10-04T00:00:00Z');

describe('daysSinceLastRide', () => {
  it('ignores strength sessions when measuring days since the last ride', () => {
    const activities = [
      { start_date: '2026-10-01T08:00:00Z', discipline: 'cycling' },
      { start_date: '2026-10-04T08:00:00Z', discipline: 'strength' },
    ];
    expect(daysSinceLastRide(activities, today)).toBe(3);
  });

  it('returns 999 when there are no rides at all', () => {
    const activities = [{ start_date: '2026-10-04T08:00:00Z', discipline: 'strength' }];
    expect(daysSinceLastRide(activities, today)).toBe(999);
  });

  it('measures from the most recent ride', () => {
    const activities = [
      { start_date: '2026-09-30T08:00:00Z', discipline: 'cycling' },
      { start_date: '2026-10-02T08:00:00Z', discipline: 'cycling' },
    ];
    expect(daysSinceLastRide(activities, today)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npx vitest run src/application/use-cases/training/last-ride.test.ts`
Expected: FAIL — cannot resolve `./last-ride.js`.

- [ ] **Step 3: Implement the helper and wire both use cases**

Create `server/src/application/use-cases/training/last-ride.ts`:

```ts
/** Days since the most recent cycling activity; 999 when there is none. */
export function daysSinceLastRide(
  activities: { start_date: string; discipline?: string | null }[],
  today: Date,
): number {
  let last: number | null = null;
  for (const a of activities) {
    if ((a.discipline ?? 'cycling') !== 'cycling') continue;
    const t = new Date(a.start_date.split('T')[0]).getTime();
    if (last === null || t > last) last = t;
  }
  if (last === null) return 999;
  const start = new Date(today.toISOString().split('T')[0]).getTime();
  return Math.floor((start - last) / 86_400_000);
}
```

In `GenerateRecommendation`: replace the inline `lastRideDate`/`days_since_last_ride` computation (lines 64–71, 110–113) with `daysSinceLastRide(activities, today)`. Keep `consecutive_days` counting every discipline (it already reads `tssMap`, which is discipline-agnostic – leave it).

In `AnalyzeStravaFitness`: restrict the activity set used for **volume and CTL** to cycling (`activities.filter(isCycling)`), leaving the power-based FTP estimate as-is (it is already power-gated).

- [ ] **Step 4: Run all server tests + type-check**

Run: `cd server && npx vitest run && npx tsc --noEmit`
Expected: all tests PASS and **zero** type errors (this closes the Task 4 deferral).

- [ ] **Step 5: Commit**

```bash
git add server/src/application/use-cases/training/last-ride.ts server/src/application/use-cases/training/last-ride.test.ts server/src/application/use-cases/training/GenerateRecommendation.ts server/src/application/use-cases/training/AnalyzeStravaFitness.ts server/src/domain/entities/activity/Activity.ts server/src/domain/entities/training/TrainingWorkout.ts server/src/domain/repositories/activity/ActivityRepository.ts
git commit -m "fix(server): measure days since last ride over cycling only"
```

---

### Task 8: Wire tests into CI and verify end to end

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: `server/src/interfaces/controllers/ActivityController.ts` (only if `updateBike` needs a discipline guard)

**Interfaces:**

- Consumes: everything above.
- Produces: CI runs `npm test` for the server; `updateBike` refuses to link a strength activity to a bike.

- [ ] **Step 1: Add a test step to CI**

In `.github/workflows/ci.yml`, after the type-check step, add:

```yaml
- name: Run server tests
  run: npm test
  working-directory: ./server
```

- [ ] **Step 2: Guard `updateBike` against strength activities**

In `ActivityController.updateBike`, after fetching the activity, if `activity.discipline === 'strength'` respond `400` with `{ error: 'Bad Request', message: 'A strength session cannot be linked to a bike.' }`. This is the server half of the spec's guard; the UI half is PR C.

- [ ] **Step 3: Run the full local gate**

Run: `npm run lint && npm run type-check && cd server && npm test && cd .. && npm run build`
Expected: lint clean, type-check clean, all tests PASS, both builds succeed.

- [ ] **Step 4: Verify the migration is applied and the endpoint answers**

Apply `021_strength_discipline.sql` in the Supabase SQL Editor for project `hzfuvacjyvnwbqrmskjm`. Then, with the server running on `:3001`, hit `GET /api/activities/stats` with the test user's cookie and confirm the numbers match the pre-migration values (no gym session yet, so they must be identical). Then sync Strava and confirm a `WeightTraining` session appears with `discipline='strength'` and `distance` null.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml server/src/interfaces/controllers/ActivityController.ts
git commit -m "ci: run server tests; block linking strength to a bike"
```

---

## Self-Review Notes

- **Spec coverage:** A → Task 3; B → Task 5; C → Task 7; D → Tasks 3, 6; the server half of the bike guard → Task 8. UI sections (E, F) are PR B/C/D and deliberately absent here.
- **Review Focus tests:** no-HR strength → Task 2; null distance call sites → deferred to PR C (the client is the only renderer, and PR A adds no renderer); missing RPC → Task 3 (fallback preserved in Task 6); gym-on-ride-day → Task 7; unmatched planned strength workout → Task 5 Step 3 (`status === 'planned'` requirement).
- **Type consistency:** `Discipline` is defined once (Task 1) and imported everywhere; `WorkoutExercise` is defined once (Task 4); `daysSinceLastRide` and `isCycling` are named identically where referenced.
- **Known deferred work:** Task 4 does not compile in isolation by design; the plan says so and Task 7 closes it. PR A leaves `Activity.distance` nullable while the client still assumes a number – that is intentional and fixed in PR C.
