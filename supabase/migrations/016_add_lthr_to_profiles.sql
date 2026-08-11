-- Migration 016: Add LTHR (Lactate Threshold Heart Rate) to user_profiles
-- Used for hrTSS calculation as fallback when no power meter data is available

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS lthr integer;

COMMENT ON COLUMN user_profiles.lthr IS 'Lactate Threshold Heart Rate in bpm. Used for hrTSS calculation when power meter data is unavailable.';
