-- Migration: 019_activity_stats_aggregate
-- Description: Aggregate activity stats in the database instead of Node.
--
-- getStats previously selected every row in the date range and summed them in
-- Node, transferring O(n) rows to produce 4 numbers. For a rider with hundreds
-- of activities in range that is a lot of pointless I/O. This function does the
-- aggregation where the data lives and returns a single row.
--
-- Apply via the Supabase SQL Editor (no local psql/DATABASE_URL in this project).
-- The server falls back to in-Node aggregation if this function is absent, so
-- nothing breaks before the migration is applied.

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
    AND (p_start_date IS NULL OR a.start_date >= p_start_date)
    AND (p_end_date IS NULL OR a.start_date <= p_end_date);
$$;

-- The server uses the service role (bypasses RLS), but the function is scoped
-- by p_user_id, so it can never return another user's rows.
GRANT EXECUTE ON FUNCTION activity_stats(UUID, DATE, DATE) TO authenticated, service_role;
