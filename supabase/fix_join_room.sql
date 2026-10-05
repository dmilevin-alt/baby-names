-- Makes joining a room safe:
--   * two people entering the same code at once can't both join
--   * someone already paired in another room can't join a second one
--   * a room you created that nobody joined yet is removed when you join
--     your partner's room instead (it holds no quiz answers or votes)
-- Paste into: Supabase dashboard → SQL Editor → New query → Run

CREATE OR REPLACE FUNCTION join_room(p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room rooms;
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

  -- Rooms you created that nobody joined have no answers or votes yet
  DELETE FROM rooms
  WHERE created_by = auth.uid()
    AND partner_id IS NULL
    AND id <> v_room.id;

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
