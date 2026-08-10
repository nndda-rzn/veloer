-- Migration: 004_create_maintenance_tables
-- Description: Create maintenance_logs and maintenance_schedules tables
-- Dependencies: 001_create_users_and_profiles, 002_create_bikes_and_components

-- ============================================================
-- Table: maintenance_logs
-- Stores service/maintenance history for bikes and components
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  service_km DECIMAL(10,2) NOT NULL, -- bike km at service time
  type TEXT NOT NULL CHECK (type IN ('routine', 'repair', 'replacement', 'cleaning', 'tuning')),
  description TEXT NOT NULL,
  cost DECIMAL(12,2), -- IDR
  performed_by TEXT NOT NULL DEFAULT 'self' CHECK (performed_by IN ('self', 'shop')),
  shop_name TEXT,
  next_service_km DECIMAL(10,2),
  next_service_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_bike_id ON maintenance_logs(bike_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_component_id ON maintenance_logs(component_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_service_date ON maintenance_logs(service_date DESC);

-- ============================================================
-- Table: maintenance_schedules
-- Stores recurring maintenance reminders based on km and/or time
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  task_name TEXT NOT NULL, -- "Chain lube", "Brake check", etc
  interval_km DECIMAL(10,2), -- interval distance (nullable if time-based only)
  interval_days INTEGER, -- interval time (nullable if km-based only)
  last_performed_date DATE,
  last_performed_km DECIMAL(10,2),
  next_due_date DATE,
  next_due_km DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_bike_id ON maintenance_schedules(bike_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_component_id ON maintenance_schedules(component_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_active ON maintenance_schedules(is_active);

-- ============================================================
-- Trigger: set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_maintenance_schedules
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
