-- Ensure Realtime is enabled for the orders table
-- Run this in Supabase SQL Editor if realtime notifications aren't working

-- Step 1: Set REPLICA IDENTITY FULL (required for Supabase Realtime to work)
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_items REPLICA IDENTITY FULL;

-- Step 2: Reset publication and add all needed tables at once
ALTER PUBLICATION supabase_realtime SET TABLE orders, order_items;

-- Step 3: Verify
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
