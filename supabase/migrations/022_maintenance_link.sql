-- Migration: 022_maintenance_link
-- Description: Tie a maintenance transaction to the service log that created it,
-- so deleting the log deletes its cost.
--
-- Why a foreign key with ON DELETE CASCADE rather than application logic: a
-- maintenance cost and its log are one thing. Enforcing the pairing in the
-- database means no code path can forget it, and a deleted service can never
-- keep inflating the Finance totals.
--
-- Apply via the Supabase SQL Editor (no local psql/DATABASE_URL in this project).
-- Every statement is idempotent and safe to run twice.
--
-- Existing maintenance transactions have a NULL maintenance_log_id: they predate
-- this column and simply are not linked. The cascade does not fire for them, and
-- deleting their log still works.

-- ============================================================
-- transactions: link to the maintenance log that created the cost
-- ============================================================
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS maintenance_log_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_maintenance_log_id_fkey'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_maintenance_log_id_fkey
      FOREIGN KEY (maintenance_log_id) REFERENCES maintenance_logs(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_maintenance_log
  ON transactions(maintenance_log_id);
