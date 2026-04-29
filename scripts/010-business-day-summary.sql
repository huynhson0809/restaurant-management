-- ============================================================================
-- Business-day boundaries (configurable via restaurant_settings) + summary
-- ============================================================================
-- A business day starts at reset_hour (default 5 AM) and ends 24h later. Late-
-- night sales past midnight stay grouped with the previous evening's shift.
-- Self-contained: safe to run even if 008 hasn't been applied.
-- ============================================================================

-- 1. daily_summary table (created in 008; included here to be self-sufficient)
CREATE TABLE IF NOT EXISTS daily_summary (
  summary_date DATE PRIMARY KEY,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_items_sold INTEGER NOT NULL DEFAULT 0,
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  cancelled_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  top_dishes JSONB NOT NULL DEFAULT '[]'::jsonb,
  by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(summary_date DESC);

-- 2. Settings table — single-row config edited from the admin UI
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_day_reset_hour INTEGER NOT NULL DEFAULT 5
    CHECK (business_day_reset_hour >= 0 AND business_day_reset_hour < 24),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO restaurant_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read (so the customer-facing app can fetch reset hour),
-- but only admin (handled via password gate at app level) writes.
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings" ON restaurant_settings;
CREATE POLICY "Public read settings" ON restaurant_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public update settings" ON restaurant_settings;
CREATE POLICY "Public update settings" ON restaurant_settings FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert settings" ON restaurant_settings;
CREATE POLICY "Public insert settings" ON restaurant_settings FOR INSERT WITH CHECK (true);

-- 3. business_day_reset_hour() reads live from settings table
CREATE OR REPLACE FUNCTION business_day_reset_hour()
RETURNS INTEGER AS $$
  SELECT COALESCE(
    (SELECT business_day_reset_hour FROM restaurant_settings WHERE id = 1),
    5
  );
$$ LANGUAGE SQL STABLE;

-- Returns the business day a timestamp belongs to (as a DATE).
-- Example: with reset=5, 2026-04-29 02:00 → 2026-04-28 (still in evening shift)
CREATE OR REPLACE FUNCTION business_day_of(ts TIMESTAMPTZ)
RETURNS DATE AS $$
  SELECT (ts - (business_day_reset_hour() || ' hours')::INTERVAL)::date;
$$ LANGUAGE SQL IMMUTABLE;

-- Replace aggregate_daily_summary to use business_day_of() instead of ::date
CREATE OR REPLACE FUNCTION aggregate_daily_summary(target_date DATE)
RETURNS void AS $$
DECLARE
  -- Business day window: [target_date + RESET_HOUR, target_date + 1d + RESET_HOUR)
  day_start TIMESTAMPTZ := target_date::timestamptz + (business_day_reset_hour() || ' hours')::INTERVAL;
  day_end TIMESTAMPTZ := day_start + INTERVAL '1 day';
BEGIN
  INSERT INTO daily_summary (
    summary_date,
    total_orders,
    total_revenue,
    total_items_sold,
    cancelled_orders,
    cancelled_revenue,
    top_dishes,
    by_category,
    updated_at
  )
  SELECT
    target_date,
    COALESCE((
      SELECT COUNT(*) FROM orders
      WHERE created_at >= day_start AND created_at < day_end AND status = 'done'
    ), 0),
    COALESCE((
      SELECT SUM(total_amount) FROM orders
      WHERE created_at >= day_start AND created_at < day_end AND status = 'done'
    ), 0),
    COALESCE((
      SELECT SUM(oi.quantity)
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= day_start AND o.created_at < day_end AND o.status = 'done'
    ), 0),
    COALESCE((
      SELECT COUNT(*) FROM orders
      WHERE created_at >= day_start AND created_at < day_end AND status = 'cancelled'
    ), 0),
    COALESCE((
      SELECT SUM(total_amount) FROM orders
      WHERE created_at >= day_start AND created_at < day_end AND status = 'cancelled'
    ), 0),
    COALESCE((
      SELECT jsonb_agg(t)
      FROM (
        SELECT mi.id AS menu_item_id, mi.name,
               SUM(oi.quantity) AS quantity,
               SUM(oi.quantity * oi.unit_price) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        WHERE o.created_at >= day_start AND o.created_at < day_end AND o.status = 'done'
        GROUP BY mi.id, mi.name
        ORDER BY quantity DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    COALESCE((
      SELECT jsonb_object_agg(category_id, jsonb_build_object(
        'name', category_name, 'revenue', revenue, 'quantity', quantity
      ))
      FROM (
        SELECT c.id AS category_id, c.name AS category_name,
               SUM(oi.quantity * oi.unit_price) AS revenue,
               SUM(oi.quantity) AS quantity
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        JOIN categories c ON c.id = mi.category_id
        WHERE o.created_at >= day_start AND o.created_at < day_end AND o.status = 'done'
        GROUP BY c.id, c.name
      ) t
    ), '{}'::jsonb),
    now()
  ON CONFLICT (summary_date) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_items_sold = EXCLUDED.total_items_sold,
    cancelled_orders = EXCLUDED.cancelled_orders,
    cancelled_revenue = EXCLUDED.cancelled_revenue,
    top_dishes = EXCLUDED.top_dishes,
    by_category = EXCLUDED.by_category,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Replace cleanup_old_orders to use business_day_of() too
CREATE OR REPLACE FUNCTION cleanup_old_orders(retention_days INTEGER DEFAULT 180)
RETURNS TABLE (deleted_orders INTEGER, deleted_items INTEGER, cutoff_date DATE) AS $$
DECLARE
  cutoff TIMESTAMPTZ := now() - (retention_days || ' days')::INTERVAL;
  cutoff_d DATE := business_day_of(cutoff);
  d DATE;
  del_orders INTEGER := 0;
  del_items INTEGER := 0;
BEGIN
  -- Aggregate any missing business days before deletion
  FOR d IN
    SELECT DISTINCT business_day_of(created_at)
    FROM orders
    WHERE created_at < cutoff
      AND status IN ('done', 'cancelled')
      AND NOT EXISTS (
        SELECT 1 FROM daily_summary ds WHERE ds.summary_date = business_day_of(orders.created_at)
      )
  LOOP
    PERFORM aggregate_daily_summary(d);
  END LOOP;

  WITH del AS (
    DELETE FROM order_items
    WHERE order_id IN (
      SELECT id FROM orders
      WHERE created_at < cutoff AND status IN ('done', 'cancelled')
    )
    RETURNING 1
  ) SELECT COUNT(*) INTO del_items FROM del;

  WITH del AS (
    DELETE FROM orders
    WHERE created_at < cutoff AND status IN ('done', 'cancelled')
    RETURNING 1
  ) SELECT COUNT(*) INTO del_orders FROM del;

  RETURN QUERY SELECT del_orders, del_items, cutoff_d;
END;
$$ LANGUAGE plpgsql;

-- Re-bootstrap: clear and re-aggregate all existing summary rows under
-- the new business-day rules.
TRUNCATE TABLE daily_summary;
DO $$
DECLARE d DATE;
BEGIN
  FOR d IN
    SELECT DISTINCT business_day_of(created_at) FROM orders
    WHERE status IN ('done', 'cancelled')
    ORDER BY 1
  LOOP
    PERFORM aggregate_daily_summary(d);
  END LOOP;
END $$;

-- Cron jobs: schedule aggregator at 6 AM (1h after RESET_HOUR), cleanup at
-- 3 AM monthly. Re-run these AFTER pg_cron is enabled. If the jobs already
-- exist from script 008, unschedule first:
--
--   SELECT cron.unschedule('aggregate-yesterday');
--   SELECT cron.unschedule('cleanup-old-orders');
--
-- Then schedule:
--
--   SELECT cron.schedule(
--     'aggregate-yesterday',
--     '0 6 * * *',  -- 6 AM, just after business day flips
--     $$ SELECT aggregate_daily_summary((current_date - INTERVAL '1 day')::date); $$
--   );
--   SELECT cron.schedule(
--     'cleanup-old-orders',
--     '0 3 1 * *',
--     $$ SELECT cleanup_old_orders(180); $$
--   );
