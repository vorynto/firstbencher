-- ══════════════════════════════════════════════════════════════
-- STEP 1: Core Tables
-- ══════════════════════════════════════════════════════════════

-- Pages Content Table
CREATE TABLE IF NOT EXISTS pages_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_name TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  duration TEXT,
  category TEXT,
  curriculum JSONB DEFAULT '[]',
  custom_tabs JSONB DEFAULT '[]',   -- admin-defined tabs: [{ id, label, content(html) }]
  tab_order JSONB DEFAULT '[]',     -- ordered tab ids (built-in + custom) for the detail page
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 1) DEFAULT 5.0,
  features JSONB DEFAULT '[]',
  requirements TEXT DEFAULT '',
  popular_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events / Workshops Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  image_url TEXT,
  category TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success Stories Table
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  course_name TEXT,
  company_name TEXT,
  message TEXT NOT NULL,
  image_url TEXT,
  certificate_url TEXT,
  linkedin_url TEXT,
  video_url TEXT,
  rating INTEGER DEFAULT 5,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location TEXT,
  type TEXT,
  description TEXT,
  requirements TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT DEFAULT 'applied',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ══════════════════════════════════════════════════════════════
-- STEP 2: Admin Users Table
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin' or 'super_admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helper function: checks if the currently logged-in user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;


-- ══════════════════════════════════════════════════════════════
-- STEP 3: Enable RLS on all tables
-- ══════════════════════════════════════════════════════════════

ALTER TABLE pages_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users        ENABLE ROW LEVEL SECURITY;


-- ══════════════════════════════════════════════════════════════
-- STEP 4: Public read policies
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "Public read: pages_content"    ON pages_content     FOR SELECT USING (true);
CREATE POLICY "Public read: courses"          ON courses            FOR SELECT USING (active = true);
CREATE POLICY "Public read: blogs"            ON blogs              FOR SELECT USING (true);
CREATE POLICY "Public read: events"           ON events             FOR SELECT USING (active = true);
CREATE POLICY "Public read: success_stories"  ON success_stories    FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read: jobs"             ON jobs               FOR SELECT USING (active = true);

-- Public can submit inquiries and applications
CREATE POLICY "Public insert: inquiries"      ON inquiries          FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert: applications"   ON applications       FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert: success_stories" ON success_stories    FOR INSERT WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════
-- STEP 5: Admin full-access policies (uses is_admin() function)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "Admin full: pages_content"    ON pages_content     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: courses"          ON courses            FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: blogs"            ON blogs              FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: events"           ON events             FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: success_stories"  ON success_stories    FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: inquiries"        ON inquiries          FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: jobs"             ON jobs               FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full: applications"     ON applications       FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admins can read the admin_users table (to see who has access)
CREATE POLICY "Admin read: admin_users"      ON admin_users        FOR SELECT USING (is_admin());


-- ══════════════════════════════════════════════════════════════
-- STEP 6: Register Admin User
-- Replace the email below with YOUR admin email before running!
-- The user must already exist in Authentication → Users first.
-- ══════════════════════════════════════════════════════════════

INSERT INTO admin_users (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'vorynto.india@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
