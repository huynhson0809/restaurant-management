-- Add parent_id column to menu_items for parent-child relationships
-- A parent item (e.g., "Cơm Tấm") has children (e.g., "Cơm Tấm Sườn Bì", "Cơm Tấm Gà")
-- parent_id = NULL means it's a top-level (standalone or parent) item
-- parent_id = <some_id> means it's a child/variant of that parent

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE;

-- Index for efficient parent->children lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);

-- Enable realtime for this change
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
