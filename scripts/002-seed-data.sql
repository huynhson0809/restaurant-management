-- Seed data for Restaurant Management System
-- Run this after 001-create-tables.sql

-- Insert Categories
INSERT INTO categories (name, name_en, sort_order) VALUES
('CƠM', 'Rice Dishes', 1),
('BÚN', 'Noodle Soup', 2),
('PHỞ', 'Pho', 3),
('BÁNH MÌ', 'Banh Mi', 4),
('HỦ TIẾU', 'Hu Tieu', 5),
('KHAI VỊ', 'Appetizers', 6);

-- Insert Menu Items
-- CƠM (Rice Dishes)
INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Cơm Tấm Sườn Bì Chả', 'Broken Rice with Pork Chop, Skin & Meatloaf', 55000, 1
FROM categories WHERE name = 'CƠM';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Cơm Gà Hội An', 'Hoi An Chicken Rice', 50000, 2
FROM categories WHERE name = 'CƠM';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Cơm Đùi Gà Nướng', 'Grilled Chicken Leg Rice', 55000, 3
FROM categories WHERE name = 'CƠM';

-- BÚN (Noodle Soup)
INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bún Thịt Nướng Chả Giò', 'Vermicelli with Grilled Pork & Spring Roll', 50000, 1
FROM categories WHERE name = 'BÚN';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bún Bò', 'Beef Noodle Soup', 55000, 2
FROM categories WHERE name = 'BÚN';

-- PHỞ (Pho)
INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Phở Bò Tái', 'Pho with Rare Beef', 55000, 1
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Phở Bò Nạm', 'Pho with Beef Brisket', 55000, 2
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Phở Bò Bắp', 'Pho with Beef Shank', 55000, 3
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Phở Bò Viên', 'Pho with Beef Meatballs', 50000, 4
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Phở Bò Sốt Vang', 'Pho with Beef Stew', 65000, 5
FROM categories WHERE name = 'PHỞ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Phở Gà', 'Chicken Pho', 50000, 6
FROM categories WHERE name = 'PHỞ';

-- BÁNH MÌ (Banh Mi)
INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bánh Mì Chả', 'Banh Mi with Vietnamese Ham', 25000, 1
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bánh Mì Xíu Mại', 'Banh Mi with Meatballs', 30000, 2
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bánh Mì Thịt Nướng', 'Banh Mi with Grilled Pork', 30000, 3
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bánh Mì Gà Nướng', 'Banh Mi with Grilled Chicken', 30000, 4
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bánh Mì Heo Quay', 'Banh Mi with Roasted Pork', 35000, 5
FROM categories WHERE name = 'BÁNH MÌ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bánh Mì Bò Nướng', 'Banh Mi with Grilled Beef', 35000, 6
FROM categories WHERE name = 'BÁNH MÌ';

-- HỦ TIẾU (Hu Tieu)
INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Hủ Tiếu Nước', 'Hu Tieu Soup', 50000, 1
FROM categories WHERE name = 'HỦ TIẾU';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Hủ Tiếu Bò Kho', 'Hu Tieu with Beef Stew', 55000, 2
FROM categories WHERE name = 'HỦ TIẾU';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Hủ Tiếu Khô', 'Dry Hu Tieu', 50000, 3
FROM categories WHERE name = 'HỦ TIẾU';

-- KHAI VỊ (Appetizers)
INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Gỏi Cuốn', 'Fresh Spring Rolls', 35000, 1
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Chả Giò', 'Fried Spring Rolls', 35000, 2
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Xíu Mại Chén', 'Steamed Meatballs', 30000, 3
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Bò Kho', 'Beef Stew', 45000, 4
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Gỏi Gà', 'Chicken Salad', 40000, 5
FROM categories WHERE name = 'KHAI VỊ';

INSERT INTO menu_items (category_id, name, name_en, price, sort_order)
SELECT id, 'Gỏi Bò Tái Chanh', 'Rare Beef Salad with Lime', 55000, 6
FROM categories WHERE name = 'KHAI VỊ';

-- Insert sample tables
INSERT INTO tables (table_number, name, capacity) VALUES
(1, 'Bàn 1', 4),
(2, 'Bàn 2', 4),
(3, 'Bàn 3', 6),
(4, 'Bàn 4', 4),
(5, 'Bàn 5', 2),
(6, 'Bàn 6', 8),
(7, 'Bàn 7', 4),
(8, 'Bàn 8', 4),
(9, 'Bàn 9', 6),
(10, 'Bàn 10', 4);

-- Insert default admin user (password: admin123 - you should change this!)
-- Insert default cashier user (password: cashier123 - you should change this!)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO admin_users (username, password_hash, role, full_name) VALUES
('admin', '$2a$10$rQEY8TFTGVFb9GjFN5yQNODvYxLvqMZP8QKvD6P.KZwjwJHHQKvDm', 'admin', 'Administrator'),
('cashier', '$2a$10$rQEY8TFTGVFb9GjFN5yQNODvYxLvqMZP8QKvD6P.KZwjwJHHQKvDm', 'cashier', 'Cashier 1');
