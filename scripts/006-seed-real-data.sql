-- Real production seed data
-- All IDs are auto-generated UUIDs by Supabase
-- Run this in Supabase SQL Editor AFTER running 005-clear-all-data.sql

-- =============================================
-- 1. Categories
-- =============================================
INSERT INTO categories (name, name_en, sort_order) VALUES
('CƠM', 'Rice Dishes', 1),
('BÚN', 'Noodle Soup', 2),
('PHỞ', 'Pho', 3),
('BÁNH MÌ', 'Banh Mi', 4),
('HỦ TIẾU', 'Hu Tieu', 5),
('KHAI VỊ', 'Appetizers', 6);

-- =============================================
-- 2. Menu Items (using subqueries for category_id)
-- =============================================

-- CƠM (Rice Dishes)
INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Cơm Tấm Sườn Bì Chả', 'Broken Rice with Pork Chop', 
  'Cơm tấm đặc trưng Sài Gòn với sườn nướng, bì, chả trứng',
  'Signature Saigon broken rice with grilled pork chop, shredded pork skin, and egg meatloaf',
  55000, true, 1
FROM categories WHERE name = 'CƠM';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Cơm Gà Hội An', 'Hoi An Chicken Rice',
  'Cơm gà xé phay theo phong cách Hội An',
  'Hoi An style chicken rice with shredded chicken',
  50000, true, 2
FROM categories WHERE name = 'CƠM';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Cơm Đùi Gà Nướng', 'Grilled Chicken Leg Rice',
  'Đùi gà nướng mật ong thơm lừng',
  'Honey-glazed grilled chicken leg with rice',
  55000, true, 3
FROM categories WHERE name = 'CƠM';

-- BÚN (Noodle Soup)
INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Bún Thịt Nướng Chả Giò', 'Vermicelli with Grilled Pork & Spring Roll',
  'Bún tươi với thịt nướng và chả giò giòn',
  'Fresh rice vermicelli with grilled pork and crispy spring rolls',
  50000, true, 1
FROM categories WHERE name = 'BÚN';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Bún Bò', 'Beef Noodle Soup',
  'Bún bò Huế đậm đà sả và mắm ruốc',
  'Hue-style beef noodle soup with lemongrass and shrimp paste',
  55000, true, 2
FROM categories WHERE name = 'BÚN';

-- PHỞ (Pho)
INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Phở Bò Tái', 'Pho with Rare Beef',
  'Phở nước trong với thịt bò tái mềm',
  'Clear pho broth with tender rare beef slices',
  55000, true, 1
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Phở Bò Nạm', 'Pho with Beef Brisket',
  'Phở với nạm bò mềm thấm vị',
  'Pho with tender, flavorful beef brisket',
  55000, true, 2
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Phở Bò Viên', 'Pho with Beef Meatballs',
  'Phở với bò viên tươi dai',
  'Pho with fresh, bouncy beef meatballs',
  50000, true, 3
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Phở Bò Sốt Vang', 'Pho with Beef Stew',
  'Phở đặc biệt với bò sốt vang đậm đà',
  'Special pho with rich wine-braised beef',
  65000, true, 4
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Phở Gà', 'Chicken Pho',
  'Phở gà nước trong vị thanh',
  'Light and clear chicken pho',
  50000, true, 5
FROM categories WHERE name = 'PHỞ';

-- BÁNH MÌ (Banh Mi)
INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Bánh Mì Chả', 'Banh Mi with Vietnamese Ham',
  'Bánh mì giòn với chả lụa',
  'Crispy baguette with Vietnamese ham',
  25000, true, 1
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Bánh Mì Thịt Nướng', 'Banh Mi with Grilled Pork',
  'Bánh mì thịt heo nướng thơm',
  'Baguette with fragrant grilled pork',
  30000, true, 2
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Bánh Mì Heo Quay', 'Banh Mi with Roasted Pork',
  'Bánh mì heo quay da giòn',
  'Baguette with crispy skin roasted pork',
  35000, true, 3
FROM categories WHERE name = 'BÁNH MÌ';

-- HỦ TIẾU (Hu Tieu)
INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Hủ Tiếu Nước', 'Hu Tieu Soup',
  'Hủ tiếu nước lèo trong veo',
  'Clear soup hu tieu noodles',
  50000, true, 1
FROM categories WHERE name = 'HỦ TIẾU';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Hủ Tiếu Khô', 'Dry Hu Tieu',
  'Hủ tiếu khô trộn mỡ hành',
  'Dry hu tieu with scallion oil',
  50000, true, 2
FROM categories WHERE name = 'HỦ TIẾU';

-- KHAI VỊ (Appetizers)
INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Gỏi Cuốn', 'Fresh Spring Rolls',
  '2 cuốn gỏi cuốn tôm thịt',
  '2 fresh spring rolls with shrimp and pork',
  35000, true, 1
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Chả Giò', 'Fried Spring Rolls',
  '4 cuốn chả giò giòn rụm',
  '4 crispy fried spring rolls',
  35000, true, 2
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, is_available, sort_order)
SELECT id, 'Bò Kho', 'Beef Stew',
  'Bò kho đậm đà ăn kèm bánh mì',
  'Rich beef stew served with bread',
  45000, true, 3
FROM categories WHERE name = 'KHAI VỊ';

-- =============================================
-- 3. Tables (6 tables for the restaurant)
--    qr_code_token is auto-generated UUID
-- =============================================
INSERT INTO tables (table_number, name, capacity, is_active) VALUES
(1, 'Bàn 1', 4, true),
(2, 'Bàn 2', 4, true),
(3, 'Bàn 3', 6, true),
(4, 'Bàn 4', 4, true),
(5, 'Bàn 5', 2, true),
(6, 'Bàn 6', 8, true);

-- =============================================
-- Verify: show created data with real UUIDs
-- =============================================
SELECT 'Categories' AS type, id::text, name FROM categories ORDER BY sort_order;
SELECT 'Tables' AS type, id::text, name, qr_code_token::text FROM tables ORDER BY table_number;
SELECT 'Menu Items' AS type, id::text, name, price::text FROM menu_items ORDER BY sort_order;
