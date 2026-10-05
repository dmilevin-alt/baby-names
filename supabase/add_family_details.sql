-- Adds family details to each person's quiz answers.
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- (New setups get this from schema.sql.)
-- sibling_names stays NULL until the person has been asked; [] means "no other children".

ALTER TABLE preferences ADD COLUMN IF NOT EXISTS full_name     TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS sibling_names TEXT[];
