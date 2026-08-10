-- Migration: 008_enable_rls_and_triggers
-- Description: Enable RLS policies on all tables + auto-update km trigger on activities
-- Dependencies: 001 - 007 (all table migrations)

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: users
-- ============================================================
CREATE POLICY "user_select_own" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "user_delete_own" ON users
  FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- RLS Policies: user_profiles
-- ============================================================
CREATE POLICY "profile_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profile_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profile_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profile_delete_own" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: activities
-- ============================================================
CREATE POLICY "activity_select_own" ON activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_insert_own" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_update_own" ON activities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "activity_delete_own" ON activities
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: bikes
-- ============================================================
CREATE POLICY "bike_select_own" ON bikes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bike_insert_own" ON bikes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bike_update_own" ON bikes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bike_delete_own" ON bikes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: components
-- (filtered via bike_id -> bike.user_id)
-- ============================================================
CREATE POLICY "component_select_own" ON components
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = components.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "component_insert_own" ON components
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = components.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "component_update_own" ON components
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = components.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "component_delete_own" ON components
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = components.bike_id AND bikes.user_id = auth.uid())
  );

-- ============================================================
-- RLS Policies: maintenance_logs
-- ============================================================
CREATE POLICY "maintlog_select_own" ON maintenance_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_logs.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "maintlog_insert_own" ON maintenance_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_logs.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "maintlog_update_own" ON maintenance_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_logs.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "maintlog_delete_own" ON maintenance_logs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_logs.bike_id AND bikes.user_id = auth.uid())
  );

-- ============================================================
-- RLS Policies: maintenance_schedules
-- ============================================================
CREATE POLICY "maintsched_select_own" ON maintenance_schedules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_schedules.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "maintsched_insert_own" ON maintenance_schedules
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_schedules.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "maintsched_update_own" ON maintenance_schedules
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_schedules.bike_id AND bikes.user_id = auth.uid())
  );
CREATE POLICY "maintsched_delete_own" ON maintenance_schedules
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM bikes WHERE bikes.id = maintenance_schedules.bike_id AND bikes.user_id = auth.uid())
  );

-- ============================================================
-- RLS Policies: transactions
-- ============================================================
CREATE POLICY "txn_select_own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "txn_insert_own" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "txn_update_own" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "txn_delete_own" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: budgets
-- ============================================================
CREATE POLICY "budget_select_own" ON budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budget_insert_own" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_update_own" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budget_delete_own" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: goals
-- ============================================================
CREATE POLICY "goal_select_own" ON goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goal_insert_own" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goal_update_own" ON goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goal_delete_own" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: events
-- ============================================================
CREATE POLICY "event_select_own" ON events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "event_insert_own" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_update_own" ON events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "event_delete_own" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Function: update_bike_km_after_activity
-- Auto-update bike.current_km and active components' current_km
-- when a new activity is inserted
-- ============================================================
CREATE OR REPLACE FUNCTION update_bike_km_after_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bike_id IS NOT NULL THEN
    -- Update bike current_km
    UPDATE bikes
    SET current_km = current_km + (NEW.distance / 1000)
    WHERE id = NEW.bike_id;

    -- Update all active components on this bike
    UPDATE components
    SET current_km = components.current_km + (NEW.distance / 1000)
    WHERE bike_id = NEW.bike_id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Trigger: auto-update km on activity insert
-- ============================================================
CREATE TRIGGER trigger_update_bike_km
  AFTER INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION update_bike_km_after_activity();
