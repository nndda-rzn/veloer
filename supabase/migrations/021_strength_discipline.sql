-- Migration: 021_strength_discipline
-- Description: Add a `discipline` axis ('cycling' | 'strength') to activities and
-- planned workouts, make activities.distance nullable (a strength session has no
-- distance), allow strength workout types, and restrict activity_stats to cycling.
--
-- Apply via the Supabase SQL Editor (no local psql/DATABASE_URL in this project).
-- Every statement is idempotent and safe to run twice.
--
-- Why a separate `discipline` column instead of adding 'strength' to workout_type:
-- the 10 existing workout types are all cycling intensities (power/cadence based).
-- A strength session has none of those fields, so a second axis keeps cycling
-- targets meaningful and lets each query decide explicitly whether strength counts.

-- ============================================================
-- activities: discipline + nullable distance
-- ============================================================
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS discipline TEXT NOT NULL DEFAULT 'cycling';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activities_discipline_check'
  ) THEN
    ALTER TABLE activities
      ADD CONSTRAINT activities_discipline_check
      CHECK (discipline IN ('cycling','strength'));
  END IF;
END $$;

-- A strength session has no distance. NULL is more honest than 0 and stops a
-- "0 km" reading leaking into any surface that shows distance.
ALTER TABLE activities ALTER COLUMN distance DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_discipline ON activities(user_id, discipline);

-- ============================================================
-- training_plan_workouts: discipline, strength workout types, exercises
-- ============================================================
ALTER TABLE training_plan_workouts
  ADD COLUMN IF NOT EXISTS discipline TEXT NOT NULL DEFAULT 'cycling';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_plan_workouts_discipline_check'
  ) THEN
    ALTER TABLE training_plan_workouts
      ADD CONSTRAINT training_plan_workouts_discipline_check
      CHECK (discipline IN ('cycling','strength'));
  END IF;
END $$;

-- Widen the workout_type check to accept the five strength types. The original
-- check came from 015 with Postgres' default inline name; drop whatever check
-- exists on the column so the widened one can be added regardless of its name.
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'training_plan_workouts'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%workout_type%'
  LOOP
    EXECUTE format('ALTER TABLE training_plan_workouts DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE training_plan_workouts
  ADD CONSTRAINT training_plan_workouts_workout_type_check
  CHECK (workout_type IN (
    'recovery','endurance','tempo','sweet_spot','threshold',
    'vo2max','anaerobic','sprint','race','interval',
    'lower','upper','full_body','core','mobility'
  ));

-- Optional exercise list for a strength workout: [{ name, sets, reps, weight_kg }]
ALTER TABLE training_plan_workouts
  ADD COLUMN IF NOT EXISTS exercises JSONB;

CREATE INDEX IF NOT EXISTS idx_workouts_discipline
  ON training_plan_workouts(user_id, discipline);

-- ============================================================
-- Function: activity_stats · cycling only
-- Same signature and columns as 019, with an added discipline filter so a gym
-- session never inflates distance, elevation or ride count. Redefines (does not
-- replace the name) so the server's Node fallback still works if this is not run.
-- ============================================================
CREATE OR REPLACE FUNCTION activity_stats(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_distance DOUBLE PRECISION,
  total_moving_time DOUBLE PRECISION,
  total_elevation_gain DOUBLE PRECISION,
  activity_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(SUM(a.distance), 0)::DOUBLE PRECISION,
    COALESCE(SUM(a.moving_time), 0)::DOUBLE PRECISION,
    COALESCE(SUM(a.total_elevation_gain), 0)::DOUBLE PRECISION,
    COUNT(*)::BIGINT
  FROM activities a
  WHERE a.user_id = p_user_id
    AND a.discipline = 'cycling'
    AND (p_start_date IS NULL OR a.start_date >= p_start_date)
    AND (p_end_date IS NULL OR a.start_date <= p_end_date);
$$;

GRANT EXECUTE ON FUNCTION activity_stats(UUID, DATE, DATE) TO authenticated, service_role;

-- ============================================================
-- Harden the km trigger now that distance can be NULL.
-- A strength row never carries a bike_id, but guarding on distance too means a
-- future NULL distance can never turn a bike's current_km into NULL.
-- ============================================================
CREATE OR REPLACE FUNCTION update_bike_km_after_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bike_id IS NOT NULL AND NEW.distance IS NOT NULL THEN
    UPDATE bikes
    SET current_km = current_km + (NEW.distance / 1000)
    WHERE id = NEW.bike_id;

    UPDATE components
    SET current_km = components.current_km + (NEW.distance / 1000)
    WHERE bike_id = NEW.bike_id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
