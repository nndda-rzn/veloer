-- Migration: 006_create_goals
-- Description: Create goals table for cycling goals and training progress
-- Dependencies: 001_create_users_and_profiles

-- ============================================================
-- Table: goals
-- Stores cycling goals (distance, time, elevation, count) with progress tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('distance', 'time', 'elevation', 'activities_count')),
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL, -- km, hours, m, count
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_period ON goals(period);

-- ============================================================
-- Trigger: set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_goals
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
