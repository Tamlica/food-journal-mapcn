-- Step 1 of enabling multi-user auth: add nullable owner columns.
-- Safe to run immediately; existing rows are left with user_id = null
-- until they're backfilled to a real auth.users id (manual, one-time,
-- after the first account signs up). Do NOT run the RLS-enforcing
-- migration (20260915_enforce_user_id_rls.sql) until that backfill
-- is done, or every existing row becomes unreadable/unwritable.

alter table public.places
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.tags
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists places_user_id_idx on public.places (user_id);
create index if not exists tags_user_id_idx on public.tags (user_id);
