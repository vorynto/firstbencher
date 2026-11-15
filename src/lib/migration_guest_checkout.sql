-- ══════════════════════════════════════════════════════════════
-- Guest Checkout Migration
-- Run this once in the Supabase SQL editor.
-- ══════════════════════════════════════════════════════════════

-- Orders no longer require a logged-in buyer at checkout time — a visitor
-- can pay as a guest, and we create their student account automatically
-- once CC Avenue confirms the payment succeeded (see /api/payments/ccavenue/response).
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Snapshot of the checkout form for guest buyers, used to create their
-- account after a successful payment. Left null for buyers who were
-- already logged in when they checked out.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_full_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
