# Strength Training + Training-Area Refinement — Design

> Status: approved design (2026-10-04). Source for the implementation plan.
> Scope: add strength training as a first-class discipline in the existing training
> plan, and refine the training area so it matches the design system.

## Problem

Veloer tracks cycling end to end. A rider who also lifts has nowhere to record it,
and nothing in the app acknowledges that training. The gap is not cosmetic – it is
structural:

| Layer        | Current state                                                               | Consequence                                                   |
| ------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Ingest       | `SyncStravaActivities` keeps only `Ride`/`VirtualRide` (lines 68–70)        | `WeightTraining` never enters the app                         |
| `activities` | `distance`, `moving_time`, `elapsed_time` are `NOT NULL` (003, lines 16–18) | A gym session has no distance; would have to be forced to `0` |
| Load         | TSS comes from power (NP/FTP) or HR (hrTSS)                                 | A strength session has neither power nor, sometimes, HR       |
| CTL/ATL/TSB  | Derived from `activities.tss`                                               | Strength would be invisible in fatigue                        |
| Plan         | `workout_type` is locked to 10 cycling types                                | There is no `strength` session                                |
| Input        | No manual entry path                                                        | Rides only arrive via Strava                                  |

## Understanding and success criteria

Goal: **strength training becomes a legitimate part of the training plan** – plannable
on the same calendar as cycling, synced from Strava, and counted toward training load –
**without polluting cycling numbers**. At the same time, refine the training area for
consistency with the design system.

Success when:

- (a) a mixed plan (gym + cycling) shows and works on the existing calendar;
- (b) cycling numbers (distance, elevation, ride count, goals) stay purely cycling;
- (c) CTL/ATL/TSB include strength sessions;
- (d) the strength UI is calm, accessible, and consistent with existing tokens.

## Decisions (locked)

| Topic                | Decision                                                        |
| -------------------- | --------------------------------------------------------------- |
| Where strength lives | Part of the training plan                                       |
| Session content      | Simple block + optional exercise list                           |
| Data source          | Strava (`WeightTraining`); no manual entry                      |
| Training load        | Strength counts toward CTL/ATL/TSB via hrTSS                    |
| Data model           | Separate `discipline` axis (not adding to `workout_type`)       |
| Aggregation          | Cycling stays pure; strength excluded from distance/count/goals |
| `distance`           | Nullable                                                        |
| Colour               | Single steel accent `#475569`                                   |
| Exercise editor      | Row list                                                        |
| Refinement scope     | Findings 1–9 (below)                                            |
| Order                | PR A (foundation) first                                         |

## A. Data model — `021_strength_discipline.sql`

**`activities`**

- `discipline TEXT NOT NULL DEFAULT 'cycling' CHECK (discipline IN ('cycling','strength'))`
- `distance` → `DROP NOT NULL` (strength stores `NULL`; more honest than `0` and stops
  "0 km" leaking into any surface)

**`training_plan_workouts`**

- `discipline TEXT NOT NULL DEFAULT 'cycling' CHECK (discipline IN ('cycling','strength'))`
- extend the `workout_type` CHECK with `lower | upper | full_body | core | mobility`
- `exercises JSONB` — optional, shape `[{ name, sets, reps, weight_kg }]`
- `workout_type` stays `NOT NULL`: a workout stores the type _within its discipline_,
  so every existing renderer keeps working. `discipline` is what distinguishes the sport.

**Redefine `activity_stats`** (function from 019) with `AND a.discipline = 'cycling'`.

Migration safety: every new column has a default; existing rows become `'cycling'`.
The `activity_stats` redefinition is idempotent (`CREATE OR REPLACE`), and the server
keeps its Node fallback so nothing breaks before the migration is applied manually.

## B. Ingest (server)

`SyncStravaActivities`:

- map Strava type → `discipline`: `WeightTraining` → `strength`; everything else → `cycling`.
- strength: `distance = NULL`, `bike_id = NULL`, `tss` from hrTSS (existing formula,
  lines 96–104). No HR → `tss = NULL` (do not guess).
- auto-link strength to a planned workout: match a `discipline='strength'` workout on the
  same date within ±30 minutes, without the power-zone scoring (strength has no power).
- guard: a strength activity can never be linked to a bike (`updateBike` + UI).

## C. Training load

- **Include strength:** `GetTrainingLoadHistory` and `GenerateRecommendation` derive CTL/ATL
  from a `tssMap` that does not filter by discipline, so strength is included automatically.
