# PR G — Maintenance Page (functionality + UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Maintenance page work end to end: reminders can be created, edited, completed and deleted; a log can be attributed to a component; and the page answers "what needs doing?" with a wear rail that matches the component cards.

**Architecture:** Two pure modules carry the logic that is worth testing: `schedule-status` (how far along a reminder is, and its band) and `schedule-due` (computing the next due date/km from an interval). Components stay thin and consume those. The page is restructured into one scroll: needs-attention first, forward metrics, then history.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4 tokens, Base UI primitives, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-04-maintenance-repair-design.md` (sections B and C)

## Global Constraints

- No em dashes (`—`). En dash `–` for ranges/empty values, middle dot `·` for separators.
- No hardcoded colours. The rail reuses the existing lifespan tokens (`bg-emerald-500` / `bg-amber-500` / `bg-orange-500` / `bg-red-600`) via the shared `lifespanBar` map, so a reminder and a component read the same.
- Colour is never the only signal: a band always carries a text label or a number.
- Labels above fields; every control has an accessible name; icon-only buttons get `aria-label`; tap targets ≥44px on mobile.
- Inputs use `text-base` (already the `Input` default) so iOS does not zoom.
- One `<Card>` primitive; `rounded-lg` for structural elements; shared `EmptyState` / `Skeleton*` / `FormField` / `Alert`.
- No new dependencies.
- Every task ends with lint + type-check green, tests green, and a commit.

## Review Focus

- **A reminder with an interval but no due values yet:** it must not render as "overdue"; it is simply not scheduled, and the rail must show that honestly.
- **A reminder due by km on a bike whose odometer went backwards** (a corrected reading): the rail must not produce a negative or over-100% width.
- **"Mark done" on a reminder with an interval:** the next due date and km must both advance from the service just performed, not from the old due values.
- **A reminder with neither interval nor due values:** it must not appear in "needs attention" at all.
- **A log form opened with no components on the bike:** the component picker must be absent or disabled, not an empty select that looks broken.

---

### Task 1: Schedule status and band (pure)

**Files:**

- Create: `client/src/features/maintenance/lib/schedule-status.ts`
- Test: `client/src/features/maintenance/lib/schedule-status.test.ts`

**Interfaces:**

- Consumes: `MaintenanceSchedule`.
- Produces:
  - `type ScheduleBand = 'unscheduled' | 'ok' | 'soon' | 'due' | 'overdue'`
  - `interface ScheduleProgress { band: ScheduleBand; /** 0..1 along the rail, null when unscheduled */ progress: number | null; /** km or days remaining; null when unknown */ remainingKm: number | null; remainingDays: number | null }`
  - `function scheduleProgress(schedule, currentKm, today): ScheduleProgress`

- [ ] **Step 1: Write the failing test**

Create `client/src/features/maintenance/lib/schedule-status.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { scheduleProgress } from './schedule-status';
import type { MaintenanceSchedule } from '../types/maintenance';

