-- ════════════════════════════════════════════════════════════════
-- YUGANTAR — Complete Database Schema (CLEAN RESET VERSION)
-- Runs DROP TABLE first to clean any legacy schemas.
-- ════════════════════════════════════════════════════════════════

-- Drop tables if they exist to start completely fresh and avoid conflicts
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS user_restrictions CASCADE;

-- ═══ IDEAS TABLE ═══
CREATE TABLE ideas (
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
  deleted_at TIMESTAMPTZ,
  email TEXT,
  college TEXT,
  school TEXT,
  mobile TEXT
);

-- ═══ ADMIN LOGS TABLE ═══
CREATE TABLE admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ═══ USER RESTRICTIONS TABLE ═══
CREATE TABLE user_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  restricted BOOLEAN DEFAULT FALSE NOT NULL,
  restriction_reason TEXT,
  restricted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ═══ INDEXES ═══
CREATE INDEX idx_ideas_upvotes ON ideas (upvotes DESC);
CREATE INDEX idx_ideas_created_at ON ideas (created_at DESC);
CREATE INDEX idx_ideas_era ON ideas (era);
CREATE INDEX idx_ideas_deleted_at ON ideas (deleted_at);
CREATE INDEX idx_ideas_status ON ideas (status);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs (created_at DESC);

-- ═══ SEED DATA ═══
-- Seed 6 ideas so the cave never looks empty
INSERT INTO ideas (text, author, era, ai_explanation, upvotes, featured) VALUES
(
  'The fire remembers what the ice forgot.',
  'Cave Shaman',
  'fire',
  'In the embers of our collective memory lies wisdom older than the frost. Every spark carries the story of a thousand winters, and every flame dances with the ghost of its ancestors. The fire does not forget — it waits. It waits for the worthy hand to reach into its glow and pull out the truth that the cold tried to bury.',
  47, TRUE
),
(
  'A mammoth does not ask permission to cross the plain.',
  'Tusk King',
  'sun',
  'There comes a moment in every era when hesitation becomes the enemy of progress. The mammoth does not deliberate. It does not consult the winds or seek the approval of the grass it tramples. It moves. It advances. It claims the ground beneath its feet through the simple, unstoppable act of forward motion. Be the mammoth.',
  62, TRUE
),
(
  'Night is not the enemy — night is the womb of stars.',
  'Moon Listener',
  'night',
  'We have been taught to fear the dark. But look up. Every light that guides us was born in the void. The night does not extinguish — it conceives. It wraps the universe in its quiet embrace and births galaxies in the silence. Your greatest ideas will not come to you in the noise of the day. They will be whispered to you in the dark. Listen.',
  38, TRUE
),
(
  'Your skull is a cave. Fill it with fire, not smoke.',
  'Flame Teacher',
  'fire',
  'The skull is the first cave. Before the tribe found stone walls, you carried your own chamber of thought between your ears. What you put in there matters. Fill it with the fire of curiousity, of hunger, of will — and the walls will glow. Fill it with the smoke of doubt, of fear, of waiting — and you will choke. Clean your cave. Feed your fire.',
  55, TRUE
),
(
  'Strong ideas walk on four feet.',
  'Mammoth Rider',
  'sun',
  'A weak idea runs on two legs and falls at the first gust. A strong idea plants all four feet on the ground and does not move until the storm passes. The mammoth does not outrun the weather — it outlasts it. Your idea must have four feet: truth, timing, tribe, and grit. Build those, and nothing will knock it over.',
  31, FALSE
),
(
  'What burns brightest leaves the deepest shadow.',
  'Duality Keeper',
  'night',
  'Do not fear your shadow. It means you carry light. Every great fire casts darkness behind it — this is not a flaw, it is the nature of radiance. The brightest minds, the boldest ideas, the most brilliant eras — they all left shadows. The cave taught us this long before the sun existed. Embrace the darkness you create. It means you are burning bright enough.',
  44, TRUE
);
