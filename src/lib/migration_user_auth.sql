-- ══════════════════════════════════════════════════════════════
-- User Auth Migration
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. OTP Verifications Table
--    Stores pending email verification requests before user is created in auth.users
CREATE TABLE IF NOT EXISTS otp_verifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL UNIQUE,
    full_name   TEXT NOT NULL,
    otp_code    TEXT NOT NULL,          -- SHA-256 hash of the 6-digit OTP
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);

-- Auto-delete expired OTP rows (optional; the app also cleans these up)
-- You can set up a pg_cron job or handle this in the API layer.

-- Row Level Security (no public access — only service role can read/write)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- No policies = no anon/authenticated access; only service role bypasses RLS
-- The API routes use supabaseAdmin (service role) so they can read/write freely.


-- ══════════════════════════════════════════════════════════════
-- 2. User Profiles Table
--    Stores public metadata and the is_active flag for each user.
--    The id column mirrors auth.users.id (UUID).
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active-status lookups (used in middleware)
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own profile (used in middleware & login)
CREATE POLICY "Users can read own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Service role (supabaseAdmin) bypasses all RLS automatically.
-- Admin API routes use service role to read all profiles and toggle is_active.


-- ══════════════════════════════════════════════════════════════
-- 3. Auto-update updated_at on user_profiles
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();
