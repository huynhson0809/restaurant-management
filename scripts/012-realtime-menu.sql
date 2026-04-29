-- ============================================================================
-- Enable Supabase Realtime for menu_items and categories
-- ============================================================================
-- Lets the customer-facing app receive instant updates when admin edits, hides,
-- or deletes menu items or categories. Without this, the customer sees stale
-- data until they reload.
-- ============================================================================

ALTER TABLE menu_items REPLICA IDENTITY FULL;
ALTER TABLE categories REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  END IF;
END $$;

-- Verify:
--   SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- → should include menu_items and categories
