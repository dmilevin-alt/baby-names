-- Adds two quiz answers to each person's preferences.
-- Paste into: Supabase dashboard → SQL Editor → New query → Run (safe to run again).
-- backgrounds_strict: true = only show names from the chosen backgrounds;
--                     false/NULL = show those first, then everything else
-- popular_in:         countries whose most popular names to focus on
--                     (e.g. {us,canada}); NULL or empty = all names

ALTER TABLE preferences ADD COLUMN IF NOT EXISTS backgrounds_strict BOOLEAN;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS popular_in         TEXT[];
