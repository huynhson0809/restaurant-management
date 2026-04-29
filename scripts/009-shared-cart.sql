-- ============================================================================
-- Shared cart per table session
-- ============================================================================
-- All devices that scanned the same QR code (same table session) share one cart
-- in real time. Cart is keyed by table.session_token; rotates automatically when
-- the cashier presses "Dọn bàn".
-- ============================================================================

CREATE TABLE IF NOT EXISTS table_carts (
  session_token TEXT PRIMARY KEY,
  -- items: [{ menu_item_id, quantity, notes }, ...]
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_table_carts_updated_at ON table_carts(updated_at);

-- Required so realtime UPDATE events include full row data (not just changed cols)
ALTER TABLE table_carts REPLICA IDENTITY FULL;

-- Row Level Security: anyone with the table's session_token (URL/QR) can read & write its cart
ALTER TABLE table_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read table_carts" ON table_carts;
CREATE POLICY "Public read table_carts" ON table_carts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert table_carts" ON table_carts;
CREATE POLICY "Public insert table_carts" ON table_carts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update table_carts" ON table_carts;
CREATE POLICY "Public update table_carts" ON table_carts FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete table_carts" ON table_carts;
CREATE POLICY "Public delete table_carts" ON table_carts FOR DELETE USING (true);

-- Enable Supabase Realtime for this table.
-- This is the only step needed — there is NO "Replication" UI in newer Supabase
-- dashboards; this SQL command is the canonical way to enable realtime.
DO $$
BEGIN
  -- Create publication if it somehow doesn't exist (rare on Supabase)
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add table_carts to publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'table_carts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE table_carts;
  END IF;
END $$;

-- Verify (run separately to confirm):
--   SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- → table_carts should appear in the list

-- Optional: cleanup orphan carts (session_tokens that no longer match any active table)
-- Run periodically or include in monthly cleanup cron:
--   DELETE FROM table_carts
--   WHERE session_token NOT IN (SELECT session_token FROM tables);
