-- Migration: 018_goal_manual_adjustment
-- Description: Add a manual adjustment column to goals so manual progress
-- entries can coexist with Strava-derived progress. The displayed
-- current_value = auto (from activities in range) + manual_adjustment.
-- Dependencies: 006_create_goals

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS manual_adjustment DECIMAL(12,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN goals.manual_adjustment IS
  'User-entered adjustment added on top of activity-derived progress. Recomputation never overwrites this.';
