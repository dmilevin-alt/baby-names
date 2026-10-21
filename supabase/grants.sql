-- Data API access for every app table. Supabase stopped granting this automatically
-- to new tables in "public" on Oct 30 2026. Existing tables kept their grants; run this
-- if the app gets "permission denied" errors, e.g. after recreating a table.
-- Paste into: Supabase dashboard → SQL Editor → New query → Run (safe to run again).
-- Row level security still decides which rows each user can see.

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;

GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO service_role;

GRANT SELECT ON public.preferences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preferences TO service_role;

GRANT SELECT ON public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO service_role;

GRANT SELECT ON public.shortlist TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlist TO service_role;

GRANT SELECT ON public.ai_names TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_names TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_names TO service_role;
