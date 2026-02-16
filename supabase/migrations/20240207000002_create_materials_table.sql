-- Migration: 0002_create_materials_table
-- Description: Creates the materials table with RLS and indexes.

CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Material properties
  base_price_multiplier DECIMAL(5, 2) DEFAULT 1.0, 
  density DECIMAL(10, 2), 
  image_url TEXT,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  color_hex VARCHAR(7), 
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_materials_slug ON materials(slug);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_materials_display_order ON materials(display_order);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Policies (Development: Allow access to everyone for now, to be locked down later based on roles)
-- Using strict RLS best practices would require specific roles, but for initial dev we often start open or with anon read.
-- Per plan, we'll keep it open for development but document the need for role-based policies.

CREATE POLICY "Anyone can select materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert materials" ON materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update materials" ON materials FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete materials" ON materials FOR DELETE USING (true);