- **Correction:** `days_since_last_ride` must be cycling-only (a gym session must not reset
  it). `consecutive_days` keeps counting all disciplines (it is about rest need).
- **`AnalyzeStravaFitness`** (FTP estimate + template suggestion) is cycling analysis →
  exclude strength entirely.

## D. Aggregation boundary — cycling stays pure

Add `discipline = 'cycling'` to:

- `activity_stats` RPC (redefined in 021)
- `SupabaseActivityRepository.getStatsFallback` (Node)
- `SupabaseGoalRepository.activityValueInRange` → distance/time/elevation/count goals are
  never filled by gym sessions

`ActivityStatsBar` summarises cycling only and states its scope (caption), so the number
never silently mixes disciplines. `BikeHero` is unaffected (strength never links to a bike).

## E. Strength UI

- token `--color-strength: #475569`; icon `Dumbbell`; label `Strength · Lower body`.
- `DisciplineToggle` (segmented, `aria-pressed`) — reuses the existing chip pattern.
- `ExerciseListEditor` — repeating rows `Exercise · Sets · Reps · Weight`. Desktop: grid
  with a header row. Mobile: stacked with visible labels. Add/remove rows; remove button is
  icon-only with an `aria-label`.
- `WorkoutTypeChip` — one component replacing the three hand-rolled chips.
- `WorkoutForm` progressive: strength hides power/cadence/interval/target-TSS.
- `WorkoutDetail` / `WorkoutCalendar` / `NextWorkoutPanel`: steel accent, no power for strength.
- Honest data: a gym row never shows "0 km"; a discipline filter (removable chips) is added;
  `RecentActivities` shows duration, not distance, for strength.
- Microcopy: "ride" → "session" in `MetricTooltip`, `TrainingLoadCard`, `ActivitiesPage`.

## F. Training-area refinement (findings 1–9)

From the audit (evidence: file/line):

1. **Major** — plan page has three competing primary actions (`Reschedule Missed` +
   `Retrospective` in the header, `Mark complete` in `NextWorkoutPanel`, `Add to today` in
   `RecommendationCard`). Fix: one primary per context; secondary actions become menu/outline.
2. **Major** — `FormGauge` uses a hardcoded red→yellow→green gradient (`#ef4444`, `#f97316`,
   `#eab308`, `#22c55e`), breaking the "no hardcoded values" and "no second hue" rules, and
   red↔green is not colour-blind safe. Fix: use semantic tokens.
3. **Major** — forms use hand-rolled markup instead of shared patterns: error `<div>` instead
   of `Alert`, hand-built label+input instead of `FormField`, ad-hoc `animate-pulse` instead
   of `Skeleton*` (`WorkoutForm`, `TrainingPlanForm`, `TrainingPlanDetailPage`,
   `UpcomingWorkoutsWidget`).
4. **Major** — type chips are hand-built in three places with `${color}1a` hex. Fix: one
   `WorkoutTypeChip`.
5. **Minor** — `•` used instead of the project's `·` (`UpcomingWorkoutsWidget` 84–85,
   `TrainingPlanDetailPage` 200).
6. **Minor** — raw ISO date printed instead of `formatDate()` (`TrainingPlanDetailPage` 200).
7. **Minor** — custom empty states instead of `EmptyState` (`UpcomingWorkoutsWidget`,
   `TrainingLoadChart`).
8. **Minor** — `ActivityLinker` has no empty state and no discipline filter.
9. **Minor** — hardcoded hex in `TrainingLoadChart` and `WorkoutCalendar`; read from tokens.

## PR breakdown

- **PR A** — foundation: migration, ingest, aggregation boundary, recommendation correction.
  No UI.
- **PR B** — training UI: toggle, progressive form, exercise editor, chip, detail/calendar/panel,
  steel token.
- **PR C** — activity UI: discipline filter, honest data, list/detail/stats/recent, microcopy.
- **PR D** — training-area refinement: findings 1–9.

Each PR: lint + type-check + build green, and rendered at 375px + 1440px. PR A touches no UI,
so it can merge first without visual risk.

## Verification

- Sync `WeightTraining` → `discipline='strength'`, `distance NULL`, `tss` from hrTSS.
- Cycling numbers and goals unaffected by a gym session.
- CTL/ATL/TSB change after an HR-carrying gym session.
- `days_since_last_ride` not reset by a gym session.
- Mixed plan shows both disciplines on the calendar; mark done works.
- Exercise list saves and renders in the detail sheet.
- lint + type-check + build green; render at 375px + 1440px.

## Out of scope

Manual session entry · structured strength programs/templates · bike photo crop · manual RPE.
