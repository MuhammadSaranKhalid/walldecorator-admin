-- Migration: 0009_create_customization_requests
-- Description: Creates customization_requests table for custom orders.

CREATE TABLE IF NOT EXISTS customization_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  email VARCHAR(255) NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  reference_files TEXT[], -- Array of file URLs
  
  status customization_status DEFAULT 'pending',
  
  -- Admin response
  admin_note TEXT,
  estimated_price DECIMAL(10, 2),
  estimated_delivery_days INTEGER,
  
  -- If converted to order
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customization_requests_customer_id ON customization_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_customization_requests_email ON customization_requests(email);
CREATE INDEX IF NOT EXISTS idx_customization_requests_material_id ON customization_requests(material_id);
CREATE INDEX IF NOT EXISTS idx_customization_requests_status ON customization_requests(status);
CREATE INDEX IF NOT EXISTS idx_customization_requests_created_at ON customization_requests(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_customization_requests_updated_at ON customization_requests;
CREATE TRIGGER update_customization_requests_updated_at
  BEFORE UPDATE ON customization_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE customization_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can select customization_requests" ON customization_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert customization_requests" ON customization_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update customization_requests" ON customization_requests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete customization_requests" ON customization_requests FOR DELETE USING (true);
