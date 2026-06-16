-- ═══════════════════════════════════════════════
-- YUGANTAR — Admin Portal Database System
-- ═══════════════════════════════════════════════

-- 1. Create ideas table if not exists (with both original and admin columns)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  era TEXT NOT NULL CHECK (era IN ('fire', 'night', 'sun')),
  ai_explanation TEXT,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Under Review')),
  review_notes TEXT,
  review_history JSONB DEFAULT '[]'::jsonb,
  deleted_at TIMESTAMPTZ
);

-- 2. Add admin columns safely if the ideas table already exists without them
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS review_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create user_restrictions table
CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  restricted BOOLEAN DEFAULT FALSE NOT NULL,
  restriction_reason TEXT,
  restricted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Indexes for fast query sorting and filtering
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON ideas (deleted_at);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas (status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs (created_at DESC);
