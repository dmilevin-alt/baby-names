-- ═══════════════════════════════════════════════════════════════════════════
-- Baby Names App — Supabase Schema
-- Paste this entire file into: Supabase dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── EXTENSIONS ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── TABLES ──────────────────────────────────────────────────────────────────

-- Stores each user's display name (auto-created on sign-up via trigger)
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per couple; holds the 6-character invite code
CREATE TABLE IF NOT EXISTS rooms (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code  TEXT NOT NULL UNIQUE,
  created_by   UUID NOT NULL REFERENCES auth.users(id),
  partner_id   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each person's quiz answers (one row per person per room)
CREATE TABLE IF NOT EXISTS preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  gender_pref     TEXT NOT NULL CHECK (gender_pref IN ('girl','boy','either')),
  tradition       TEXT[],                                -- NULL = skipped
  backgrounds     TEXT[] NOT NULL DEFAULT '{}',
  styles          TEXT[] NOT NULL DEFAULT '{}',
  length_pref     TEXT NOT NULL DEFAULT 'any' CHECK (length_pref IN ('short','medium','long','any')),
  include_letters TEXT,
  avoid_letters   TEXT,
  vibe            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Every swipe by every user — NEVER readable by the other person directly
CREATE TABLE IF NOT EXISTS votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  name       TEXT NOT NULL,
  vote       TEXT NOT NULL CHECK (vote IN ('love','maybe','pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id, name)
);

-- Mutual matches + custom names + notes
CREATE TABLE IF NOT EXISTS shortlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  is_custom  BOOLEAN NOT NULL DEFAULT FALSE,
  note       TEXT,
  added_by   UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, name)
);

-- Names the AI recommender suggested that aren't in names.js.
-- Shared by both partners so the names join everyone's swipe deck.
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

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms       ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlist   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_names    ENABLE ROW LEVEL SECURITY;


-- profiles: each user owns their own row
CREATE POLICY "own_profile"
  ON profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- rooms: only members can see their room
CREATE POLICY "room_members_select"
  ON rooms FOR SELECT
  USING (created_by = auth.uid() OR partner_id = auth.uid());

-- only the creator can insert
CREATE POLICY "room_creator_insert"
  ON rooms FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Direct room updates are NOT allowed; join_room() is a SECURITY DEFINER
-- function that runs as the DB owner, bypassing RLS, so it can set partner_id
-- without needing a permissive policy here.


-- preferences: both room members can read; only you can write yours
CREATE POLICY "room_members_read_prefs"
  ON preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = preferences.room_id
        AND (r.created_by = auth.uid() OR r.partner_id = auth.uid())
    )
  );

CREATE POLICY "own_prefs_write"
  ON preferences FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = room_id
        AND (r.created_by = auth.uid() OR r.partner_id = auth.uid())
    )
  );

CREATE POLICY "own_prefs_update"
  ON preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "own_prefs_delete"
  ON preferences FOR DELETE
  USING (user_id = auth.uid());


-- votes: you can only ever see or write YOUR OWN votes
-- The other person's votes are completely invisible to the browser
CREATE POLICY "own_votes_select"
  ON votes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "own_votes_insert"
  ON votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = room_id
        AND (r.created_by = auth.uid() OR r.partner_id = auth.uid())
    )
  );

CREATE POLICY "own_votes_update"
  ON votes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- shortlist: both room members can read and write
CREATE POLICY "room_members_shortlist"
  ON shortlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = shortlist.room_id
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


-- ai_names: both room members can read and write
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

-- ── SECURITY DEFINER FUNCTIONS ───────────────────────────────────────────────
-- These run with elevated privileges inside the database.
-- The browser calls them via Supabase RPC — it never gets raw vote rows.

-- join_room: look up a room by invite code and set partner_id = caller
CREATE OR REPLACE FUNCTION join_room(p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room rooms;
BEGIN
  SELECT * INTO v_room
  FROM rooms
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found. Check the invite code and try again.';
  END IF;

  IF v_room.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'This room already has two members.';
  END IF;

  IF v_room.created_by = auth.uid() THEN
    RAISE EXCEPTION 'You cannot join your own room.';
  END IF;

  UPDATE rooms
  SET partner_id = auth.uid()
  WHERE id = v_room.id;

  v_room.partner_id := auth.uid();

  RETURN row_to_json(v_room);
END;
$$;


-- get_matches: returns names where both partners voted Love or Maybe,
-- with at least one Love. Runs server-side so no raw votes leave the DB.
CREATE OR REPLACE FUNCTION get_matches(p_room_id UUID)
RETURNS TABLE(matched_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user1 UUID;
  v_user2 UUID;
BEGIN
  -- Verify the caller belongs to this room and get both member IDs
  SELECT created_by, partner_id
  INTO v_user1, v_user2
  FROM rooms
  WHERE id = p_room_id
    AND (created_by = auth.uid() OR partner_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied or room not found.';
  END IF;

  IF v_user2 IS NULL THEN
    RETURN; -- partner hasn't joined yet
  END IF;

  -- Return names where both voted love/maybe AND at least one voted love
  RETURN QUERY
  SELECT v1.name
  FROM votes v1
  JOIN votes v2
    ON  v2.name    = v1.name
    AND v2.room_id = v1.room_id
    AND v2.user_id = v_user2
  WHERE v1.room_id = p_room_id
    AND v1.user_id = v_user1
    AND v1.vote IN ('love','maybe')
    AND v2.vote IN ('love','maybe')
    AND (v1.vote = 'love' OR v2.vote = 'love');
END;
$$;


-- ── AUTO-CREATE PROFILE ON SIGN-UP ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
