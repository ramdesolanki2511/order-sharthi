-- ============================================================================
-- OrderSaathi Production Seed Data
-- Business Hub: Ring Road Textile Market, Surat, Gujarat
-- Currency: INR (₹) | Default Language: Gujarati / Hindi / English
-- ============================================================================

-- 1. Create Demo User Profile
INSERT INTO public.profiles (id, email, full_name, phone, preferred_language)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'rajesh.patel@ambikatextiles.in',
    'Rajeshbhai Patel',
    '+91 98250 12345',
    'gu'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Business: Ambika Textiles & Garments
INSERT INTO public.businesses (
    id, name, owner_id, business_category, gstin, phone, whatsapp_number,
    address_line1, address_line2, city, state, pincode, allow_backorders,
    invoice_prefix, order_prefix
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Ambika Textiles & Garments',
    '00000000-0000-0000-0000-000000000001',
    'textile_wholesale',
    '24AAACA1234A1Z5',
    '+91 98250 12345',
    '+91 98250 12345',
    'Shop No. 204, Ring Road New Textile Market',
    'Near Sahara Darwaja',
    'Surat',
    'Gujarat',
    '395002',
    false,
    'INV',
    'OS'
) ON CONFLICT (id) DO NOTHING;

-- 3. Business Member Assignment (Owner)
INSERT INTO public.business_members (business_id, user_id, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'owner'
) ON CONFLICT (business_id, user_id) DO NOTHING;

-- 4. Subscription (Pro Plan 14-day Active Trial)
INSERT INTO public.subscriptions (
    business_id, plan_tier, status, monthly_price,
    trial_ends_at, current_period_start, current_period_end,
    max_orders_per_month, max_staff_members, ai_features_enabled
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'pro',
    'active',
    999.00,
    NOW() + INTERVAL '12 days',
    NOW(),
    NOW() + INTERVAL '30 days',
    500,
    5,
    true
) ON CONFLICT DO NOTHING;

-- 5. Product Categories
INSERT INTO public.product_categories (id, business_id, name, description)
VALUES 
('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111111', 'Kurtis & Tunics', 'Stitched Rayon, Cotton, Silk kurtis and sets'),
('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111111', 'Sarees', 'Bandhani, Georgette, Kanjivaram and Chiffon sarees'),
('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111111', 'Fabrics & Rolls', 'Raw unstitched Cotton, Rayon, and Denim rolls'),
('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111111', 'Men Ethnic', 'Linen and Silk Kurta Pajama wholesale sets')
ON CONFLICT (id) DO NOTHING;

-- 6. Products
INSERT INTO public.products (
    id, business_id, category_id, name, sku, unit,
    cost_price, selling_price, tax_rate, stock_quantity, min_stock_alert, aliases
) VALUES 
(
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222001',
    'Rayon Anarkali Kurti Blue',
    'KURTI-RAY-BLU',
    'pcs',
    280.00,
    450.00,
    5.00,
    140.00,
    25.00,
    ARRAY['blue anarkali', 'blue kurti', 'rayon blue']
),
(
    '33333333-3333-3333-3333-333333333002',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222002',
    'Pure Cotton Bandhani Saree Maroon',
    'SAR-BAN-MAR',
    'pcs',
    520.00,
    850.00,
    5.00,
    85.00,
    15.00,
    ARRAY['cotton bandhani', 'maroon saree', 'bandhani maroon']
),
(
    '33333333-3333-3333-3333-333333333003',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222002',
    'Heavy Georgette Dupatta Gold Work',
    'DUP-GEO-GLD',
    'pcs',
    160.00,
    290.00,
    5.00,
    8.00, -- Low stock alert trigger
    20.00,
    ARRAY['gold dupatta', 'georgette dupatta', 'heavy dupatta']
),
(
    '33333333-3333-3333-3333-333333333004',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222004',
    'Men Linen Kurta Pajama Set White',
    'MEN-LIN-WHT',
    'sets',
    420.00,
    720.00,
    5.00,
    60.00,
    15.00,
    ARRAY['white kurta', 'men linen set', 'kurta pajama white']
),
(
    '33333333-3333-3333-3333-333333333005',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222003',
    'Premium Denim Fabric Roll (Dark Indigo)',
    'FAB-DEN-IND',
    'meters',
    110.00,
    175.00,
    5.00,
    550.00,
    100.00,
    ARRAY['denim roll', 'indigo denim', 'denim fabric']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Customers
INSERT INTO public.customers (
    id, business_id, name, business_name, phone, whatsapp_number,
    gstin, billing_address, city, state, credit_limit, payment_terms_days, current_balance
) VALUES 
(
    '44444444-4444-4444-4444-444444444001',
    '11111111-1111-1111-1111-111111111111',
    'Dineshbhai Patel',
    'Patel Traders Surat',
    '+91 98790 55443',
    '+91 98790 55443',
    '24AABCP1122C1ZR',
    'Plot 45, GIDC Industrial Estate, Sachin',
    'Surat',
    'Gujarat',
    250000.00,
    15,
    38450.00 -- Outstanding dues
),
(
    '44444444-4444-4444-4444-444444444002',
    '11111111-1111-1111-1111-111111111111',
    'Maheshbhai Shah',
    'Balaji Cloth Emporium',
    '+91 94260 77881',
    '+91 94260 77881',
    '24AAEFB5566D1ZX',
    'Shop 12, Ratanpole Kapda Bazaar',
    'Ahmedabad',
    'Gujarat',
    300000.00,
    21,
    62000.00
),
(
    '44444444-4444-4444-4444-444444444003',
    '11111111-1111-1111-1111-111111111111',
    'Pravinbhai Jadeja',
    'Krishna Sarees & Matching',
    '+91 97120 33449',
    '+91 97120 33449',
    '24AAGPK8899K1ZM',
    'Dharmendra Road, Near Palace Road',
    'Rajkot',
    'Gujarat',
    150000.00,
    15,
    14500.00
),
(
    '44444444-4444-4444-4444-444444444004',
    '11111111-1111-1111-1111-111111111111',
    'Anil Verma',
    'Shubh Garments Wholesale',
    '+91 98241 88992',
    '+91 98241 88992',
    '24AAKFS4433E1ZQ',
    'Mandvi Tower Road',
    'Vadodara',
    'Gujarat',
    200000.00,
    30,
    0.00
)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Orders
INSERT INTO public.orders (
    id, business_id, customer_id, order_number, status, payment_status,
    subtotal, discount_amount, tax_amount, shipping_charges, grand_total,
    amount_paid, balance_due, source, delivery_notes
) VALUES 
(
    '55555555-5555-5555-5555-555555555001',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444001',
    'OS-1024',
    'processing',
    'partially_paid',
    42500.00,
    1000.00,
    2075.00,
    450.00,
    44025.00,
    20000.00,
    24025.00,
    'whatsapp_ai',
    'Send via Surat Golden Transport to Sachin branch'
),
(
    '55555555-5555-5555-5555-555555555002',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444002',
    'OS-1025',
    'ready_for_dispatch',
    'unpaid',
    59500.00,
    1500.00,
    2900.00,
    600.00,
    61500.00,
    0.00,
    61500.00,
    'manual',
    'Pack in 2 waterproof parcel boxes for Ahmedabad delivery'
),
(
    '55555555-5555-5555-5555-555555555003',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444003',
    'OS-1023',
    'delivered',
    'paid',
    14500.00,
    500.00,
    700.00,
    300.00,
    15000.00,
    15000.00,
    0.00,
    'phone',
    'Delivered via VRL Logistics Rajkot hub'
)
ON CONFLICT (id) DO NOTHING;
