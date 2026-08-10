# 11 — Training Plan Module (v2.2.0 – v2.5.0)

Dokumentasi desain dan rencana implementasi modul Training Plan untuk Veloer.

---

## Latar Belakang

Modul ini **terpisah** dari Training tab yang sudah ada di Activity Detail (PR #51). Training tab tetap dipertahankan sebagai analisis per-aktivitas (laps, zones, TSS, IF). Modul baru ini adalah **perencanaan latihan** — user bisa buat plan, schedule workout di kalender, dan system merekomendasikan workout berikutnya berdasarkan data Strava.

---

## Fitur Utama

| Fitur                 | Deskripsi                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| Training Plan CRUD    | Buat, edit, hapus plan dengan periode dan goal type                       |
| Template Library      | 4 template siap pakai (Base Build, FTP Builder, Century Prep, Gran Fondo) |
| Workout Calendar      | Month/week view dengan warna per workout type                             |
| Workout CRUD          | Create/edit workout dengan interval builder                               |
| Recommendation Engine | Rule-based CTL/ATL/TSB decision tree                                      |
| Auto-link Strava      | Match aktivitas ke planned workout saat sync                              |
| Auto-reschedule       | Missed workout otomatis dijadwalkan ulang                                 |
| Plan Retrospective    | Summary: completion rate, TSS compliance, FTP change                      |
| Dashboard Widget      | Upcoming workouts minggu ini di dashboard                                 |

---

## Database Schema

### Migration 014 — `014_add_tss_to_activities.sql`

```sql
ALTER TABLE activities ADD COLUMN tss DOUBLE PRECISION;
ALTER TABLE activities ADD COLUMN training_plan_workout_id UUID;
```

### Migration 015 — `015_training_plans.sql`

```sql
CREATE TABLE training_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  goal_type     TEXT CHECK (goal_type IN ('ftp','endurance','century','gran_fondo','custom')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  ftp_baseline  INTEGER NOT NULL DEFAULT 250,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE training_plan_workouts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                   UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date            DATE NOT NULL,
  workout_type              TEXT NOT NULL CHECK (workout_type IN (
                              'recovery','endurance','tempo','sweet_spot',
                              'threshold','vo2max','anaerobic','sprint','race','interval'
                            )),
  title                     TEXT NOT NULL,
  description               TEXT,
  -- Target metrics
  target_duration_minutes   INTEGER,
  target_tss                INTEGER,
  target_avg_power          INTEGER,
  target_avg_hr             INTEGER,
  target_cadence_min        INTEGER,
  target_cadence_max        INTEGER,
  -- Interval structure (null jika bukan interval workout)
  intervals_count           INTEGER,
  interval_duration_seconds INTEGER,
  interval_power_pct_ftp    INTEGER,   -- e.g. 105 = 105% FTP
  rest_duration_seconds     INTEGER,
  rest_power_pct_ftp        INTEGER,   -- e.g. 55 = 55% FTP
  -- Completion
  status                    TEXT DEFAULT 'planned' CHECK (
                              status IN ('planned','completed','skipped','missed')
                            ),
  actual_activity_id        UUID REFERENCES activities(id) ON DELETE SET NULL,
  actual_tss                DOUBLE PRECISION,
  actual_duration_minutes   INTEGER,
  notes                     TEXT,
  rescheduled_from          DATE,      -- original date jika di-reschedule
  completed_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- Foreign key dari activities ke workout (setelah tabel workout dibuat)
ALTER TABLE activities
  ADD CONSTRAINT fk_activities_workout
  FOREIGN KEY (training_plan_workout_id)
  REFERENCES training_plan_workouts(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_training_plans_user    ON training_plans(user_id);
CREATE INDEX idx_workouts_plan          ON training_plan_workouts(plan_id);
CREATE INDEX idx_workouts_date          ON training_plan_workouts(user_id, scheduled_date);
CREATE INDEX idx_activities_tss         ON activities(user_id, start_date) WHERE tss IS NOT NULL;
```

---

## Workout Types & Warna

| Type         | Label      | Warna            |
| ------------ | ---------- | ---------------- |
| `recovery`   | Recovery   | Slate (#64748b)  |
| `endurance`  | Endurance  | Blue (#3b82f6)   |
| `tempo`      | Tempo      | Yellow (#eab308) |
| `sweet_spot` | Sweet Spot | Amber (#f59e0b)  |
| `threshold`  | Threshold  | Orange (#f97316) |
| `vo2max`     | VO2 Max    | Red (#ef4444)    |
| `anaerobic`  | Anaerobic  | Purple (#8b5cf6) |
| `sprint`     | Sprint     | Pink (#ec4899)   |
| `race`       | Race       | Black (#111827)  |
| `interval`   | Interval   | Indigo (#6366f1) |

---

## TSS Computation

TSS dihitung saat Strava sync di `SyncStravaActivities.ts`. Formula:

```
IF  = weighted_avg_watts / ftp
TSS = (moving_time_seconds / 3600) × IF² × 100
```

- Jika `weighted_avg_watts` null atau `ftp` null/0 → `tss = null`
- FTP diambil dari `user_profiles.ftp` saat sync

---

## Recommendation Engine

### Input

- Activities 42 hari terakhir (dengan kolom `tss`)
- FTP dari `user_profiles`
- Workouts minggu ini dari `training_plan_workouts`

### Kalkulasi CTL / ATL / TSB

```
// TSS per hari (sum aktivitas per tanggal)
tss_per_day[date] = sum(activity.tss WHERE date = activity.start_date)

// CTL — Chronic Training Load (fitness, 42-day EMA)
decay_ctl = e^(-1/42) ≈ 0.9764
CTL = reduce(tss_per_day_42d, (ctl, day) => ctl * decay_ctl + day.tss * (1 - decay_ctl), 0)

// ATL — Acute Training Load (fatigue, 7-day EMA)
decay_atl = e^(-1/7) ≈ 0.8669
ATL = reduce(tss_per_day_7d, (atl, day) => atl * decay_atl + day.tss * (1 - decay_atl), 0)

// TSB — Training Stress Balance (form)
TSB = CTL - ATL
```

### Decision Tree

```
IF consecutive_days_riding >= 3:
  → RECOVERY (40-60 min, Z1, TSS 20-30)
  reason: "3 hari berturut-turut, butuh recovery"

ELSE IF TSB < -30:
  → RECOVERY (40-60 min, Z1, TSS 20-30)
  reason: "Fatigue sangat tinggi, prioritaskan pemulihan"

ELSE IF TSB < -15:
  → ENDURANCE (90-120 min, Z2, TSS 60-80)
  reason: "Masih dalam build phase, jaga aerobic base"

ELSE IF TSB BETWEEN -15 AND 5:
  IF threshold_sessions_this_week == 0 AND weekly_hours >= 4:
    → THRESHOLD (60 min, 2×20 min @95-105% FTP, TSS 80-90)
    reason: "Ada base yang cukup, saatnya tingkatkan FTP"
  ELSE IF vo2max_sessions_this_week == 0 AND TSB > -5:
    → VO2MAX (45-50 min, 5×4 min @110-120% FTP, TSS 70-80)
    reason: "TSB netral, cocok untuk high intensity"
  ELSE:
    → SWEET_SPOT (75 min, @85-95% FTP, TSS 85-95)
    reason: "Efisiensi tinggi untuk membangun threshold endurance"

ELSE IF TSB BETWEEN 5 AND 20:
  → TEMPO (75-90 min, Z3, TSS 70-85)
  reason: "Form positif, manfaatkan untuk kualitas aerobik"

ELSE IF TSB >= 20:
  → ANAEROBIC (45 min, 6×30 detik sprint, TSS 60-70)
  reason: "Sangat fresh, cocok untuk intensitas tertinggi"
```

### Output Struct

```typescript
{
  workout_type: WorkoutType,
  title: string,
  description: string,
  reason: string,
  target_duration_minutes: number,
  target_tss: number,
  target_avg_power: number | null,
  target_avg_hr: number | null,
  intervals?: {
    count: number,
    duration_seconds: number,
    power_pct_ftp: number,
    rest_seconds: number,
    rest_pct_ftp: number,
  },
  metrics: {
    ctl: number,
    atl: number,
    tsb: number,
    weekly_tss: number,
    weekly_hours: number,
    days_since_last_ride: number,
    consecutive_days: number,
  }
}
```

---

## Auto-link Logic

Dipanggil di `SyncStravaActivities` setelah `createMany`. Per aktivitas baru:

```
workout = findWorkoutsByDateRange(userId, activity.date, activity.date)
  filter: status == 'planned'
  filter: |activity.moving_time - workout.target_duration_minutes * 60| < 1800 (±30 menit)

if match found:
  workout.status          = 'completed'
  workout.actual_activity_id = activity.id
  workout.actual_tss         = activity.tss
  workout.actual_duration_minutes = round(activity.moving_time / 60)
  workout.completed_at    = now()
  activity.training_plan_workout_id = workout.id
```

---

## Auto-reschedule Logic

Dipanggil lazy saat user request `GET /api/training-plans` (bukan cron).

```
missed = findWorkouts WHERE scheduled_date < today AND status = 'planned'

for each missed workout:
  workout.status = 'missed'

  if plan.status == 'active' AND plan.end_date > today:
    nextAvailableDate = findNextEmptyDay(today, today+7)
    if nextAvailableDate found:
      create new workout (copy dari missed, rescheduled_from = original_date)
      scheduled_date = nextAvailableDate
```

---

## Plan Templates

| Template          | Durasi    | Focus        | Keterangan                                 |
| ----------------- | --------- | ------------ | ------------------------------------------ |
| `BASE_BUILD_4W`   | 4 minggu  | Z2 Endurance | Progressive volume, 3-4 rides/week         |
| `FTP_BUILDER_6W`  | 6 minggu  | Threshold    | Sweet spot + threshold intervals progresif |
| `CENTURY_PREP_8W` | 8 minggu  | Long Ride    | Build ke long ride 100-160km               |
| `GRAN_FONDO_12W`  | 12 minggu | Periodized   | Base → Build → Peak → Taper                |

Template auto-populate `training_plan_workouts` untuk seluruh periode plan saat dibuat.

---

## Plan Retrospective

Endpoint: `GET /api/training-plans/:id/retrospective`

```typescript
{
  plan: TrainingPlan,
  summary: {
    total_workouts: number,
    completed: number,
    skipped: number,
    missed: number,
    completion_rate: number,           // persen
    planned_tss_total: number,
    actual_tss_total: number,
    tss_compliance: number,            // actual/planned persen
    planned_hours_total: number,
    actual_hours_total: number,
    ftp_change: number | null,         // ftp_sekarang - ftp_baseline
  },
  weekly_breakdown: Array<{
    week: string,                      // ISO week, e.g. "2026-W32"
    planned_tss: number,
    actual_tss: number,
    completed: number,
    total: number,
  }>
}
```

---

## Server API Endpoints

```
GET    /api/training-plans                          — list semua plans user
POST   /api/training-plans                          — create plan baru
POST   /api/training-plans/from-template            — create dari template
GET    /api/training-plans/:id                      — detail plan
PATCH  /api/training-plans/:id                      — update plan
DELETE /api/training-plans/:id                      — hapus plan
GET    /api/training-plans/:id/retrospective        — retrospective data
POST   /api/training-plans/:id/reschedule-missed    — trigger reschedule manual

GET    /api/training-plans/:planId/workouts         — list workouts di plan
POST   /api/training-plans/:planId/workouts         — create workout
GET    /api/training-plans/:planId/workouts/:id     — detail workout
PATCH  /api/training-plans/:planId/workouts/:id     — update workout
DELETE /api/training-plans/:planId/workouts/:id     — hapus workout

GET    /api/training-plans/recommendations          — saran workout (?date=YYYY-MM-DD)
```

---

## Client Routes

```
/training-plans                 — list semua plans
/training-plans/:id             — plan detail + calendar
/training-plans/:id/retrospective — retrospective view
```

---

## Client Feature Structure

```
client/src/features/training/
  types/
    training.ts                 — TrainingPlan, TrainingWorkout, Recommendation types
  api/
    training.api.ts             — semua API calls
  hooks/
    usePlans.ts                 — CRUD plans
    useWorkouts.ts              — CRUD workouts, mark complete, link activity, reschedule
    useRecommendation.ts        — fetch recommendation
  components/
    TrainingPlanCard.tsx        — card dengan progress bar dan status badge
    TrainingPlanForm.tsx        — modal create/edit plan (+ tab template)
    TemplateLibrary.tsx         — grid 4 template dengan preview workout
    WorkoutCalendar.tsx         — react-big-calendar month/week view
    WorkoutForm.tsx             — modal create/edit workout + interval builder
    WorkoutDetail.tsx           — slide-in panel detail + actions
    ActivityLinker.tsx          — dropdown link ke aktivitas Strava ±2 hari
    RecommendationCard.tsx      — saran workout + reason + tombol "Add to Plan"
    TrainingLoadChart.tsx       — bar TSS + line CTL + line ATL (Recharts)
    FormGauge.tsx               — TSB gauge visual
    PlanRetrospective.tsx       — completion donut + TSS compliance chart
    UpcomingWorkoutsWidget.tsx  — 3 workout terdekat untuk dashboard
  index.ts
```

---

## Dependencies Baru

| Package              | Versi  | Kegunaan                                                     |
| -------------------- | ------ | ------------------------------------------------------------ |
| `react-big-calendar` | latest | Calendar month/week view                                     |
| `date-fns`           | latest | Date formatting & manipulation (peer dep react-big-calendar) |

Install di `client/`:

```bash
npm install react-big-calendar date-fns
npm install -D @types/react-big-calendar
```

---

## PR Breakdown

### v2.2.0 — Foundation

| PR  | Branch                                | Files | Deskripsi                                                    |
| --- | ------------------------------------- | ----- | ------------------------------------------------------------ |
| #53 | `feature/server-tss-computation`      | 2     | Tambah kolom `tss` ke activities, hitung saat sync           |
| #54 | `feature/server-training-plan-schema` | 1     | Migration 015: tabel training_plans + training_plan_workouts |
| #55 | `feature/server-training-plan-domain` | 3     | Entity + Repository interface                                |
| #56 | `feature/server-training-plan-repo`   | 1     | SupabaseTrainingPlanRepository                               |

### v2.3.0 — Core Features

| PR  | Branch                                  | Files | Deskripsi                                   |
| --- | --------------------------------------- | ----- | ------------------------------------------- |
| #57 | `feature/server-training-plan-usecases` | 1     | CRUD use cases                              |
| #58 | `feature/server-training-plan-routes`   | 3     | Controller + routes + register di server.ts |
| #59 | `feature/server-training-plan-di`       | 1     | Register DI di dependencies.ts              |
| #60 | `feature/client-training-types-api`     | 4     | Types, API, hooks                           |
| #61 | `feature/client-training-plan-list`     | 4     | Plan list page + form                       |
| #62 | `feature/client-workout-calendar`       | 4     | Calendar + WorkoutForm + WorkoutDetail      |
| #63 | `feature/client-training-routing`       | 2     | Route + sidebar entry                       |

### v2.4.0 — Intelligence

| PR  | Branch                                 | Files | Deskripsi                                          |
| --- | -------------------------------------- | ----- | -------------------------------------------------- |
| #64 | `feature/server-recommendation-engine` | 1     | GenerateRecommendation use case + endpoint         |
| #65 | `feature/server-auto-link-workout`     | 1     | Auto-link di SyncStravaActivities                  |
| #66 | `feature/server-auto-reschedule`       | 1     | AutoRescheduleMissed use case + endpoint           |
| #67 | `feature/server-plan-retrospective`    | 1     | GetPlanRetrospective use case + endpoint           |
| #68 | `feature/client-recommendation-panel`  | 4     | RecommendationCard + TrainingLoadChart + FormGauge |
| #69 | `feature/client-workout-completion`    | 3     | Completion actions + ActivityLinker + reschedule   |
| #70 | `feature/client-plan-retrospective`    | 2     | PlanRetrospective page + route                     |

### v2.5.0 — Polish

| PR  | Branch                            | Files | Deskripsi                                    |
| --- | --------------------------------- | ----- | -------------------------------------------- |
| #71 | `feature/server-plan-templates`   | 1     | GeneratePlanFromTemplate use case + endpoint |
| #72 | `feature/client-template-library` | 2     | TemplateLibrary + update PlanForm            |
| #73 | `feature/client-dashboard-widget` | 2     | UpcomingWorkoutsWidget + update Dashboard    |
| #74 | `feature/docs-training-plan`      | 1     | README v2.5.0                                |

**Total: 22 PRs, 4 versi rilis**

---

## Status

| PR      | Status  |
| ------- | ------- |
| #53–#74 | Pending |
