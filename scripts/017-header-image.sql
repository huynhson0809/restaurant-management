-- Add header_image_url to restaurant_settings
-- Used as the background image for the order page header
ALTER TABLE restaurant_settings
  ADD COLUMN IF NOT EXISTS header_image_url TEXT;
