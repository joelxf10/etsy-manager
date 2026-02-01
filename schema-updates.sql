-- Add missing columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS etsy_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create exchange_rates table for real-time currency conversion
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  base_currency TEXT DEFAULT 'USD',
  target_currency TEXT NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default rates (will be updated by API)
INSERT INTO exchange_rates (target_currency, rate) VALUES 
  ('GBP', 0.79),
  ('EUR', 0.92),
  ('AUD', 1.53),
  ('CAD', 1.36),
  ('CNY', 7.24)
ON CONFLICT DO NOTHING;

-- Create product_images table for storing downloaded images
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  stored_url TEXT, -- Supabase storage URL after download
  product_sku TEXT,
  variant_name TEXT,
  store_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, downloaded, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_images_original ON product_images(original_url);
CREATE INDEX IF NOT EXISTS idx_product_images_sku ON product_images(product_sku);
