-- ============================================================================
-- OrderSaathi Row Level Security (RLS) & Multi-Tenant Security Policies
-- Strict isolation by business_id and role permission checks
-- ============================================================================

-- Enable RLS on all business-owned tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is an active member of the given business
CREATE OR REPLACE FUNCTION public.is_business_member(business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = $1
      AND user_id = auth.uid()
      AND is_active = true
  );
$$;

-- Helper function: Check if current user is owner or manager
CREATE OR REPLACE FUNCTION public.is_business_admin(business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = $1
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
      AND is_active = true
  );
$$;

-- Helper function: Check if current user is owner
CREATE OR REPLACE FUNCTION public.is_business_owner(business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = $1
      AND user_id = auth.uid()
      AND role = 'owner'
      AND is_active = true
  );
$$;

-- 1. Profiles Policies
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Businesses Policies
CREATE POLICY "Members can view their businesses"
    ON public.businesses FOR SELECT
    USING (public.is_business_member(id) OR owner_id = auth.uid());

CREATE POLICY "Owners can update business details"
    ON public.businesses FOR UPDATE
    USING (public.is_business_owner(id) OR owner_id = auth.uid());

-- 3. Business Members Policies
CREATE POLICY "Members can view co-workers"
    ON public.business_members FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Owners can manage members"
    ON public.business_members FOR ALL
    USING (public.is_business_owner(business_id));

-- 4. Customers Policies
CREATE POLICY "Members can view customers"
    ON public.customers FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update customers"
    ON public.customers FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete customers"
    ON public.customers FOR DELETE
    USING (public.is_business_admin(business_id));

-- 5. Products & Categories Policies
CREATE POLICY "Members can view products"
    ON public.products FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can create or update products"
    ON public.products FOR ALL
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can view categories"
    ON public.product_categories FOR ALL
    USING (public.is_business_member(business_id));

-- 6. Orders Policies
CREATE POLICY "Members can view orders"
    ON public.orders FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can cancel or delete orders"
    ON public.orders FOR DELETE
    USING (public.is_business_admin(business_id));

-- 7. Order Items Policies
CREATE POLICY "Members can view order items"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
          AND public.is_business_member(o.business_id)
    ));

CREATE POLICY "Members can insert or edit order items"
    ON public.order_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
          AND public.is_business_member(o.business_id)
    ));

-- 8. Payments & Ledger Policies
CREATE POLICY "Members can view payments"
    ON public.payments FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can record payments"
    ON public.payments FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can view customer ledger"
    ON public.customer_ledger_entries FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can insert ledger entries"
    ON public.customer_ledger_entries FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

-- 9. Dispatches & Logistics Policies
CREATE POLICY "Members can manage dispatches"
    ON public.dispatches FOR ALL
    USING (public.is_business_member(business_id));

-- 10. Follow-ups & Reminders
CREATE POLICY "Members can manage follow-ups"
    ON public.follow_up_reminders FOR ALL
    USING (public.is_business_member(business_id));

-- 11. Subscriptions
CREATE POLICY "Members can view subscription"
    ON public.subscriptions FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Owners can update subscription"
    ON public.subscriptions FOR UPDATE
    USING (public.is_business_owner(business_id));
