-- Add session_token to tables for managing customer sessions
-- Each time a table is cleared (customer finishes), a new session_token is generated
-- This ensures new customers don't see previous orders

-- Add session_token column
ALTER TABLE tables ADD COLUMN IF NOT EXISTS session_token TEXT DEFAULT gen_random_uuid()::text;

-- Add session_started_at to track when the current session began
ALTER TABLE tables ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ DEFAULT now();

-- Update existing tables with new session tokens
UPDATE tables SET session_token = gen_random_uuid()::text WHERE session_token IS NULL;

-- Add session_token to orders to link orders to specific sessions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_token TEXT;

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_orders_session_token ON orders(session_token);
CREATE INDEX IF NOT EXISTS idx_tables_session_token ON tables(session_token);

-- Function to clear a table and generate new session
CREATE OR REPLACE FUNCTION clear_table_session(table_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE tables 
  SET 
    session_token = gen_random_uuid()::text,
    session_started_at = now()
  WHERE id = table_id_param;
END;
$$ LANGUAGE plpgsql;
