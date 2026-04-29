-- ============================================================================
-- One-time cleanup + fix IMMUTABLE bug
-- Run this in Supabase SQL Editor ONCE to clean up existing data
-- ============================================================================

-- 1. Fix business_day_of() — IMMUTABLE → STABLE
--    IMMUTABLE tells Postgres it can cache results forever, but this function
--    reads from restaurant_settings, so it must be STABLE.
CREATE OR REPLACE FUNCTION business_day_of(ts TIMESTAMPTZ)
RETURNS DATE AS $$
  SELECT (ts - (business_day_reset_hour() || ' hours')::INTERVAL)::date;
$$ LANGUAGE SQL STABLE;

-- 2. Aggregate ALL missing business days into daily_summary
DO $$
DECLARE d DATE;
BEGIN
  FOR d IN
    SELECT DISTINCT business_day_of(created_at)
    FROM orders
    WHERE status IN ('done', 'cancelled')
      AND NOT EXISTS (
        SELECT 1 FROM daily_summary ds
        WHERE ds.summary_date = business_day_of(orders.created_at)
      )
    ORDER BY 1
  LOOP
    PERFORM aggregate_daily_summary(d);
  END LOOP;
END $$;

-- 3. Clean orphaned table_carts (session_token no longer matches any table)
DELETE FROM table_carts
WHERE session_token NOT IN (SELECT session_token FROM tables WHERE session_token IS NOT NULL);

-- 4. Clean old completed/cancelled orders (already aggregated above)
SELECT * FROM cleanup_old_orders(180);

-- 5. Verify results
SELECT 'daily_summary rows' AS metric, COUNT(*)::text AS value FROM daily_summary
UNION ALL
SELECT 'remaining orders', COUNT(*)::text FROM orders
UNION ALL
SELECT 'remaining order_items', COUNT(*)::text FROM order_items
UNION ALL
SELECT 'remaining table_carts', COUNT(*)::text FROM table_carts;
