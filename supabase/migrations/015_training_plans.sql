-- Migration: 015_training_plans
-- Description: Create training_plans and training_plan_workouts tables
-- for the Training Plan module (v2.2.0+)

-- Training plans (periodized training schedule)
CREATE TABLE IF NOT EXISTS training_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  goal_type     TEXT CHECK (goal_type IN ('ftp','endurance','century','gran_fondo','custom')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  ftp_baseline  INTEGER NOT NULL DEFAULT 250,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual workouts within a training plan
CREATE TABLE IF NOT EXISTS training_plan_workouts (
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
  -- Interval structure (NULL if not an interval workout)
  intervals_count           INTEGER,
  interval_duration_seconds INTEGER,
  interval_power_pct_ftp    INTEGER,
  rest_duration_seconds     INTEGER,
  rest_power_pct_ftp        INTEGER,
  -- Completion tracking
  status                    TEXT DEFAULT 'planned' CHECK (
                              status IN ('planned','completed','skipped','missed')
                            ),
  actual_activity_id        UUID REFERENCES activities(id) ON DELETE SET NULL,
  actual_tss                DOUBLE PRECISION,
  actual_duration_minutes   INTEGER,
  notes                     TEXT,
  rescheduled_from          DATE,
  completed_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link activities to workouts (FK from activities side)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS training_plan_workout_id UUID
  REFERENCES training_plan_workouts(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_plans_user    ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_plan          ON training_plan_workouts(plan_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date          ON training_plan_workouts(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_activities_tss         ON activities(user_id, start_date) WHERE tss IS NOT NULL;
