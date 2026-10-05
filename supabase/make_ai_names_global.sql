-- Makes ai_names shared by every user instead of one room.
-- For databases that ran the older, per-room add_ai_names.sql.
-- Paste into: Supabase dashboard → SQL Editor → New query → Run

-- Keep the earliest copy of each name
DELETE FROM ai_names a
  USING ai_names b
  WHERE a.name = b.name
    AND (a.created_at, a.id) > (b.created_at, b.id);

-- room_id now only records where a name came from
ALTER TABLE ai_names ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE ai_names DROP CONSTRAINT IF EXISTS ai_names_room_id_fkey;
ALTER TABLE ai_names ADD CONSTRAINT ai_names_room_id_fkey
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;

ALTER TABLE ai_names DROP CONSTRAINT IF EXISTS ai_names_room_id_name_key;
ALTER TABLE ai_names DROP CONSTRAINT IF EXISTS ai_names_name_key;
ALTER TABLE ai_names ADD CONSTRAINT ai_names_name_key UNIQUE (name);

DROP POLICY IF EXISTS "room_members_ai_names" ON ai_names;

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
