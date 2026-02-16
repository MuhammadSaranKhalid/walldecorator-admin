-- Migration: 0001_initial_setup_and_enums
-- Description: Sets up UUID extension, helper functions, and ENUM types.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- Helper to safely create secrets (ignoring if they exist for idempotency in local dev, though verify constraint)
-- Note: Secrets should be set up manually or via secure deployment scripts, not in migrations
-- This is commented out to prevent hardcoded secrets in version control
-- DO $$
-- BEGIN
--     -- Only create if not exists (checked via name)
--     -- Service role key and other secrets should be configured via environment variables or Supabase dashboard
--     IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'process_image_api_url') THEN
--         PERFORM vault.create_secret('http://host.docker.internal:3000/api/process-images', 'process_image_api_url', 'URL for process-images Edge Function');
--     END IF;
-- END $$;

-- Create helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ENUMs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE public.order_status AS ENUM (
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customization_status') THEN
        CREATE TYPE public.customization_status AS ENUM (
          'pending',
          'in_review',
          'approved',
          'in_production',
          'completed',
          'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE public.product_status AS ENUM (
          'active',
          'inactive',
          'archived',
          'draft'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type') THEN
        CREATE TYPE public.address_type AS ENUM (
          'shipping',
          'billing',
          'both'
        );
    END IF;
END $$;
