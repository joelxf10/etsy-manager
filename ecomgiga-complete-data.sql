-- ECOMGIGA COMPLETE DATA SEED
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_categories DISABLE ROW LEVEL SECURITY;

-- Clear existing data
TRUNCATE stores, users, orders, products, help_requests, screenshots, costs, cost_categories CASCADE;

-- ==================== EMPLOYEES (24 total) ====================

-- eBay Team (16)
INSERT INTO users (email, name, role, platform, is_active) VALUES
('amna.siddique@ecomgiga.com', 'Amna Siddique (2)', 'listing', 'ebay', true),
('shaiza.shah@ecomgiga.com', 'Shaiza Shah', 'listing', 'ebay', true),
('shahzaib.hassan@ecomgiga.com', 'Syed Shahzaib Hassan', 'listing', 'ebay', true),
('saba.bibi@ecomgiga.com', 'Saba Bibi', 'listing', 'ebay', true),
('muhammad.mujtaba@ecomgiga.com', 'Muhammad Mujtaba', 'listing', 'ebay', true),
('farwa.mohsin@ecomgiga.com', 'Um E Farwa Mohsin', 'listing', 'ebay', true),
('hamas.kashan@ecomgiga.com', 'Muhammad Hamas Kashan', 'listing', 'ebay', true),
('reyan.zafar@ecomgiga.com', 'Mohammad Reyan Zafar', 'listing', 'ebay', true),
('faisal.habib@ecomgiga.com', 'Syed Faisal Habib', 'listing', 'ebay', true),
('alisha.imran@ecomgiga.com', 'Alisha Imran', 'listing', 'ebay', true),
('muhammad.sheraz@ecomgiga.com', 'Muhammad Sheraz', 'listing', 'ebay', true),
('ansar.abbas@ecomgiga.com', 'Ansar Abbas', 'listing', 'ebay', true),
('abdul.samad@ecomgiga.com', 'Abdul Samad', 'csr', 'ebay', true),
('abdul.ahad@ecomgiga.com', 'Abdul Ahad', 'hunter', 'ebay', true),
('rabeela.mansoor@ecomgiga.com', 'Rabeela Mansoor', 'hr', 'ebay', true),
('admin@ecomgiga.com', 'Admin User', 'admin', 'both', true);

-- Etsy Team (8)
INSERT INTO users (email, name, role, platform, is_active) VALUES
('arzoo.zahra@ecomgiga.com', 'Arzoo Zahra', 'graphic', 'etsy', true),
('tehreem.usman@ecomgiga.com', 'Tehreem Usman', 'graphic', 'etsy', true),
('ensha.haq@ecomgiga.com', 'Ensha-ul-Haq', 'graphic', 'etsy', true),
('areeba.nasir@ecomgiga.com', 'Areeba Nasir', 'graphic', 'etsy', true),
('maira.khatoon@ecomgiga.com', 'Maira Khatoon', 'graphic', 'etsy', true),
('sadia.ali@ecomgiga.com', 'Sadia Ali', 'listing', 'etsy', true),
('shahzaib.etsy@ecomgiga.com', 'Shahzaib', 'listing', 'etsy', true),
('hamza.iftikhar@ecomgiga.com', 'Hamza Iftikhar', 'manager', 'etsy', true);

