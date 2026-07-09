-- ══════════════════════════════════════════════════════════════
-- Guest Blogging Migration
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. New columns on the existing blogs table
--    status defaults to 'approved' so all existing (admin-authored) posts
--    keep working with zero data migration.
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE blogs ADD CONSTRAINT blogs_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_guest_submission BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS submitter_email TEXT;

CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_is_guest_submission ON blogs(is_guest_submission);

-- 2. Row Level Security
--    Replace the old "public read everything" policy with one that only
--    exposes approved posts. Admins (is_admin()) keep full access via the
--    existing "Admin full: blogs" policy, which is unaffected.
DROP POLICY IF EXISTS "Public read: blogs" ON blogs;
CREATE POLICY "Public read: blogs" ON blogs
    FOR SELECT USING (status = 'approved');

-- Anonymous visitors may create a guest submission, but only ever as a
-- pending, flagged-as-guest row — they cannot self-publish or touch
-- existing rows (UPDATE/DELETE are not covered by this policy).
CREATE POLICY "Public insert: guest blog submissions" ON blogs
    FOR INSERT WITH CHECK (status = 'pending' AND is_guest_submission = true);
