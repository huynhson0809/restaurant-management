-- ============================================================================
-- Enable Supabase Realtime for tables
-- ============================================================================
-- Lets the customer-facing app react instantly when cashier clears a table
-- (rotates session_token). Without this, the customer's cart/history would
-- only refresh after a manual reload.
-- ============================================================================

ALTER TABLE tables REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tables'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tables;
  END IF;
END $$;
