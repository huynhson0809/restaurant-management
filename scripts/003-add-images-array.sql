-- Migration: Add images array and description_en columns to menu_items
-- Run this after the initial setup if you're upgrading an existing database

-- Add images array column (for multiple images per menu item)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add English description column
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Optional: Migrate existing image_url to images array
-- UPDATE menu_items 
-- SET images = ARRAY[image_url] 
-- WHERE image_url IS NOT NULL AND (images IS NULL OR images = '{}');
