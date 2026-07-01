-- Migration: custom tabs + tab ordering for course detail pages
-- Run this once in the Supabase SQL editor.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS custom_tabs JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tab_order  JSONB DEFAULT '[]';

-- custom_tabs shape: [{ "id": "<uuid>", "label": "Tab name", "content": "<html>" }]
-- tab_order shape:  ["overview", "curriculum", "custom-<uuid>", ...]  (built-in ids use hyphens)
