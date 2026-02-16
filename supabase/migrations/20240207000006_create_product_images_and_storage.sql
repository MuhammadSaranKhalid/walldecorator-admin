-- Migration: 0006_create_product_images_and_storage
-- Description: Creates the product_images table and sets up storage policies.

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,      -- 400x400 variant
  medium_url TEXT,         -- 800x800 variant
  large_url TEXT,          -- 1200x1200 variant
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  blurhash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_image_variants table for detailed metadata
CREATE TABLE IF NOT EXISTS product_image_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_image_id UUID NOT NULL REFERENCES product_images(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- e.g., 'thumbnail', 'medium'
  width INTEGER,
  height INTEGER,
  size INTEGER, -- in bytes
  format TEXT, -- e.g., 'webp'
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  storage_object_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_image_id, variant_name)
);

-- RLS for variants
ALTER TABLE product_image_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can select product_image_variants" ON product_image_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product_image_variants" ON product_image_variants FOR INSERT WITH CHECK (true); -- Service role will bypass, but good for completeness
CREATE POLICY "Anyone can update product_image_variants" ON product_image_variants FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_image_variants" ON product_image_variants FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_variants ON product_images(product_id, is_primary) WHERE thumbnail_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_images_blurhash ON product_images(blurhash) WHERE blurhash IS NOT NULL;


-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can select product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product_images" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_images" ON product_images FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_images" ON product_images FOR DELETE USING (true);

-- Function and trigger to ensure single primary image
CREATE OR REPLACE FUNCTION public.ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE product_images
    SET is_primary = FALSE
    WHERE product_id = NEW.product_id
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_images_primary_check ON product_images;
CREATE TRIGGER product_images_primary_check
  AFTER INSERT OR UPDATE ON product_images
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION ensure_single_primary_image();

CREATE OR REPLACE FUNCTION public.trigger_process_image()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, vault, net, extensions
AS $$
DECLARE
  function_url text;
  service_key text;
BEGIN
  -- Retrieve secrets from Supabase Vault
  -- Note: We wrap in a block to ensure we can capture variables.
  
  SELECT decrypted_secret INTO function_url
  FROM vault.decrypted_secrets
  WHERE name = 'process_image_api_url'
  LIMIT 1;

  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  -- Fallback/Check (Optional: Log if missing)
  IF function_url IS NULL OR service_key IS NULL THEN
      -- In a real app, you might raise a warning or use defaults.
      -- RAISENOTICE 'Missing vault secrets for image processing';
      RETURN NEW; 
  END IF;

    PERFORM
    net.http_post(
      function_url,
      jsonb_build_object('record', row_to_json(NEW)),
      '{}'::jsonb,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      5000
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for image processing (Optional if using Dashboard Webhook, but good for visibility)
DROP TRIGGER IF EXISTS on_image_upload ON product_images;
CREATE TRIGGER on_image_upload
  AFTER INSERT ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_image();

-- STORAGE SETUP
-- Note: You might need to run this manually in SQL editor if CLI permissions are restricted for storage ops
BEGIN;
  -- Create bucket if not exists
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;
COMMIT;

-- Storage Policies
DO $$ 
BEGIN
  -- Public select
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view product images'
  ) THEN
    CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;

  -- Authenticated insert (In real prod, ideally restrict to admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can upload product images'
  ) THEN
    CREATE POLICY "Anyone can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;

  -- Authenticated update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can update product images'
  ) THEN
    CREATE POLICY "Anyone can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
  END IF;

  -- Authenticated delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can delete product images'
  ) THEN
    CREATE POLICY "Anyone can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
  END IF;
END $$;
