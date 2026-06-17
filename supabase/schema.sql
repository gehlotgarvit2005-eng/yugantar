-- ════════════════════════════════════════════════════════════════
-- YUGANTAR — Complete Database Schema (SAFE VERSION)
-- Uses ALTER TABLE ADD COLUMN IF NOT EXISTS for ALL columns
-- so it works whether the table is new or existing
-- ════════════════════════════════════════════════════════════════

-- ═══ IDEAS TABLE ═══
-- Try to create if it doesn't exist (no-op if already there)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

-- Add EVERY column safely — only missing ones will be added
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS text TEXT NOT NULL DEFAULT '';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'Anonymous';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS era TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ai_explanation TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE NOT NULL;

-- Admin fields
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS review_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Contact fields
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS mobile TEXT;

-- ═══ ADMIN LOGS TABLE ═══
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ═══ USER RESTRICTIONS TABLE ═══
CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  restricted BOOLEAN DEFAULT FALSE NOT NULL,
  restriction_reason TEXT,
  restricted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ═══ INDEXES ═══
CREATE INDEX IF NOT EXISTS idx_ideas_upvotes ON ideas (upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_era ON ideas (era);
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON ideas (deleted_at);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas (status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs (created_at DESC);
