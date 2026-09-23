-- Profiles: one row per auth user, holding the public-facing username and
-- showcase settings. The row is created by a trigger on auth.users so it
-- exists even when email confirmation is required (no session at signup).

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text,
  bio text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$')
);

create unique index if not exists profiles_username_key
  on public.profiles (username);

alter table public.profiles enable row level security;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Keep updated_at fresh.
create or replace function public.profiles_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.profiles_touch_updated_at();

-- Create the profile when a user signs up. The username comes from the
-- signUp metadata; if it is missing or invalid, fall back to a generated
-- one so signup never fails because of the profile row. The unique index
-- still rejects a username that is already taken, which aborts signup and
-- surfaces as an error the client can show.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  candidate text;
begin
  if requested ~ '^[a-z0-9_]{3,30}$' then
    candidate := requested;
  else
    candidate := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;

  insert into public.profiles (user_id, username)
  values (new.id, candidate);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill accounts created before this migration.
insert into public.profiles (user_id, username)
select
  u.id,
  'user_' || substr(replace(u.id::text, '-', ''), 1, 10)
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);

-- Live availability check for the signup and profile forms. Callable by
-- anonymous visitors; returns only a boolean, never the row.
create or replace function public.is_username_available(candidate text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where username = lower(candidate)
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
