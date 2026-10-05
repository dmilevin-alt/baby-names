-- Adds the ai_names table to an existing database.
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- (New setups get this from schema.sql.)

CREATE TABLE IF NOT EXISTS ai_names (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  gender     TEXT NOT NULL DEFAULT 'either' CHECK (gender IN ('girl','boy','either')),
  origin     TEXT[] NOT NULL DEFAULT '{}',
  style      TEXT[] NOT NULL DEFAULT '{}',
  meaning    TEXT NOT NULL DEFAULT '',
  syllables  INT,
  added_by   UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, name)
);

ALTER TABLE ai_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "room_members_ai_names" ON ai_names;
CREATE POLICY "room_members_ai_names"
  ON ai_names FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = ai_names.room_id
        AND (r.created_by = auth.uid() OR r.partner_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = room_id
        AND (r.created_by = auth.uid() OR r.partner_id = auth.uid())
    )
  );
