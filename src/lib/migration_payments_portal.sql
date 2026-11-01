-- ══════════════════════════════════════════════════════════════
-- Student Portal + CC Avenue Payments Migration
-- Run this once in the Supabase SQL editor.
-- ══════════════════════════════════════════════════════════════

-- 1. Orders table — one row per checkout attempt (pending until CC Avenue
--    posts back a final status). A course is "purchased" once an order for
--    it reaches status = 'success'.
CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_ref       TEXT NOT NULL UNIQUE,              -- our own reference, sent to CC Avenue as order_id
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    course_title    TEXT NOT NULL,                      -- snapshot at purchase time
    amount          NUMERIC(10, 2) NOT NULL,
    currency_code   TEXT NOT NULL,
    country_code    TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',    -- 'pending' | 'success' | 'failed' | 'cancelled'
    payment_mode    TEXT,                                -- e.g. "Credit Card", "Net Banking" (from CC Avenue)
    tracking_id     TEXT,                                -- CC Avenue's transaction tracking id
    bank_ref_no     TEXT,
    failure_message TEXT,
    raw_response    JSONB,                               -- full decrypted CC Avenue response, for support/audits
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_ref  ON orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Students can read their own orders (portal pages also use the service
-- role directly, but this lets the data load from the browser too).
CREATE POLICY "Users read own orders" ON orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can see and manage every order.
CREATE POLICY "Admin full: orders" ON orders
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- No INSERT/UPDATE policy for regular users — orders are only ever written
-- by the CC Avenue initiate/response API routes, which use the service-role
-- client and so bypass RLS entirely.

CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();


-- 2. Student phone number — collected in the portal Settings page and used
--    as the CC Avenue billing contact number.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;


-- 3. Attribute success stories to the logged-in user who submitted them, so
--    the portal can show "my submitted stories" and their approval status.
--    Nullable: the public /feedback page can still be used without login
--    in some flows, and existing rows have no user to backfill.
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON success_stories(user_id);

-- Students can read their own success stories regardless of approval status
-- (the existing public policy only exposes approved ones).
CREATE POLICY "Users read own success_stories" ON success_stories
    FOR SELECT TO authenticated USING (auth.uid() = user_id);


-- 4. CC Avenue credentials. Stored as its own pages_content row — kept
--    separate from "payment_settings" (which is fetched by the public,
--    unauthenticated /api/pages-content endpoint for the country switcher)
--    so the working key is never served to the browser. Only the admin
--    Settings page and the server-side initiate route ever read this row,
--    both of which check for an admin session / use the service role.
INSERT INTO pages_content (page_name, content)
VALUES ('ccavenue_credentials', '{"merchant_id": "", "access_code": "", "working_key": ""}')
ON CONFLICT (page_name) DO NOTHING;
