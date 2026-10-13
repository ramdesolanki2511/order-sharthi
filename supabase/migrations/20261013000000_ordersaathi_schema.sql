-- ============================================================================
-- OrderSaathi Core PostgreSQL Database Schema
-- Multi-Tenant B2B Wholesale Business Management System
-- Target: Indian Wholesalers, Textile Traders, Garment Manufacturers
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles (User accounts linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'gu', -- 'gu' (Gujarati), 'hi' (Hindi), 'en' (English)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Businesses (Tenant Entity)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    business_category TEXT DEFAULT 'textile_wholesale', -- textile, garments, footwear, general_wholesale
    gstin VARCHAR(15),
    pan VARCHAR(10),
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    email TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL DEFAULT 'Surat',
    state TEXT NOT NULL DEFAULT 'Gujarat',
    pincode VARCHAR(10),
    logo_url TEXT,
    currency VARCHAR(5) DEFAULT 'INR',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    allow_backorders BOOLEAN DEFAULT false,
    invoice_prefix TEXT DEFAULT 'INV',
    order_prefix TEXT DEFAULT 'OS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Business Members (Roles and Permissions)
-- Roles: 'owner', 'manager', 'staff'
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- 4. Customers (Wholesale Buyers / Retailers)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_name TEXT,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    email TEXT,
    gstin VARCHAR(15),
    billing_address TEXT,
    shipping_address TEXT,
    city TEXT DEFAULT 'Surat',
    state TEXT DEFAULT 'Gujarat',
    category TEXT DEFAULT 'regular', -- regular, vip, distributor, bulk
    credit_limit NUMERIC(12, 2) DEFAULT 100000.00,
    payment_terms_days INT DEFAULT 15,
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    current_balance NUMERIC(12, 2) DEFAULT 0.00, -- positive means customer owes money
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for customer search
CREATE INDEX IF NOT EXISTS idx_customers_business_search ON public.customers (business_id, name, business_name, phone);

-- 5. Product Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Products (Catalogue)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    unit VARCHAR(20) DEFAULT 'pcs', -- pcs, meters, boxes, sets, rolls, thaan
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 5.00, -- standard 5% GST for textiles
    hsn_code VARCHAR(10) DEFAULT '5407',
    stock_quantity NUMERIC(10, 2) DEFAULT 0.00,
    min_stock_alert NUMERIC(10, 2) DEFAULT 10.00,
    image_url TEXT,
    description TEXT,
    aliases TEXT[], -- Common WhatsApp nicknames/abbreviations for AI matching
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, sku)
);

-- 7. Product Variants (Sizes, Colors, Fabric types)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Size L / Blue'
    sku TEXT,
    stock_quantity NUMERIC(10, 2) DEFAULT 0.00,
    price_adjustment NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Inventory Movements (Stock In / Stock Out Audit)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment', 'order_dispatch', 'order_cancellation')),
    quantity NUMERIC(10, 2) NOT NULL,
    previous_quantity NUMERIC(10, 2) NOT NULL,
    new_quantity NUMERIC(10, 2) NOT NULL,
    reference_id UUID, -- order_id or purchase_id
    reason TEXT,
    performed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    order_number TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_confirmation', 'confirmed', 'processing', 'ready_for_dispatch', 'dispatched', 'delivered', 'cancelled'
    )),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'overdue')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    shipping_charges NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp_ai', 'phone', 'repeat_order')),
    raw_message_text TEXT, -- original WhatsApp message if parsed by AI
    delivery_address TEXT,
    delivery_notes TEXT,
    expected_delivery_date DATE,
    internal_notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, order_number)
);

-- 10. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'pcs',
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) DEFAULT 5.00,
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments & Receipts
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    receipt_number TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')),
    reference_number TEXT, -- UPI UTR or Cheque number
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Customer Ledger Entries (Double-Entry Balance System)
CREATE TABLE IF NOT EXISTS public.customer_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('invoice', 'payment', 'credit_note', 'opening_balance')),
    reference_id UUID, -- order_id or payment_id
    reference_number TEXT,
    description TEXT NOT NULL,
    debit NUMERIC(12, 2) DEFAULT 0.00, -- Debit: Customer owes us more (e.g. new invoice)
    credit NUMERIC(12, 2) DEFAULT 0.00, -- Credit: Customer paid us (e.g. payment receipt)
    running_balance NUMERIC(12, 2) NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Dispatches & Logistics
CREATE TABLE IF NOT EXISTS public.dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    transporter_name TEXT NOT NULL, -- e.g. 'Surat Golden Transport', 'VRL Logistics'
    lr_number TEXT, -- Lorry Receipt / Bilty number
    tracking_number TEXT,
    parcel_count INT DEFAULT 1,
    weight_kg NUMERIC(8, 2),
    dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    estimated_arrival DATE,
    driver_phone TEXT,
    status VARCHAR(20) DEFAULT 'dispatched' CHECK (status IN ('booked', 'dispatched', 'in_transit', 'delivered')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Follow-up Reminders
CREATE TABLE IF NOT EXISTS public.follow_up_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    reminder_type VARCHAR(30) DEFAULT 'payment_due' CHECK (reminder_type IN ('payment_due', 'order_reorder', 'dispatch_update', 'general')),
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'low_stock', 'payment_overdue', 'new_order', 'dispatch_ready'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Subscriptions (SaaS Monetization)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_tier VARCHAR(20) NOT NULL CHECK (plan_tier IN ('free_trial', 'starter', 'pro', 'business')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    max_orders_per_month INT DEFAULT 50,
    max_staff_members INT DEFAULT 1,
    ai_features_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
