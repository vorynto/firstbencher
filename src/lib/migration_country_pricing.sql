-- Migration: multi-country pricing for courses
-- Run this once in the Supabase SQL editor.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS country_prices JSONB DEFAULT '[]';

-- country_prices shape: [{ "country_code": "IN", "price": 25000 }, ...]
-- country_code matches the "code" field of an entry in the admin-managed
-- countries list (Settings → Payments), stored at pages_content.page_name = 'payment_settings'.
-- A course with no entry for a given country falls through to the
-- "Contact us for pricing" state on the course detail page.
