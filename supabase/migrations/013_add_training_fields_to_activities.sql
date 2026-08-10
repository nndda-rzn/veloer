-- Migration: 013_add_training_fields_to_activities
-- Description: Add training data fields (cadence, power, calories, temp)
-- to activities table for comprehensive training analysis

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS avg_cadence double precision,
  ADD COLUMN IF NOT EXISTS max_cadence double precision,
  ADD COLUMN IF NOT EXISTS avg_watts double precision,
  ADD COLUMN IF NOT EXISTS max_watts double precision,
  ADD COLUMN IF NOT EXISTS weighted_avg_watts double precision,
  ADD COLUMN IF NOT EXISTS kilojoules double precision,
  ADD COLUMN IF NOT EXISTS device_watts boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_temp double precision,
  ADD COLUMN IF NOT EXISTS calories double precision,
  ADD COLUMN IF NOT EXISTS elev_high double precision,
  ADD COLUMN IF NOT EXISTS elev_low double precision;
