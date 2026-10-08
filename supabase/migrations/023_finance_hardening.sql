-- Migration: 023_finance_hardening
-- Description: Indexes for the budget-status aggregation (spend per category
--   over a date range) used by /api/finance/budget-status.
--
-- Apply via the Supabase SQL Editor (no local psql/DATABASE_URL in this project).
-- Every statement is idempotent and safe to run twice.
--
-- Why no CHECK (amount > 0):
-- The schema has always allowed any amount, and rows created before this change
-- (including auto-created maintenance and event transactions) were never
-- validated. Adding the constraint would fail on those rows, and `ADD CONSTRAINT`
-- is not idempotent. Positive-amount enforcement lives in the write path instead
-- (see server/src/application/use-cases/finance/ValidationError.ts), which every
-- new write now goes through.

-- ============================================================
-- transactions: composite index for the per-category spend query
-- ============================================================
-- The budget-status query filters user_id = ? AND type = 'expense' AND
-- category = ? AND date BETWEEN ? AND ?. This covering-ish index lets Postgres
-- satisfy the filter and the date range without a full scan.
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_category_date
  ON transactions(user_id, type, category, date DESC);

-- ============================================================
-- budgets: composite index for the active-budget lookup
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_budgets_user_active_category
  ON budgets(user_id, is_active, category);
