-- ============================================================================
-- Add is_active flag to categories
-- ============================================================================
-- Hidden categories (is_active = false) and their items disappear from the
-- customer-facing menu without losing data, so admin can re-enable later.
-- ============================================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill any existing rows (no-op on a fresh schema)
UPDATE categories SET is_active = TRUE WHERE is_active IS NULL;
