-- Migration: 003_create_activities
-- Description: Create activities table for cycling activities synced from Strava
-- Dependencies: 001_create_users_and_profiles, 002_create_bikes_and_components

-- ============================================================
-- Table: activities
-- Stores cycling activities synced from Strava API
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Ride, VirtualRide, etc
  start_date TIMESTAMPTZ NOT NULL,
  distance DECIMAL(10,2) NOT NULL, -- in meters
  moving_time INTEGER NOT NULL, -- in seconds
  elapsed_time INTEGER NOT NULL, -- in seconds
  total_elevation_gain DECIMAL(8,2), -- in meters
  avg_speed DECIMAL(8,2), -- m/s
  max_speed DECIMAL(8,2), -- m/s
  avg_hr INTEGER, -- bpm
  max_hr INTEGER, -- bpm
  polyline TEXT, -- encoded summary polyline from Strava
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_bike_id ON activities(bike_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON activities(strava_id);

-- ============================================================
-- Trigger: set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_activities
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