-- ==================== ETSY STORES (36) ====================
INSERT INTO stores (name, platform, owner, country, is_active) VALUES
-- UK stores
('Naseer-BL-UK-S01', 'etsy', 'Naseer', 'UK', true),
('Rahil-WR-UK-S02', 'etsy', 'Rahil', 'UK', true),
('Joel-LS-UK-S03', 'etsy', 'Joel', 'UK', true),
('RAZA-N-B-UK-S01', 'etsy', 'Raza', 'UK', true),
('SAINT-VB-UK-S06', 'etsy', 'Saint', 'UK', true),
('RAHIL-EW-UK-S07', 'etsy', 'Rahil', 'UK', true),
('SAINT-KT-UK-S01', 'etsy', 'Saint', 'UK', true),
('Naseem-UK-SP-S01', 'etsy', 'Naseem', 'UK', true),
('SHAMAS-PT-NASEER-S01', 'etsy', 'Shamas', 'UK', true),
('Ans-UK-S01', 'etsy', 'Ans', 'UK', true),
('Shams-UK-S01', 'etsy', 'Shams', 'UK', true),
('Jawad-UK-S01', 'etsy', 'Jawad', 'UK', true),
('Hamza-UK-S01', 'etsy', 'Hamza', 'UK', true),
('Abdullah-UK-S01', 'etsy', 'Abdullah', 'UK', true),
('RAHIL-CPS-S01', 'etsy', 'Rahil', 'UK', true),
('Joel-LF-Orevix-S011', 'etsy', 'Joel', 'UK', true),
('Joel-JW-Orevix-S05', 'etsy', 'Joel', 'UK', true),
-- Italy stores
('Adam-CSM-IT-S05', 'etsy', 'Adam', 'Italy', true),
('ADAM-SM-IT-S09', 'etsy', 'Adam', 'Italy', true),
('ADAM-CD-IT-S07', 'etsy', 'Adam', 'Italy', true),
('ADAM-CI-IT-S01', 'etsy', 'Adam', 'Italy', true),
('ADAM-VL-IT-S08', 'etsy', 'Adam', 'Italy', true),
('ADAM-LGS-IT-S06', 'etsy', 'Adam', 'Italy', true),
('ADAM-OV-IT-S02', 'etsy', 'Adam', 'Italy', true),
-- USA stores
('HASSAN-ZF-USA-S01', 'etsy', 'Hassan', 'USA', true),
('NEASHA-USA-S01', 'etsy', 'Neasha', 'USA', true),
('Venkit-USA-S01', 'etsy', 'Venkit', 'USA', true),
-- Australia stores
('James-AUS-S01', 'etsy', 'James', 'Australia', true),
('Imran-AUS-S01', 'etsy', 'Imran', 'Australia', true),
-- Other stores
('MARYAM-S01', 'etsy', 'Maryam', 'UK', true),
('FARHAN-S01', 'etsy', 'Farhan', 'UK', true),
('TAHIR-S01', 'etsy', 'Tahir', 'UK', true),
('MEHROOZ-S01', 'etsy', 'Mehrooz', 'UK', true),
('NOMAN-S01', 'etsy', 'Noman', 'UK', true),
('EMMANUEL-S01', 'etsy', 'Emmanuel', 'UK', true),
('PRINCE-S01', 'etsy', 'Prince', 'UK', true);

-- ==================== EBAY STORES (42) ====================
INSERT INTO stores (name, platform, owner, country, is_active) VALUES
('PAUL', 'ebay', 'Paul', 'UK', true),
('AYESHA', 'ebay', 'Ayesha', 'UK', true),
('KASHIF-3', 'ebay', 'Kashif', 'UK', true),
('JEREMY', 'ebay', 'Jeremy', 'UK', true),
('TARIQ', 'ebay', 'Tariq', 'UK', true),
('ZOHAIB', 'ebay', 'Zohaib', 'UK', true),
('KASHIF-1', 'ebay', 'Kashif', 'UK', true),
('QASIM', 'ebay', 'Qasim', 'UK', true),
('JAVED', 'ebay', 'Javed', 'UK', true),
('SARA', 'ebay', 'Sara', 'UK', true),
('SHEZA', 'ebay', 'Sheza', 'UK', true),
('KHIZAR', 'ebay', 'Khizar', 'UK', true),
('HAJIRA', 'ebay', 'Hajira', 'UK', true),
('MADIHA-2', 'ebay', 'Madiha', 'UK', true),
('HAROON', 'ebay', 'Haroon', 'UK', true),
('ADAM', 'ebay', 'Adam', 'UK', true),
('HAYAT', 'ebay', 'Hayat', 'UK', true),
('NASEEM-UK', 'ebay', 'Naseem', 'UK', true),
('SAINT-3', 'ebay', 'Saint', 'UK', true),
('ADAM-3', 'ebay', 'Adam', 'UK', true),
('ANS-UK', 'ebay', 'Ans', 'UK', true),
('JOEL', 'ebay', 'Joel', 'UK', true),
('PRINCE', 'ebay', 'Prince', 'UK', true),
('RAHIL-03', 'ebay', 'Rahil', 'UK', true),
('SAINT-01', 'ebay', 'Saint', 'UK', true),
('SAINT-02', 'ebay', 'Saint', 'UK', true),
('VENKIT-USA', 'ebay', 'Venkit', 'USA', true),
('MARYAM', 'ebay', 'Maryam', 'UK', true),
('FARHAN', 'ebay', 'Farhan', 'UK', true),
('TAHIR', 'ebay', 'Tahir', 'UK', true),
('RAZA', 'ebay', 'Raza', 'UK', true),
('MEHROOZ', 'ebay', 'Mehrooz', 'UK', true),
('NOMAN', 'ebay', 'Noman', 'UK', true),
('EMMANUEL', 'ebay', 'Emmanuel', 'UK', true),
('EHTISHAM', 'ebay', 'Ehtisham', 'UK', true),
('SHAMS-UK', 'ebay', 'Shams', 'UK', true),
('JAWAD-UK', 'ebay', 'Jawad', 'UK', true),
('HAMZA-UK', 'ebay', 'Hamza', 'UK', true),
('JAMES-AUS', 'ebay', 'James', 'Australia', true),
('IMRAN-AUS', 'ebay', 'Imran', 'Australia', true),
('ABDULLAH-UK', 'ebay', 'Abdullah', 'UK', true),
('AYAZ-EBAY-UK', 'ebay', 'Ayaz', 'UK', true);

