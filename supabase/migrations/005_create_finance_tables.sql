-- Migration: 005_create_finance_tables
-- Description: Create transactions and budgets tables for finance tracking
-- Dependencies: 001_create_users_and_profiles, 002_create_bikes_and_components,
--               003_create_activities, 004_create_maintenance_tables
-- Note: events table FK added in migration 007

-- ============================================================
-- Table: transactions
-- Stores income and expenses related to cycling
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN ('gear', 'maintenance', 'event', 'nutrition', 'other')),
  amount DECIMAL(12,2) NOT NULL, -- IDR, always positive
  date DATE NOT NULL,
  description TEXT,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  event_id UUID, -- FK to events table, added in migration 007
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  payment_method TEXT, -- cash, transfer, cc, etc
  merchant TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================================
-- Table: budgets
-- Stores monthly/yearly budget limits per category
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('gear', 'maintenance', 'event', 'nutrition', 'total', 'other')),
  amount DECIMAL(12,2) NOT NULL, -- IDR
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- ============================================================
-- Triggers: set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_budgets
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