function schedule(overrides: Partial<MaintenanceSchedule> = {}): MaintenanceSchedule {
  return {
    id: 's1',
    bike_id: 'b1',
    component_id: null,
    task_name: 'Chain lube',
    interval_km: 500,
    interval_days: null,
    last_performed_date: '2026-09-01',
    last_performed_km: 1000,
    next_due_date: null,
    next_due_km: 1500,
    is_active: true,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

const today = new Date('2026-10-04T00:00:00Z');

describe('scheduleProgress', () => {
  it('reports unscheduled when there is no interval and no due value', () => {
    const p = scheduleProgress(
      schedule({ interval_km: null, next_due_km: null, last_performed_km: null }),
      1200,
      today,
    );
    expect(p.band).toBe('unscheduled');
    expect(p.progress).toBeNull();
  });

  it('computes progress along the rail from last performed to due', () => {
    // 1000 -> 1500, now at 1250 = halfway
    const p = scheduleProgress(schedule(), 1250, today);
    expect(p.band).toBe('ok');
    expect(p.progress).toBeCloseTo(0.5, 5);
    expect(p.remainingKm).toBe(250);
  });

  it('marks a reminder due when the odometer reaches the due km', () => {
    expect(scheduleProgress(schedule(), 1500, today).band).toBe('due');
  });

  it('marks a reminder overdue when the odometer passes the due km', () => {
    const p = scheduleProgress(schedule(), 1600, today);
    expect(p.band).toBe('overdue');
    expect(p.remainingKm).toBe(-100);
  });

  it('marks a reminder soon when within 15 percent of the interval', () => {
    // 1000 -> 1500, 15% = 75 km, so 1430 is soon
    expect(scheduleProgress(schedule(), 1430, today).band).toBe('soon');
  });

  it('never reports negative progress or more than one when the odometer goes backwards', () => {
    const p = scheduleProgress(schedule(), 900, today);
    expect(p.progress).toBe(0);
    expect(p.band).toBe('ok');
  });

  it('works from a due date when there is no km trigger', () => {
    const s = schedule({
      interval_km: null,
      next_due_km: null,
      interval_days: 30,
      last_performed_km: null,
      last_performed_date: '2026-09-01',
      next_due_date: '2026-10-01',
    });
    expect(scheduleProgress(s, 0, today).band).toBe('overdue');
    expect(scheduleProgress(s, 0, new Date('2026-09-20T00:00:00Z')).band).toBe('soon');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd client && npx vitest run src/features/maintenance/lib/schedule-status.test.ts`
Expected: FAIL — cannot resolve `./schedule-status`.

- [ ] **Step 3: Implement `scheduleProgress`**

Create `client/src/features/maintenance/lib/schedule-status.ts`. Rules the tests pin:

- A km trigger exists when `next_due_km != null`; a date trigger when `next_due_date != null`. Neither → `unscheduled`.
- For a km trigger: `remainingKm = next_due_km - currentKm`; the rail spans `last_performed_km ?? (next_due_km - interval_km)` to `next_due_km`; clamp progress to `[0, 1]`.
- Band from km: `remainingKm <= 0` → `overdue` (strictly less than 0) or `due` (exactly 0); `remainingKm <= 0.15 * interval_km` → `soon`; else `ok`. When there is no interval, `soon` is not used.
- For a date trigger (no km): compare `next_due_date` to `today` in whole days, with the same banding where `soon` is within 3 days.
- Prefer the km trigger when both exist (distance is the wear driver for a bike).

- [ ] **Step 4: Run it to verify it passes**

Run: `cd client && npx vitest run src/features/maintenance/lib/schedule-status.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/features/maintenance/lib/schedule-status.ts client/src/features/maintenance/lib/schedule-status.test.ts
git commit -m "feat(maintenance): compute reminder progress and band"
```

---

### Task 2: Next-due arithmetic (pure)

**Files:**

- Create: `client/src/features/maintenance/lib/schedule-due.ts`
- Test: `client/src/features/maintenance/lib/schedule-due.test.ts`

**Interfaces:**

- Consumes: `MaintenanceSchedule`.
- Produces:
  - `function nextDueFrom(schedule, performedKm: number, performedDate: string): { next_due_km: number | null; next_due_date: string | null }`

- [ ] **Step 1: Write the failing test**

Create `client/src/features/maintenance/lib/schedule-due.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { nextDueFrom } from './schedule-due';
import type { MaintenanceSchedule } from '../types/maintenance';

const base: MaintenanceSchedule = {
  id: 's1',
  bike_id: 'b1',
  component_id: null,
  task_name: 'Chain lube',
  interval_km: 500,
  interval_days: 30,
  last_performed_date: null,
  last_performed_km: null,
  next_due_date: null,
  next_due_km: null,
  is_active: true,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
};

describe('nextDueFrom', () => {
  it('advances the due km from the service just performed', () => {
    expect(nextDueFrom(base, 1200, '2026-10-04').next_due_km).toBe(1700);
  });

  it('advances the due date from the service just performed', () => {
    expect(nextDueFrom(base, 1200, '2026-10-04').next_due_date).toBe('2026-11-03');
  });

  it('leaves a trigger null when there is no interval for it', () => {
    const onlyKm = { ...base, interval_days: null };
    expect(nextDueFrom(onlyKm, 1200, '2026-10-04').next_due_date).toBeNull();
    const onlyDays = { ...base, interval_km: null };
    expect(nextDueFrom(onlyDays, 1200, '2026-10-04').next_due_km).toBeNull();
  });

  it('returns both null when neither interval is set', () => {
    const none = { ...base, interval_km: null, interval_days: null };
    expect(nextDueFrom(none, 1200, '2026-10-04')).toEqual({
      next_due_km: null,
      next_due_date: null,
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd client && npx vitest run src/features/maintenance/lib/schedule-due.test.ts`
Expected: FAIL — cannot resolve `./schedule-due`.

- [ ] **Step 3: Implement `nextDueFrom`**

Create `client/src/features/maintenance/lib/schedule-due.ts`. Add `interval_days` to the performed date using local-date arithmetic (construct a `Date` from the ISO date parts, add days, format back to `YYYY-MM-DD`) so a timezone offset cannot shift the day.

- [ ] **Step 4: Run it to verify it passes**

Run: `cd client && npx vitest run src/features/maintenance/lib/schedule-due.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/features/maintenance/lib/schedule-due.ts client/src/features/maintenance/lib/schedule-due.test.ts
git commit -m "feat(maintenance): derive the next due date and distance"
```

---

### Task 3: Schedule API hook

**Files:**

- Create: `client/src/features/maintenance/hooks/useSchedules.ts`
- Modify: `client/src/features/maintenance/index.ts`

**Interfaces:**

- Consumes: `maintenanceApi.listSchedules`, `.createSchedule`, `.updateSchedule`, `.deleteSchedule`.
- Produces: `useSchedules(bikeId: string | null): { schedules, loading, error, refetch, createSchedule, updateSchedule, deleteSchedule }` with the same shape as `useMaintenanceLogs`.

- [ ] **Step 1: Implement the hook**

Mirror `useMaintenanceLogs` exactly: a `refetchFlag`, a `useEffect` keyed on `[bikeId, refetchFlag]`, and `useCallback` mutators that call the API then bump the flag. `createSchedule` takes `(formData: ScheduleFormData)`; `updateSchedule` takes `(id, data: Partial<MaintenanceSchedule>)`; `deleteSchedule` takes `(id)`.

- [ ] **Step 2: Export it**

Add `export { useSchedules } from './hooks/useSchedules';` to `client/src/features/maintenance/index.ts`.

- [ ] **Step 3: Verify and commit**

Run: `cd client && npm run type-check && npm run lint`

```bash
git add client/src/features/maintenance/hooks/useSchedules.ts client/src/features/maintenance/index.ts
git commit -m "feat(maintenance): add the schedule data hook"
```

---

### Task 4: ScheduleForm and ScheduleList

**Files:**

- Create: `client/src/features/maintenance/components/ScheduleForm.tsx`
- Create: `client/src/features/maintenance/components/ScheduleList.tsx`
- Modify: `client/src/features/maintenance/index.ts`

**Interfaces:**

- Consumes: `nextDueFrom` (Task 2), `scheduleProgress` (Task 1), `lifespanBar`/`lifespanText` from `@/features/inventory/lib/lifespan`.
- Produces:
  - `<ScheduleForm bikeId components schedule? onSubmit onCancel />`
  - `<ScheduleList schedules currentKm loading onEdit onDelete onMarkDone />`

- [ ] **Step 1: Build `ScheduleForm`**

Fields: Task name (required), Component (optional select, populated from the `components` prop), Interval (km), Interval (days), and an optional manual Next due (km + date) as an override. Use `FormField` for each. Submit via the passed `onSubmit`. When the bike has no components, omit the component select entirely (do not render an empty one).

- [ ] **Step 2: Build `ScheduleList`**

Each row shows the task name, the component name when set, and the rail from `scheduleProgress`:

```
Chain lube · Cassette                   240 km left
├──────────────────●──────────────────────┤
120 km ago        now                 500 km
```

The rail is a two-tone track: the travelled part in the band colour (`lifespanBar`), the remainder in `bg-secondary`. `unscheduled` rows show "Not scheduled" instead of a rail, with no band colour. A `soon`/`due`/`overdue` row shows **Mark done** and **Log service** buttons; the rest show only the row menu (Edit, Delete). Use `SkeletonTable` while loading and `EmptyState` when empty.

- [ ] **Step 3: Export both**

Add both to `client/src/features/maintenance/index.ts`.

- [ ] **Step 4: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npm run build`

```bash
git add client/src/features/maintenance/components/ScheduleForm.tsx client/src/features/maintenance/components/ScheduleList.tsx client/src/features/maintenance/index.ts
git commit -m "feat(maintenance): schedule list with a wear rail, and the form"
```

---

### Task 5: Component picker in the log form

**Files:**

- Modify: `client/src/features/maintenance/components/MaintenanceForm.tsx`

**Interfaces:**

- Consumes: a new `components: { id: string; name: string }[]` prop.
- Produces: the log can be attributed to a component from the Maintenance page.

- [ ] **Step 1: Add the prop and the select**

Add `components` to `MaintenanceFormProps`. Render a Component `select` (with an empty "Whole bike" option) bound to `formData.component_id`. When `components.length === 0`, do not render the select.

- [ ] **Step 2: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run`

```bash
git add client/src/features/maintenance/components/MaintenanceForm.tsx
git commit -m "feat(maintenance): attribute a service log to a component"
```

---

### Task 6: Rebuild the Maintenance page

**Files:**

- Modify: `client/src/pages/MaintenancePage.tsx`
- Modify: `client/src/features/maintenance/components/DueAlerts.tsx` (delete it; its job moves into the page)

**Interfaces:**

- Consumes: everything above, plus `componentApi.listByBike` and `nextDueFrom`.
- Produces: the page in the order header → **Needs attention** → forward metrics → **Service history**.

- [ ] **Step 1: Load schedules and components**

Add `useSchedules(selectedBike?.id ?? null)` and load the selected bike's components with `componentApi.listByBike`, refreshing when the bike changes.

- **Step 2: Needs attention section**

Render the due/overdue reminders first (from `scheduleProgress`, band `soon | due | overdue`), each with **Mark done** and **Log service**. `Mark done` computes `nextDueFrom(schedule, bike.current_km, today)`, calls `updateSchedule` with the new `last_performed_*` and the derived `next_due_*`, then refetches. When nothing is due, show a one-line calm confirmation instead of an empty box. `DueAlerts` is deleted; its responsibility is this section.

- **Step 2b: A log with a next service creates the reminder**

`MaintenanceLogFormData` already carries `next_service_km` and `next_service_date`, and nothing has ever read them. After `createLog` succeeds in the page's submit handler, when either value is present, create a schedule for that bike: `task_name` from the log description, `component_id` from the log, `next_due_km`/`next_due_date` from the log's next-service values, and `last_performed_km`/`last_performed_date` from the service just logged. This is what makes the form's "Next Service" fields meaningful. Compute it with the pure helper `nextDueFrom` is not applicable here (there is no interval yet); the values come straight from the form.

- [ ] **Step 3: Forward metrics**

Replace the three retrospective cards with **Next due** (the soonest due reminder, or "Nothing scheduled"), **Services this year** (count of logs in the current year), and **Spend this year** (`formatIDR` of the year's costs).

- **Step 4: Service history**

Keep `MaintenanceLogList` as-is below the metrics, with the existing `Log service` button above it.

- [ ] **Step 5: Verify and commit**

Run: `cd client && npm run type-check && npm run lint && npx vitest run && npm run build`

```bash
git add client/src/pages/MaintenancePage.tsx client/src/features/maintenance/components/DueAlerts.tsx client/src/features/maintenance/index.ts
git commit -m "feat(maintenance): rebuild the page around what needs doing"
```

---

### Task 7: End-to-end verification

**Files:** none.

**Interfaces:**

- Consumes: everything above.
- Produces: a verified page.

- [ ] **Step 1: Run the full gate**

Run: `npm run lint && npm run type-check && (cd server && npx vitest run) && (cd client && npx vitest run) && npm run build`
Expected: all green.

- [ ] **Step 2: Verify in the browser**

Run `npm run dev`, open `/maintenance`, and confirm:

1. A reminder can be created with an interval; the rail shows progress and a band.
2. A reminder past its due km appears under **Needs attention** with **Mark done**; marking it done advances the due date and km and removes it from the section.
3. **Log service** opens the form with the component preselectable; the log saves against that component.
4. Deleting a log works (it 404'd before PR F).
5. Metrics show the soonest due, this year's service count and spend.
6. Render at 375px and 1440px; the rail shrinks without overflow.

- [ ] **Step 3: Report**

No commit. Record the results.

---

## Self-Review Notes

- **Spec coverage:** section B → Tasks 1, 2, 3, 4, 5, 6 (CRUD, interval arithmetic, mark-done, component picker, log-to-schedule); section C → Tasks 4, 6 (rail, one-scroll order, forward metrics, shared empty states/skeleton).
- **Review Focus tests:** unscheduled reminder → Task 1; odometer backwards → Task 1; mark-done arithmetic → Task 2; neither interval nor due → Task 1; no components → Task 5 Step 1 (inspection) and Task 7 Step 2.
- **Type consistency:** `ScheduleBand`/`ScheduleProgress` defined once (Task 1); `nextDueFrom` defined once (Task 2); `useSchedules` mirrors `useMaintenanceLogs`.
- **Deferred:** nothing from section B or C. Editing a saved log and dashboard alerts stay out of scope per the spec.
