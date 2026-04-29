-- ============================================================================
-- Add restaurant name + logo URL to settings
-- ============================================================================
-- Admin can configure name + logo from the dashboard. The customer app, cashier
-- header, and landing page read these and render them.
-- ============================================================================

-- Ensure restaurant_settings table exists (created in 010)
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_day_reset_hour INTEGER NOT NULL DEFAULT 5
    CHECK (business_day_reset_hour >= 0 AND business_day_reset_hour < 24),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE restaurant_settings
  ADD COLUMN IF NOT EXISTS restaurant_name TEXT NOT NULL DEFAULT 'Nhà hàng',
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

INSERT INTO restaurant_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Realtime so all clients see logo/name updates instantly
ALTER TABLE restaurant_settings REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'restaurant_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_settings;
  END IF;
END $$;

-- RLS: anyone can read; updates handled via app-level admin gate
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings" ON restaurant_settings;
CREATE POLICY "Public read settings" ON restaurant_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public update settings" ON restaurant_settings;
CREATE POLICY "Public update settings" ON restaurant_settings FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert settings" ON restaurant_settings;
CREATE POLICY "Public insert settings" ON restaurant_settings FOR INSERT WITH CHECK (true);
