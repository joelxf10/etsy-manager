-- ETSY MANAGER DATABASE SCHEMA V3
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'store_manager' CHECK (role IN ('admin', 'finance', 'store_manager', 'supplier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gp_id TEXT NOT NULL UNIQUE,
  name TEXT,
  canonical_1688_link TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VARIANTS TABLE
CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  var_id TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  etsy_color TEXT,
  etsy_size TEXT,
  supplier_variation_name TEXT,
  supplier_size_name TEXT,
  last_cost_usd DECIMAL(10, 2),
  last_shipping_usd DECIMAL(10, 2),
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STORE_SKUS TABLE
CREATE TABLE IF NOT EXISTS store_skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_sku TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, store_sku)
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL,
  order_line_id TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'ETSY',
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_sku TEXT NOT NULL,
  etsy_order_id TEXT,
  etsy_color TEXT,
  etsy_size TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  price_item DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  resolved_gp_id TEXT,
  resolved_var_id TEXT,
  resolved_supplier_variation TEXT,
  resolved_cost_usd DECIMAL(10, 2),
  resolved_shipping_usd DECIMAL(10, 2),
  resolve_status TEXT CHECK (resolve_status IN ('OK', 'Needs Fix')),
  order_status TEXT NOT NULL DEFAULT 'OK' CHECK (order_status IN ('OK', 'Cancelled', 'Refunded')),
  order_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(etsy_order_id, order_line_id)
);

-- EXCEPTIONS TABLE
CREATE TABLE IF NOT EXISTS exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_sku TEXT NOT NULL,
  issue TEXT NOT NULL,
  action_owner TEXT,
  fix_type TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolver TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FX_RATES TABLE
CREATE TABLE IF NOT EXISTS fx_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency TEXT NOT NULL UNIQUE,
  rate_to_usd DECIMAL(10, 6) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HELP_REQUESTS TABLE (for logging unanswered help questions)
CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_email TEXT NOT NULL,
  question TEXT NOT NULL,
  page TEXT NOT NULL,
  ai_response TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default FX rates
INSERT INTO fx_rates (currency, rate_to_usd) VALUES
  ('GBP', 1.2700),
  ('EUR', 1.0850),
  ('USD', 1.0000),
  ('CAD', 0.7400),
  ('AUD', 0.6500)
ON CONFLICT (currency) DO UPDATE SET rate_to_usd = EXCLUDED.rate_to_usd;

-- ROW LEVEL SECURITY - Allow all authenticated users for now
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- Simple policies - authenticated users can do everything
CREATE POLICY "auth_users" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_stores" ON stores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_variants" ON variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_store_skus" ON store_skus FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_exceptions" ON exceptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_fx_rates" ON fx_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_help_requests" ON help_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_resolve_status ON orders(resolve_status);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_store_skus_store_id ON store_skus(store_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_resolved ON exceptions(resolved);
CREATE INDEX IF NOT EXISTS idx_help_requests_resolved ON help_requests(resolved);
