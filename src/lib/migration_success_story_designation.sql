-- Migration: designation field for success stories
-- Run this once in the Supabase SQL editor.

ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS designation TEXT;

-- designation: the student's job title/role (e.g. "Senior Project Manager at Acme Corp"),
-- shown below their name on the site instead of the course name.
-- course_name is still stored and now doubles as the join key used to show a
-- course's own testimonials on its course detail page — pick it from the
-- admin/feedback course dropdown so it matches courses.title exactly.