-- ==================== COST CATEGORIES ====================
INSERT INTO cost_categories (name, type, description) VALUES
('Subscriptions', 'company_wide', 'Software subscriptions'),
('Rent', 'company_wide', 'Office rent'),
('Salaries', 'company_wide', 'Employee salaries'),
('Proxies', 'per_store', 'Proxy costs'),
('Advertising', 'per_store', 'Ads and promotion'),
('Platform Fees', 'per_platform', 'Etsy/eBay fees'),
('Tools', 'company_wide', 'Software tools'),
('Internet', 'company_wide', 'Internet bills');

-- ==================== SAMPLE COSTS ====================
INSERT INTO costs (category_id, description, amount, is_recurring, recurrence_period, cost_date)
SELECT id, 'Claude AI Pro', 20.00, true, 'monthly', CURRENT_DATE FROM cost_categories WHERE name = 'Subscriptions' LIMIT 1;

INSERT INTO costs (category_id, description, amount, is_recurring, recurrence_period, cost_date)
SELECT id, 'Vercel Pro', 20.00, true, 'monthly', CURRENT_DATE FROM cost_categories WHERE name = 'Subscriptions' LIMIT 1;

INSERT INTO costs (category_id, description, amount, is_recurring, recurrence_period, cost_date)
SELECT id, 'Supabase Pro', 25.00, true, 'monthly', CURRENT_DATE FROM cost_categories WHERE name = 'Subscriptions' LIMIT 1;

INSERT INTO costs (category_id, description, amount, is_recurring, recurrence_period, cost_date)
SELECT id, 'Office Rent - January', 500.00, true, 'monthly', CURRENT_DATE FROM cost_categories WHERE name = 'Rent' LIMIT 1;

INSERT INTO costs (category_id, description, amount, is_recurring, recurrence_period, cost_date)
SELECT id, 'Internet Bill', 50.00, true, 'monthly', CURRENT_DATE FROM cost_categories WHERE name = 'Internet' LIMIT 1;

-- ==================== SAMPLE ORDERS (Etsy) ====================
INSERT INTO orders (store_id, platform_order_id, customer_name, shipping_country, status, total, order_date)
SELECT id, 'ETSY-' || floor(random()*900000+100000)::text,
  (ARRAY['John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis', 'James Miller', 'Emily Johnson', 'David Lee', 'Sophie Clark', 'Oliver Taylor', 'Isabella Moore'])[floor(random()*10+1)],
  (ARRAY['UK', 'USA', 'Australia', 'Canada', 'Germany', 'France', 'Italy'])[floor(random()*7+1)],
  (ARRAY['pending', 'processing', 'shipped', 'delivered'])[floor(random()*4+1)]::order_status,
  round((random()*150+20)::numeric, 2),
  NOW() - (random()*30 || ' days')::interval
FROM stores WHERE platform = 'etsy';

-- Add more Etsy orders
INSERT INTO orders (store_id, platform_order_id, customer_name, shipping_country, status, total, order_date)
SELECT id, 'ETSY-' || floor(random()*900000+100000)::text,
  (ARRAY['William Anderson', 'Charlotte Thomas', 'Henry Jackson', 'Amelia White', 'Benjamin Harris'])[floor(random()*5+1)],
  (ARRAY['UK', 'USA', 'Germany'])[floor(random()*3+1)],
  (ARRAY['pending', 'processing', 'shipped', 'delivered'])[floor(random()*4+1)]::order_status,
  round((random()*200+30)::numeric, 2),
  NOW() - (random()*30 || ' days')::interval
FROM stores WHERE platform = 'etsy';

