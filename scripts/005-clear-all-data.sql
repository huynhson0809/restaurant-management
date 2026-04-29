-- Clear all data from all tables EXCEPT admin_users
-- Run this in your Supabase SQL Editor
-- Order matters due to foreign key constraints

-- Delete order items first (references orders and menu_items)
TRUNCATE order_items CASCADE;

-- Delete orders (references tables)
TRUNCATE orders CASCADE;

-- Delete menu items (references categories)
TRUNCATE menu_items CASCADE;

-- Delete categories
TRUNCATE categories CASCADE;

-- Delete tables
TRUNCATE tables CASCADE;

-- Verify all data is cleared
SELECT 'order_items' AS table_name, COUNT(*) AS row_count FROM order_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'tables', COUNT(*) FROM tables
UNION ALL
SELECT 'admin_users (preserved)', COUNT(*) FROM admin_users;
