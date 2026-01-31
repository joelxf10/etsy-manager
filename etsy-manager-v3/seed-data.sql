-- SEED DATA FOR ETSY MANAGER
-- Run this AFTER schema-v3.sql

-- Insert your store
INSERT INTO stores (name, code, owner, status) VALUES
('UMER - N - BS - UK - S01', 'UMERNBSS01', 'Umer', 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert products
INSERT INTO products (gp_id, name, canonical_1688_link, status, notes) VALUES
('GP-000001', 'Maternity Dress', NULL, 'active', 'Image-based sourcing'),
('GP-000002', 'Off Shoulder Dress', 'https://detail.1688.com/offer/657218869416.html', 'active', NULL),
('GP-000003', 'Casual Maxi Dress', NULL, 'active', 'Image-based sourcing'),
('GP-000004', 'French Fairy Lace Dress', NULL, 'active', 'Image-based sourcing'),
('GP-000005', 'Summer Floral Dress', NULL, 'active', 'Image-based sourcing'),
('GP-000006', 'Elegant Evening Dress', NULL, 'active', 'Image-based sourcing'),
('GP-000007', 'Soft Maternity Nursing Dress', NULL, 'active', 'Image-based sourcing')
ON CONFLICT (gp_id) DO NOTHING;

-- Insert all variants for GP-000001 (sizes S, M, L, XL)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000001-V01', NULL, 'S', NULL, 'S', 8.50, 2.50),
  ('GP-000001-V02', NULL, 'M', NULL, 'M', 8.50, 2.50),
  ('GP-000001-V03', NULL, 'L', NULL, 'L', 8.50, 2.50),
  ('GP-000001-V04', NULL, 'XL', NULL, 'XL', 9.00, 2.50),
  ('GP-000001-V05', NULL, 'XXL', NULL, 'XXL', 9.50, 2.50)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000001'
ON CONFLICT (var_id) DO NOTHING;

-- Insert variants for GP-000002 (colors: Black, White, Pink, Blue, Red)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000002-V01', 'Black Off Shoulder', 'One Size', 'Black Off Shoulder', 'One Size', 12.00, 3.00),
  ('GP-000002-V02', 'White Off Shoulder', 'One Size', 'White Off Shoulder', 'One Size', 12.00, 3.00),
  ('GP-000002-V03', 'Pink Off Shoulder', 'One Size', 'Pink Off Shoulder', 'One Size', 12.00, 3.00),
  ('GP-000002-V04', 'Blue Off Shoulder', 'One Size', 'Blue Off Shoulder', 'One Size', 12.00, 3.00),
  ('GP-000002-V05', 'Red Off Shoulder', 'One Size', 'Red Off Shoulder', 'One Size', 12.00, 3.00)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000002'
ON CONFLICT (var_id) DO NOTHING;

-- Insert variants for GP-000003 (colors with sizes)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000003-V01', 'Black', 'S', 'Black', 'S', 10.00, 2.80),
  ('GP-000003-V02', 'Black', 'M', 'Black', 'M', 10.00, 2.80),
  ('GP-000003-V03', 'Black', 'L', 'Black', 'L', 10.00, 2.80),
  ('GP-000003-V04', 'Black', 'XL', 'Black', 'XL', 10.50, 2.80),
  ('GP-000003-V05', 'Navy', 'S', 'Navy', 'S', 10.00, 2.80),
  ('GP-000003-V06', 'Navy', 'M', 'Navy', 'M', 10.00, 2.80),
  ('GP-000003-V07', 'Navy', 'L', 'Navy', 'L', 10.00, 2.80),
  ('GP-000003-V08', 'Navy', 'XL', 'Navy', 'XL', 10.50, 2.80),
  ('GP-000003-V09', 'Burgundy', 'S', 'Burgundy', 'S', 10.00, 2.80),
  ('GP-000003-V10', 'Burgundy', 'M', 'Burgundy', 'M', 10.00, 2.80),
  ('GP-000003-V11', 'Burgundy', 'L', 'Burgundy', 'L', 10.00, 2.80),
  ('GP-000003-V12', 'Burgundy', 'XL', 'Burgundy', 'XL', 10.50, 2.80)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000003'
ON CONFLICT (var_id) DO NOTHING;

-- Insert variants for GP-000004 (Full Set, Dress, Coat types with sizes)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000004-V01', 'Full Set', 'S', 'Full set', 'S', 15.00, 3.50),
  ('GP-000004-V02', 'Full Set', 'M', 'Full set', 'M', 15.00, 3.50),
  ('GP-000004-V03', 'Full Set', 'L', 'Full set', 'L', 15.00, 3.50),
  ('GP-000004-V04', 'Full Set', 'XL', 'Full set', 'XL', 15.50, 3.50),
  ('GP-000004-V05', 'Dress', 'S', 'Dress', 'S', 10.00, 3.00),
  ('GP-000004-V06', 'Dress', 'M', 'Dress', 'M', 10.00, 3.00),
  ('GP-000004-V07', 'Dress', 'L', 'Dress', 'L', 10.00, 3.00),
  ('GP-000004-V08', 'Dress', 'XL', 'Dress', 'XL', 10.50, 3.00),
  ('GP-000004-V09', 'Coat', 'S', 'Coat', 'S', 8.00, 2.50),
  ('GP-000004-V10', 'Coat', 'M', 'Coat', 'M', 8.00, 2.50),
  ('GP-000004-V11', 'Coat', 'L', 'Coat', 'L', 8.00, 2.50),
  ('GP-000004-V12', 'Coat', 'XL', 'Coat', 'XL', 8.50, 2.50)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000004'
ON CONFLICT (var_id) DO NOTHING;

-- Insert variants for GP-000005 (Floral patterns with sizes)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000005-V01', 'Floral Blue', 'S', 'Floral Blue', 'S', 11.00, 2.80),
  ('GP-000005-V02', 'Floral Blue', 'M', 'Floral Blue', 'M', 11.00, 2.80),
  ('GP-000005-V03', 'Floral Blue', 'L', 'Floral Blue', 'L', 11.00, 2.80),
  ('GP-000005-V04', 'Floral Blue', 'XL', 'Floral Blue', 'XL', 11.50, 2.80),
  ('GP-000005-V05', 'Floral Pink', 'S', 'Floral Pink', 'S', 11.00, 2.80),
  ('GP-000005-V06', 'Floral Pink', 'M', 'Floral Pink', 'M', 11.00, 2.80),
  ('GP-000005-V07', 'Floral Pink', 'L', 'Floral Pink', 'L', 11.00, 2.80),
  ('GP-000005-V08', 'Floral Pink', 'XL', 'Floral Pink', 'XL', 11.50, 2.80),
  ('GP-000005-V09', 'Floral Yellow', 'S', 'Floral Yellow', 'S', 11.00, 2.80),
  ('GP-000005-V10', 'Floral Yellow', 'M', 'Floral Yellow', 'M', 11.00, 2.80),
  ('GP-000005-V11', 'Floral Yellow', 'L', 'Floral Yellow', 'L', 11.00, 2.80),
  ('GP-000005-V12', 'Floral Yellow', 'XL', 'Floral Yellow', 'XL', 11.50, 2.80)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000005'
ON CONFLICT (var_id) DO NOTHING;

-- Insert variants for GP-000006 (Elegant colors with sizes)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000006-V01', 'Black', 'S', 'Black', 'S', 14.00, 3.20),
  ('GP-000006-V02', 'Black', 'M', 'Black', 'M', 14.00, 3.20),
  ('GP-000006-V03', 'Black', 'L', 'Black', 'L', 14.00, 3.20),
  ('GP-000006-V04', 'Black', 'XL', 'Black', 'XL', 14.50, 3.20),
  ('GP-000006-V05', 'Wine Red', 'S', 'Wine Red', 'S', 14.00, 3.20),
  ('GP-000006-V06', 'Wine Red', 'M', 'Wine Red', 'M', 14.00, 3.20),
  ('GP-000006-V07', 'Wine Red', 'L', 'Wine Red', 'L', 14.00, 3.20),
  ('GP-000006-V08', 'Wine Red', 'XL', 'Wine Red', 'XL', 14.50, 3.20),
  ('GP-000006-V09', 'Navy Blue', 'S', 'Navy Blue', 'S', 14.00, 3.20),
  ('GP-000006-V10', 'Navy Blue', 'M', 'Navy Blue', 'M', 14.00, 3.20),
  ('GP-000006-V11', 'Navy Blue', 'L', 'Navy Blue', 'L', 14.00, 3.20),
  ('GP-000006-V12', 'Navy Blue', 'XL', 'Navy Blue', 'XL', 14.50, 3.20),
  ('GP-000006-V13', 'Champagne', 'S', 'Champagne', 'S', 14.00, 3.20),
  ('GP-000006-V14', 'Champagne', 'M', 'Champagne', 'M', 14.00, 3.20),
  ('GP-000006-V15', 'Champagne', 'L', 'Champagne', 'L', 14.00, 3.20),
  ('GP-000006-V16', 'Champagne', 'XL', 'Champagne', 'XL', 14.50, 3.20)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000006'
ON CONFLICT (var_id) DO NOTHING;

-- Insert variants for GP-000007 (Nursing dress colors with sizes)
INSERT INTO variants (var_id, product_id, etsy_color, etsy_size, supplier_variation_name, supplier_size_name, last_cost_usd, last_shipping_usd)
SELECT v.var_id, p.id, v.color, v.size, v.sup_var, v.sup_size, v.cost, v.ship
FROM (VALUES
  ('GP-000007-V01', 'Pink', 'S', 'Pink', 'S', 9.00, 2.50),
  ('GP-000007-V02', 'Pink', 'M', 'Pink', 'M', 9.00, 2.50),
  ('GP-000007-V03', 'Pink', 'L', 'Pink', 'L', 9.00, 2.50),
  ('GP-000007-V04', 'Pink', 'XL', 'Pink', 'XL', 9.50, 2.50),
  ('GP-000007-V05', 'Blue', 'S', 'Blue', 'S', 9.00, 2.50),
  ('GP-000007-V06', 'Blue', 'M', 'Blue', 'M', 9.00, 2.50),
  ('GP-000007-V07', 'Blue', 'L', 'Blue', 'L', 9.00, 2.50),
  ('GP-000007-V08', 'Blue', 'XL', 'Blue', 'XL', 9.50, 2.50),
  ('GP-000007-V09', 'Gray', 'S', 'Gray', 'S', 9.00, 2.50),
  ('GP-000007-V10', 'Gray', 'M', 'Gray', 'M', 9.00, 2.50),
  ('GP-000007-V11', 'Gray', 'L', 'Gray', 'L', 9.00, 2.50),
  ('GP-000007-V12', 'Gray', 'XL', 'Gray', 'XL', 9.50, 2.50),
  ('GP-000007-V13', 'Beige', 'S', 'Beige', 'S', 9.00, 2.50),
  ('GP-000007-V14', 'Beige', 'M', 'Beige', 'M', 9.00, 2.50),
  ('GP-000007-V15', 'Beige', 'L', 'Beige', 'L', 9.00, 2.50),
  ('GP-000007-V16', 'Beige', 'XL', 'Beige', 'XL', 9.50, 2.50)
) AS v(var_id, color, size, sup_var, sup_size, cost, ship)
CROSS JOIN products p WHERE p.gp_id = 'GP-000007'
ON CONFLICT (var_id) DO NOTHING;

-- Insert SKU mappings
INSERT INTO store_skus (store_id, product_id, store_sku)
SELECT s.id, p.id, v.sku
FROM (VALUES
  ('UMERNBSS01-0001', 'GP-000007'),
  ('UMERNBSS01-0002', 'GP-000006'),
  ('UMERNBSS01-0003', 'GP-000005'),
  ('UMERNBSS01-0004', 'GP-000004'),
  ('UMERNBSS01-0005', 'GP-000003'),
  ('UMERNBSS01-0006', 'GP-000002'),
  ('UMERNBSS01-0007', 'GP-000001')
) AS v(sku, gp_id)
CROSS JOIN stores s
CROSS JOIN products p
WHERE s.code = 'UMERNBSS01' AND p.gp_id = v.gp_id
ON CONFLICT DO NOTHING;

-- Insert sample orders (mix of resolved and cancelled)
INSERT INTO orders (order_number, order_line_id, platform, store_id, store_sku, etsy_order_id, etsy_color, etsy_size, qty, price_item, currency, resolved_gp_id, resolved_var_id, resolved_supplier_variation, resolved_cost_usd, resolved_shipping_usd, resolve_status, order_status, order_date)
SELECT 
  v.order_num, v.line_id, 'ETSY', s.id, v.sku, v.order_num, v.color, v.size, v.qty, v.price, 'GBP',
  v.gp_id, v.var_id, v.sup_var, v.cost, v.ship, 'OK', v.status, v.odate::date
FROM (VALUES
  ('3944350214', '4919415164', 'UMERNBSS01-0001', 'Pink', 'M', 1, 29.93, 'GP-000007', 'GP-000007-V02', 'Pink', 9.00, 2.50, 'OK', '2026-01-15'),
  ('3947325867', '4915640450', 'UMERNBSS01-0004', 'Full Set', 'M', 1, 44.89, 'GP-000004', 'GP-000004-V02', 'Full set', 15.00, 3.50, 'OK', '2026-01-12'),
  ('3950001111', '4920001111', 'UMERNBSS01-0001', 'Blue', 'L', 1, 29.93, 'GP-000007', 'GP-000007-V07', 'Blue', 9.00, 2.50, 'OK', '2026-01-18'),
  ('3950002222', '4920002222', 'UMERNBSS01-0004', 'Dress', 'S', 2, 34.89, 'GP-000004', 'GP-000004-V05', 'Dress', 10.00, 3.00, 'OK', '2026-01-19'),
  ('3951110001', '4921110001', 'UMERNBSS01-0001', 'Gray', 'M', 1, 29.93, 'GP-000007', 'GP-000007-V10', 'Gray', 9.00, 2.50, 'Cancelled', '2026-01-21'),
  ('3952220002', '4922220002', 'UMERNBSS01-0004', 'Coat', 'L', 1, 24.89, 'GP-000004', 'GP-000004-V11', 'Coat', 8.00, 2.50, 'Refunded', '2026-01-22'),
  ('3953330003', '4923330003', 'UMERNBSS01-0002', 'Black', 'XL', 1, 39.99, 'GP-000006', 'GP-000006-V04', 'Black', 14.50, 3.20, 'OK', '2026-01-23'),
  ('3954440004', '4924440004', 'UMERNBSS01-0003', 'Floral Pink', 'M', 1, 35.99, 'GP-000005', 'GP-000005-V06', 'Floral Pink', 11.00, 2.80, 'OK', '2026-01-24'),
  ('3951111111', '4921111111', 'UMERNBSS01-0006', 'White Off Shoulder', 'One Size', 1, 32.99, 'GP-000002', 'GP-000002-V02', 'White Off Shoulder', 12.00, 3.00, 'OK', '2026-01-25'),
  ('3952222222', '4922222222', 'UMERNBSS01-0007', NULL, 'L', 2, 27.99, 'GP-000001', 'GP-000001-V03', NULL, 8.50, 2.50, 'OK', '2026-01-26'),
  ('3953333333', '4923333333', 'UMERNBSS01-0005', 'Navy', 'M', 1, 33.99, 'GP-000003', 'GP-000003-V06', 'Navy', 10.00, 2.80, 'OK', '2026-01-27'),
  ('3954444444', '4924444444', 'UMERNBSS01-0001', 'Beige', 'S', 1, 29.93, 'GP-000007', 'GP-000007-V13', 'Beige', 9.00, 2.50, 'OK', '2026-01-28')
) AS v(order_num, line_id, sku, color, size, qty, price, gp_id, var_id, sup_var, cost, ship, status, odate)
CROSS JOIN stores s WHERE s.code = 'UMERNBSS01'
ON CONFLICT (etsy_order_id, order_line_id) DO NOTHING;
