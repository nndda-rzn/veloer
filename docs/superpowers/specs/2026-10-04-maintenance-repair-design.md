# Maintenance Module: Repair + Completion + UI — Design

> Status: approved design (2026-10-04). Source for the implementation plan.
> Scope: make the maintenance module work end to end, and rebuild its page so it
> answers "what needs doing?" instead of only showing history.

## Problem

The module has two overlapping tables that are not connected: `maintenance_logs`
(service history, UI exists) and `maintenance_schedules` (recurring reminders,
**full server + API layer, zero UI**). Seven verified defects:

| #   | Defect                                            | Evidence                                                                                                                                                                  |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **"Delete log" always returns 404**               | `maintenanceApi.deleteLog` calls `DELETE /api/maintenance/logs/:id`; the route has never existed (`git log -p` on `maintenance.routes.ts`: only 5 routes since `c3a5e57`) |
| 2   | **A deleted service's cost still counts**         | `LogMaintenance` auto-creates a `maintenance` transaction; `DeleteMaintenanceLog` deletes only the log                                                                    |
| 3   | **Schedules cannot be created from the UI**       | 5 use cases (`AddSchedule`, `GetSchedules`, `UpdateSchedule`, `DeleteSchedule`, `CheckDueSchedules`) and 4 API functions exist; no component imports any of them          |
| 4   | **"Next Service" on a log is a dead end**         | `DueAlerts` reads only `maintenance_schedules`, never `maintenance_logs.next_service_*`                                                                                   |
| 5   | **`interval_km`/`interval_days` are dead fields** | Nothing derives `next_due_*` from an interval                                                                                                                             |
| 6   | **The log form cannot pick a component**          | `component_id` is only ever set by the `ComponentCard` action; from the Maintenance page it is always null                                                                |
| 7   | **Alerts are dead ends**                          | `DueAlerts` displays due items with no way to mark one done                                                                                                               |

Also missing: `PATCH`/`DELETE /api/maintenance/schedules/:id` (the API client calls both).

## Understanding and success criteria

Goal: the maintenance module **works end to end** — a rider can create a
reminder, log a service against it, be reminded when it is due, and clear it —
and its page is **decision-first**, reusing the wear-rail idiom the app already
has for components.

Success when:

- (a) deleting a service log works and its cost leaves Finance with it;
- (b) reminders can be created, edited, completed and deleted from the UI;
- (c) a due reminder is actionable in place ("mark done"), and doing so schedules the next one;
- (d) a service log can be attributed to a specific component;
- (e) the page shows what needs doing first, and the wear rail reads the same as a component's.

## Decisions (locked)

| Topic                           | Decision                                           |
| ------------------------------- | -------------------------------------------------- |
| Focus                           | Repair + complete + UI/UX                          |
| Cost of a deleted log           | Deleted with it (`ON DELETE CASCADE`)              |
| `interval_km` / `interval_days` | Computed automatically                             |
| "Next Service" on the log form  | Auto-creates a schedule                            |
| Page structure                  | One scroll: "Needs attention" first, history below |
| Summary cards                   | Replaced with forward-looking metrics              |
| UI scope                        | The Maintenance page only                          |

## A. Repair

- **A1** Add the three missing routes: `DELETE /api/maintenance/logs/:id`, `PATCH /api/maintenance/schedules/:id`, `DELETE /api/maintenance/schedules/:id`.
- **A2** Add `transactions.maintenance_log_id UUID REFERENCES maintenance_logs(id) ON DELETE CASCADE` plus an index. `LogMaintenance` sets it when it creates the transaction, so deleting a log removes its cost.

## B. Complete the functionality

- `ScheduleList` + `ScheduleForm`: full CRUD (the server and API client already exist).
- **Interval arithmetic:** `next_due_km = last_performed_km + interval_km` and `next_due_date = last_performed_date + interval_days`. A manual due value still overrides.
- A log saved with `next_service_*` **creates or updates** a schedule, so the reminder actually appears.
- `DueAlerts` reads `maintenance_logs.next_service_*` as a second source, as a safety net for rows that predate this change.
- **"Mark done"** on a due item: sets `last_performed_date`/`last_performed_km` to now, then recomputes `next_due_*` from the interval.
- **Component picker** in the log form, fed by the selected bike's components.

## C. UI/UX (Maintenance page)

**C1. Wear rail for a schedule.** Reuses the `ComponentCard` idiom so the two
read as one system:

```
Chain lube                          240 km left
├──────────────────●─────────────────────┤
120 km ago       now                  500 km
```

Colour from the existing lifespan tokens (`good` / `warning` / `danger` / `overdue`).

**C2. One scroll, due first.** Header → **Needs attention** (due and overdue, with actions) → forward metrics → **Service history**.

**C3. Forward metrics** replace the three retrospective cards: **Next due** · **Services this year** · **Spend this year**.

**C4. Actions on the row**, not hidden in a menu: **Log service** and **Mark done** on a due item.

**C5. Shared empty states and skeletons** (`EmptyState`, `Skeleton*`).

## Migration

`022_maintenance_link.sql`, idempotent: the `maintenance_log_id` column and its index.

## PR breakdown

| PR    | Content                                       | Why separate                             |
| ----- | --------------------------------------------- | ---------------------------------------- |
| **F** | A: three routes, cascade link, migration 022  | Pure bug fix, no UI, safe to merge first |
| **G** | B + C: functionality and the Maintenance page | UI built correctly from the start        |

The narrowed UI scope makes a separate polish PR unnecessary; it folds into G.

## Constraints

- `MaintenanceLogList` is shared with the bike detail page. Bug fixes flow to both; visual redesign is scoped to the Maintenance page so the bike page layout is not disturbed.
- The component picker adds a new data dependency to the Maintenance page (the selected bike's components).
- Migration `021` is still unapplied and blocks the Activities page. Run it before testing F/G.

## Verification

Delete a log → 204 and its transaction is gone from Finance · create/edit/complete/delete a schedule from the UI · an interval computes the next due date · "Mark done" clears the alert and schedules the next occurrence · a log can be attributed to a component · the rail is accurate · lint + type-check + test + build green · render at 375px and 1440px.

## Out of scope

Service prediction from ride rate · editing a saved log · dashboard maintenance alerts · the bike detail History tab.