-- ==================== SAMPLE ORDERS (eBay) ====================
INSERT INTO orders (store_id, platform_order_id, customer_name, shipping_country, status, total, order_date)
SELECT id, 'EBAY-' || floor(random()*900000+100000)::text,
  (ARRAY['Tom Harris', 'Lucy White', 'Jack Thompson', 'Olivia Martin', 'Harry Wilson', 'Amelia Taylor', 'George Brown', 'Isla Davies', 'Noah Evans', 'Mia Roberts'])[floor(random()*10+1)],
  (ARRAY['UK', 'USA', 'Italy', 'France', 'Spain', 'Australia'])[floor(random()*6+1)],
  (ARRAY['pending', 'processing', 'shipped', 'delivered'])[floor(random()*4+1)]::order_status,
  round((random()*200+25)::numeric, 2),
  NOW() - (random()*30 || ' days')::interval
FROM stores WHERE platform = 'ebay';

-- Add more eBay orders
INSERT INTO orders (store_id, platform_order_id, customer_name, shipping_country, status, total, order_date)
SELECT id, 'EBAY-' || floor(random()*900000+100000)::text,
  (ARRAY['Oscar Wright', 'Grace King', 'Leo Scott', 'Freya Green', 'Arthur Baker'])[floor(random()*5+1)],
  (ARRAY['UK', 'USA'])[floor(random()*2+1)],
  (ARRAY['pending', 'processing', 'shipped', 'delivered'])[floor(random()*4+1)]::order_status,
  round((random()*250+40)::numeric, 2),
  NOW() - (random()*30 || ' days')::interval
FROM stores WHERE platform = 'ebay';

-- ==================== SAMPLE PRODUCTS ====================
INSERT INTO products (store_id, title, description, base_price, supplier_price, supplier_url)
SELECT id, 'Vintage Wall Art Print', 'Beautiful vintage-style wall art', 29.99, 8.50, 'https://1688.com/item/123'
FROM stores WHERE platform = 'etsy' LIMIT 10;

INSERT INTO products (store_id, title, description, base_price, supplier_price, supplier_url)
SELECT id, 'Custom Name Necklace', 'Personalized name necklace in gold', 45.00, 12.00, 'https://aliexpress.com/item/456'
FROM stores WHERE platform = 'etsy' LIMIT 10;

INSERT INTO products (store_id, title, description, base_price, supplier_price, supplier_url)
SELECT id, 'Phone Case Premium', 'Premium quality phone case', 19.99, 4.50, 'https://1688.com/item/789'
FROM stores WHERE platform = 'ebay' LIMIT 10;

-- ==================== SAMPLE HELP REQUESTS ====================
INSERT INTO help_requests (user_id, subject, description, status, priority, created_at)
SELECT id, 'Order stuck in processing', 'Customer #12345 asking for shipping update. Order placed 5 days ago.', 'open', 2, NOW() - interval '2 days'
FROM users WHERE role = 'listing' LIMIT 1;

INSERT INTO help_requests (user_id, subject, description, status, priority, created_at)
SELECT id, 'Need product images', 'Missing high-res images for new listing batch', 'in_progress', 1, NOW() - interval '1 day'
FROM users WHERE role = 'graphic' LIMIT 1;

INSERT INTO help_requests (user_id, subject, description, status, priority, created_at)
SELECT id, 'Return request help', 'Customer wants full refund, item not as described claim', 'open', 3, NOW() - interval '3 hours'
FROM users WHERE role = 'csr' LIMIT 1;

INSERT INTO help_requests (user_id, subject, description, status, priority, created_at)
SELECT id, 'Supplier issue', 'Main supplier out of stock for top selling item', 'open', 3, NOW() - interval '1 hour'
FROM users WHERE role = 'hunter' LIMIT 1;

INSERT INTO help_requests (user_id, subject, description, status, priority, created_at)
SELECT id, 'Access request', 'Need access to new store dashboard', 'resolved', 1, NOW() - interval '5 days'
FROM users WHERE role = 'listing' LIMIT 1;

-- ==================== SAMPLE SCREENSHOTS ====================
INSERT INTO screenshots (store_id, uploaded_by, image_url, screenshot_date, active_listings, total_sales, orders_count, notes)
SELECT s.id, u.id, 'screenshot.png', CURRENT_DATE, 
  floor(random()*500+50)::int,
  round((random()*5000+500)::numeric, 2),
  floor(random()*50+5)::int,
  'Daily snapshot'
FROM stores s, users u
WHERE s.platform = 'ebay' AND u.role = 'admin'
LIMIT 10;

-- Done!
SELECT 'Data seeded successfully!' as message;
SELECT COUNT(*) as total_stores FROM stores;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_orders FROM orders;
