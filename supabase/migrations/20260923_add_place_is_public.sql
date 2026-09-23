-- Per-place opt-in for the public showcase page. Everything stays private
-- until the owner flips the toggle.

alter table public.places
  add column if not exists is_public boolean not null default false;

create index if not exists places_public_by_user_idx
  on public.places (user_id)
  where is_public;
