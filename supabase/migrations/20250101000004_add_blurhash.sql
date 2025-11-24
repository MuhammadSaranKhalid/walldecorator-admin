-- =============================================================================
-- ADD BLURHASH SUPPORT TO PRODUCT IMAGES
-- Migration to add blurhash field for progressive image loading
-- =============================================================================

-- Add blurhash column to product_images table
ALTER TABLE product_images
ADD COLUMN blurhash VARCHAR(255);

-- Add comment to document the column
COMMENT ON COLUMN product_images.blurhash IS 'BlurHash string for progressive image loading and placeholders';

-- Create index for blurhash queries (optional, useful if we want to filter by blurhash existence)
CREATE INDEX idx_product_images_blurhash ON product_images(blurhash) WHERE blurhash IS NOT NULL;
