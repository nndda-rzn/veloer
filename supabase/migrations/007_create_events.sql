-- Migration: 007_create_events
-- Description: Create events table for cycling events (races, gran fondos, group rides)
-- Dependencies: 001_create_users_and_profiles, 002_create_bikes_and_components,
--               003_create_activities, 005_create_finance_tables

-- ============================================================
-- Table: events
-- Stores cycling events with registration, status, and results
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('race', 'gran_fondo', 'charity', 'group_ride', 'tour', 'other')),
  date DATE NOT NULL,
  location TEXT,
  distance DECIMAL(10,2), -- km
  registration_fee DECIMAL(12,2), -- IDR
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'completed', 'cancelled', 'dns', 'dnf')),
  result TEXT, -- finishing time, position, etc
  notes TEXT,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ============================================================
-- Add FK: transactions.event_id → events.id
-- (placeholder column created in migration 005, now add constraint)
-- ============================================================
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_event_id
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- ============================================================
-- Trigger: set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
