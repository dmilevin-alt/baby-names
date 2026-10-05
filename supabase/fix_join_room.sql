-- Makes joining a room safe:
--   * two people entering the same code at once can't both join
--   * someone already paired in another room can't join a second one
--   * a room you created that nobody joined yet is merged into your partner's
--     room when you join it: your quiz answers, votes and custom names move
--     across, then the empty room is removed
-- Paste into: Supabase dashboard → SQL Editor → New query → Run

CREATE OR REPLACE FUNCTION join_room(p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room rooms;
  v_old  UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to join a room.';
  END IF;

  -- Lock the room so a second person joining at the same moment waits here
  SELECT * INTO v_room
  FROM rooms
  WHERE invite_code = UPPER(TRIM(p_invite_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found. Check the invite code and try again.';
  END IF;

  IF v_room.created_by = auth.uid() THEN
    RAISE EXCEPTION 'You cannot join your own room.';
  END IF;

  IF v_room.partner_id = auth.uid() THEN
    RETURN row_to_json(v_room);   -- already joined; nothing to do
  END IF;

  IF v_room.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'This room already has two members.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM rooms
    WHERE id <> v_room.id
      AND partner_id IS NOT NULL
      AND (created_by = auth.uid() OR partner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You are already in a room with a partner.';
  END IF;

  -- Bring over anything you did on your own in a room nobody joined, then remove it
  FOR v_old IN
    SELECT id FROM rooms
    WHERE created_by = auth.uid() AND partner_id IS NULL AND id <> v_room.id
    ORDER BY created_at DESC
  LOOP
    UPDATE preferences SET room_id = v_room.id
    WHERE room_id = v_old AND user_id = auth.uid()
      AND NOT EXISTS (SELECT 1 FROM preferences WHERE room_id = v_room.id AND user_id = auth.uid());

    INSERT INTO votes (room_id, user_id, name, vote, created_at)
    SELECT v_room.id, user_id, name, vote, created_at
    FROM votes WHERE room_id = v_old AND user_id = auth.uid()
    ON CONFLICT (room_id, user_id, name) DO NOTHING;

    INSERT INTO shortlist (room_id, name, is_custom, note, added_by, created_at)
    SELECT v_room.id, name, is_custom, note, added_by, created_at
    FROM shortlist WHERE room_id = v_old
    ON CONFLICT (room_id, name) DO NOTHING;

    DELETE FROM rooms WHERE id = v_old;
  END LOOP;

  UPDATE rooms
  SET partner_id = auth.uid()
  WHERE id = v_room.id
    AND partner_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This room already has two members.';
  END IF;

  v_room.partner_id := auth.uid();
  RETURN row_to_json(v_room);
END;
$$;
