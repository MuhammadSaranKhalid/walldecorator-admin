-- =============================================================================
-- ADD IMAGE VARIANTS SUPPORT TO PRODUCT IMAGES
-- Migration to add support for multiple image sizes for optimal performance
-- =============================================================================

-- Add variant columns to product_images table
ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,      -- 400x400 for product cards
ADD COLUMN IF NOT EXISTS medium_url TEXT,         -- 800x800 for mobile detail
ADD COLUMN IF NOT EXISTS large_url TEXT,          -- 1200x1200 for desktop detail
ADD COLUMN IF NOT EXISTS width INTEGER,           -- Original image width
ADD COLUMN IF NOT EXISTS height INTEGER,          -- Original image height
ADD COLUMN IF NOT EXISTS file_size INTEGER;       -- Original file size in bytes

-- Add comments to document the columns
COMMENT ON COLUMN product_images.thumbnail_url IS '400x400 WebP variant for product cards and thumbnails';
COMMENT ON COLUMN product_images.medium_url IS '800x800 WebP variant for mobile product detail view';
COMMENT ON COLUMN product_images.large_url IS '1200x1200 WebP variant for desktop product detail view';
COMMENT ON COLUMN product_images.width IS 'Original image width in pixels';
COMMENT ON COLUMN product_images.height IS 'Original image height in pixels';
COMMENT ON COLUMN product_images.file_size IS 'Original file size in bytes';

-- Rename existing image_url to original_url for clarity
ALTER TABLE product_images
RENAME COLUMN image_url TO original_url;

COMMENT ON COLUMN product_images.original_url IS 'Original uploaded image URL (full resolution)';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_variants
ON product_images(product_id, is_primary)
WHERE thumbnail_url IS NOT NULL;
