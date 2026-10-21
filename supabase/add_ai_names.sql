-- Adds the ai_names table to an existing database.
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- (New setups get this from schema.sql. If you already ran an older version
-- of this file, run make_ai_names_global.sql instead.)

CREATE TABLE IF NOT EXISTS ai_names (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID REFERENCES rooms(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  gender     TEXT NOT NULL DEFAULT 'either' CHECK (gender IN ('girl','boy','either')),
  origin     TEXT[] NOT NULL DEFAULT '{}',
  style      TEXT[] NOT NULL DEFAULT '{}',
  meaning    TEXT NOT NULL DEFAULT '',
  syllables  INT,
  added_by   UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name)
);

-- Data API access (Supabase no longer grants it to new tables automatically)
GRANT SELECT ON public.ai_names TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_names TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_names TO service_role;

ALTER TABLE ai_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_names_read_all" ON ai_names;
CREATE POLICY "ai_names_read_all"
  ON ai_names FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "ai_names_insert_own" ON ai_names;
CREATE POLICY "ai_names_insert_own"
  ON ai_names FOR INSERT
  TO authenticated
  WITH CHECK (added_by = auth.uid());
