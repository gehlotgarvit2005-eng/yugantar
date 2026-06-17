-- ═══════════════════════════════════════════════
-- YUGANTAR — Contact Fields for Idea Submissions
-- ═══════════════════════════════════════════════

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS mobile TEXT;
