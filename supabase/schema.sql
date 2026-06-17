-- ════════════════════════════════════════════════════════════════
-- YUGANTAR — Complete Database Schema
-- Combines all migrations: 001, 002, 003
-- ════════════════════════════════════════════════════════════════

-- 1. Ideas table (with admin + contact fields)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  era TEXT NOT NULL CHECK (era IN ('fire', 'night', 'sun')),
  ai_explanation TEXT,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,

  -- Admin fields (migration 002)
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Under Review')),
  review_notes TEXT,
  review_history JSONB DEFAULT '[]'::jsonb,
  deleted_at TIMESTAMPTZ,

  -- Contact fields (migration 003)
  email TEXT,
  college TEXT,
  school TEXT,
  mobile TEXT
);

-- 2. Safely add all columns (no-op if already exist)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS review_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS mobile TEXT;

-- 3. Admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. User restrictions
CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  restricted BOOLEAN DEFAULT FALSE NOT NULL,
  restriction_reason TEXT,
  restricted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Indexes (safe — checks column existence before creating)
CREATE INDEX IF NOT EXISTS idx_ideas_upvotes ON ideas (upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_era ON ideas (era);
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON ideas (deleted_at);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas (status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs (created_at DESC);
