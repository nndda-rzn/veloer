-- Migration: 002_create_bikes_and_components
-- Description: Create bikes and components tables for inventory management
-- Dependencies: 001_create_users_and_profiles

-- ============================================================
-- Table: bikes
-- Stores user's bicycles with type, purchase info, and current km
-- ============================================================
CREATE TABLE IF NOT EXISTS bikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  type TEXT NOT NULL CHECK (type IN ('road', 'mtb', 'gravel', 'hybrid', 'folding', 'other')),
  purchase_date DATE,
  purchase_price DECIMAL(12,2), -- IDR
  current_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired', 'sold')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bikes_user_id ON bikes(user_id);
CREATE INDEX IF NOT EXISTS idx_bikes_status ON bikes(status);

-- ============================================================
-- Table: components
-- Stores bike components with lifespan tracking (chain, tire, brake, etc)
-- ============================================================
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- chain, tire, brake_pad, cassette, etc
  category TEXT NOT NULL CHECK (category IN ('drivetrain', 'braking', 'wheel', 'cockpit', 'frame', 'other')),
  brand TEXT,
  model TEXT,
  install_date DATE NOT NULL,
  install_km DECIMAL(10,2) NOT NULL, -- bike km at install time
  expected_lifespan_km DECIMAL(10,2), -- estimated lifespan in km
  current_km DECIMAL(10,2) NOT NULL, -- bike km currently (updated from bike.current_km)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'replaced', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_components_bike_id ON components(bike_id);
CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);

-- ============================================================
-- Add FK: user_profiles.default_bike_id → bikes.id
-- ============================================================
ALTER TABLE user_profiles
  ADD CONSTRAINT fk_user_profiles_default_bike
  FOREIGN KEY (default_bike_id) REFERENCES bikes(id) ON DELETE SET NULL;

-- ============================================================
-- Triggers: set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_bikes
  BEFORE UPDATE ON bikes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_components
  BEFORE UPDATE ON components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
