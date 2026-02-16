-- Migration: 0005_create_product_materials_table
-- Description: Creates the product_materials junction table (many-to-many) with detailed pricing and inventory.

CREATE TABLE IF NOT EXISTS product_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  
  -- Pricing per material
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= price), 
  cost_price DECIMAL(10, 2) CHECK (cost_price >= 0), 
  
  -- Inventory per material
  inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Material-specific details
  finish VARCHAR(100), 
  weight_adjustment DECIMAL(10, 2), 
  
  is_available BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, material_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON product_materials(product_id);
CREATE INDEX IF NOT EXISTS idx_product_materials_material_id ON product_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_product_materials_price ON product_materials(price);
CREATE INDEX IF NOT EXISTS idx_product_materials_available ON product_materials(is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_materials_low_stock ON product_materials(inventory_quantity, low_stock_threshold) 
  WHERE inventory_quantity <= low_stock_threshold;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_product_materials_updated_at ON product_materials;
CREATE TRIGGER update_product_materials_updated_at
  BEFORE UPDATE ON product_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE product_materials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can select product_materials" ON product_materials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product_materials" ON product_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_materials" ON product_materials FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_materials" ON product_materials FOR DELETE USING (true);
