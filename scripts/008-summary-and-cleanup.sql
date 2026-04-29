-- ============================================================================
-- Daily summary table + auto cleanup cron jobs
-- ============================================================================
-- Goal: Keep DB lightweight by deleting raw orders older than 6 months,
-- but preserve aggregated business metrics in `daily_summary` forever.
--
-- Run this entire file once on Supabase SQL Editor. Then enable the
-- `pg_cron` extension via Database > Extensions in Supabase dashboard.
-- ============================================================================

-- 1. Daily summary table
CREATE TABLE IF NOT EXISTS daily_summary (
  summary_date DATE PRIMARY KEY,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_items_sold INTEGER NOT NULL DEFAULT 0,
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  cancelled_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  -- top_dishes: [{ menu_item_id, name, quantity, revenue }, ...]
  top_dishes JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- by_category: { category_id: { name, revenue, quantity }, ... }
  by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(summary_date DESC);

-- 2. Function: aggregate orders for a single date into daily_summary
CREATE OR REPLACE FUNCTION aggregate_daily_summary(target_date DATE)
RETURNS void AS $$
DECLARE
  day_start TIMESTAMPTZ := target_date::timestamptz;
  day_end TIMESTAMPTZ := (target_date + INTERVAL '1 day')::timestamptz;
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
    target_date AS summary_date,
    COALESCE((
      SELECT COUNT(*) FROM orders
      WHERE created_at >= day_start AND created_at < day_end
        AND status = 'done'
    ), 0),
    COALESCE((
      SELECT SUM(total_amount) FROM orders
      WHERE created_at >= day_start AND created_at < day_end
        AND status = 'done'
    ), 0),
    COALESCE((
      SELECT SUM(oi.quantity)
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= day_start AND o.created_at < day_end
        AND o.status = 'done'
    ), 0),
    COALESCE((
      SELECT COUNT(*) FROM orders
      WHERE created_at >= day_start AND created_at < day_end
        AND status = 'cancelled'
    ), 0),
    COALESCE((
      SELECT SUM(total_amount) FROM orders
      WHERE created_at >= day_start AND created_at < day_end
        AND status = 'cancelled'
    ), 0),
    COALESCE((
      SELECT jsonb_agg(t)
      FROM (
        SELECT
          mi.id AS menu_item_id,
          mi.name,
          SUM(oi.quantity) AS quantity,
          SUM(oi.quantity * oi.unit_price) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        WHERE o.created_at >= day_start AND o.created_at < day_end
          AND o.status = 'done'
        GROUP BY mi.id, mi.name
        ORDER BY quantity DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    COALESCE((
      SELECT jsonb_object_agg(category_id, jsonb_build_object(
        'name', category_name,
        'revenue', revenue,
        'quantity', quantity
      ))
      FROM (
        SELECT
          c.id AS category_id,
          c.name AS category_name,
          SUM(oi.quantity * oi.unit_price) AS revenue,
          SUM(oi.quantity) AS quantity
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        JOIN categories c ON c.id = mi.category_id
        WHERE o.created_at >= day_start AND o.created_at < day_end
          AND o.status = 'done'
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

-- 3. Function: aggregate any missing days then delete orders older than 6 months
CREATE OR REPLACE FUNCTION cleanup_old_orders(retention_days INTEGER DEFAULT 180)
RETURNS TABLE (
  deleted_orders INTEGER,
  deleted_items INTEGER,
  cutoff_date DATE
) AS $$
DECLARE
  cutoff TIMESTAMPTZ := now() - (retention_days || ' days')::INTERVAL;
  cutoff_d DATE := cutoff::date;
  d DATE;
  del_orders INTEGER := 0;
  del_items INTEGER := 0;
BEGIN
  -- Aggregate every day from cutoff back to oldest existing order if missing
  FOR d IN
    SELECT DISTINCT created_at::date
    FROM orders
    WHERE created_at < cutoff
      AND status IN ('done', 'cancelled')
      AND NOT EXISTS (
        SELECT 1 FROM daily_summary ds WHERE ds.summary_date = orders.created_at::date
      )
  LOOP
    PERFORM aggregate_daily_summary(d);
  END LOOP;

  -- Delete order_items first (FK)
  WITH del AS (
    DELETE FROM order_items
    WHERE order_id IN (
      SELECT id FROM orders
      WHERE created_at < cutoff
        AND status IN ('done', 'cancelled')
    )
    RETURNING 1
  )
  SELECT COUNT(*) INTO del_items FROM del;

  -- Delete orders
  WITH del AS (
    DELETE FROM orders
    WHERE created_at < cutoff
      AND status IN ('done', 'cancelled')
    RETURNING 1
  )
  SELECT COUNT(*) INTO del_orders FROM del;

  RETURN QUERY SELECT del_orders, del_items, cutoff_d;
END;
$$ LANGUAGE plpgsql;

-- 4. Convenience views for the admin dashboard
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  date_trunc('month', summary_date)::date AS month,
  SUM(total_orders) AS total_orders,
  SUM(total_revenue) AS total_revenue,
  SUM(total_items_sold) AS total_items_sold,
  SUM(cancelled_orders) AS cancelled_orders,
  SUM(cancelled_revenue) AS cancelled_revenue
FROM daily_summary
GROUP BY date_trunc('month', summary_date);

-- 5. Cron jobs (requires pg_cron extension enabled)
-- Enable on dashboard: Database > Extensions > pg_cron
-- After enabling, run the section below:

-- Run this section AFTER enabling pg_cron:
-- ----------------------------------------
-- -- Daily 1:00 AM (server tz, usually UTC) — aggregate yesterday
-- SELECT cron.schedule(
--   'aggregate-yesterday',
--   '0 1 * * *',
--   $$ SELECT aggregate_daily_summary((current_date - INTERVAL '1 day')::date); $$
-- );
--
-- -- Monthly on the 1st at 3:00 AM — cleanup orders older than 180 days
-- SELECT cron.schedule(
--   'cleanup-old-orders',
--   '0 3 1 * *',
--   $$ SELECT cleanup_old_orders(180); $$
-- );

-- ----------------------------------------
-- Manual usage (run from SQL Editor any time):
--   SELECT aggregate_daily_summary('2026-04-27');
--   SELECT * FROM cleanup_old_orders(180);
--   SELECT * FROM daily_summary ORDER BY summary_date DESC LIMIT 30;
--   SELECT * FROM monthly_summary ORDER BY month DESC;

-- 6. Bootstrap: aggregate all existing data so summary covers history
DO $$
DECLARE d DATE;
BEGIN
  FOR d IN
    SELECT DISTINCT created_at::date FROM orders
    WHERE status IN ('done', 'cancelled')
    ORDER BY 1
  LOOP
    PERFORM aggregate_daily_summary(d);
  END LOOP;
END $$;
