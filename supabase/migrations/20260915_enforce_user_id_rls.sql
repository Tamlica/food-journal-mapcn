-- Step 2 of enabling multi-user auth: lock places/tags/place_tags down to
-- their owner. PREREQUISITE: every existing places/tags row must already
-- have user_id set (run the one-time backfill UPDATE after your first
-- account signs up, before applying this migration) or the NOT NULL
-- constraints below will fail.

alter table public.places alter column user_id set not null;
alter table public.places alter column user_id set default auth.uid();

alter table public.tags alter column user_id set not null;
alter table public.tags alter column user_id set default auth.uid();

-- places: replace the old anon/using(true) policies with owner-only access.
drop policy if exists places_select_all on public.places;
drop policy if exists places_insert_all on public.places;
drop policy if exists places_update_all on public.places;
drop policy if exists places_delete_all on public.places;

create policy places_select_own
on public.places
for select
to authenticated
using (auth.uid() = user_id);

create policy places_insert_own
on public.places
for insert
to authenticated
with check (auth.uid() = user_id);

create policy places_update_own
on public.places
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy places_delete_own
on public.places
for delete
to authenticated
using (auth.uid() = user_id);

-- tags: same owner-only pattern.
drop policy if exists tags_select_all on public.tags;
drop policy if exists tags_insert_all on public.tags;
drop policy if exists tags_update_all on public.tags;
drop policy if exists tags_delete_all on public.tags;

create policy tags_select_own
on public.tags
for select
to authenticated
using (auth.uid() = user_id);

create policy tags_insert_own
on public.tags
for insert
to authenticated
with check (auth.uid() = user_id);

create policy tags_update_own
on public.tags
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy tags_delete_own
on public.tags
for delete
to authenticated
using (auth.uid() = user_id);

-- place_tags has no user_id of its own; scope it through the parent place.
drop policy if exists place_tags_select_all on public.place_tags;
drop policy if exists place_tags_insert_all on public.place_tags;
drop policy if exists place_tags_update_all on public.place_tags;
drop policy if exists place_tags_delete_all on public.place_tags;

create policy place_tags_select_own
on public.place_tags
for select
to authenticated
using (
  exists (
    select 1 from public.places
    where places.id = place_tags.place_id
      and places.user_id = auth.uid()
  )
);

create policy place_tags_insert_own
on public.place_tags
for insert
to authenticated
with check (
  exists (
    select 1 from public.places
    where places.id = place_tags.place_id
      and places.user_id = auth.uid()
  )
);

create policy place_tags_update_own
on public.place_tags
for update
to authenticated
using (
  exists (
    select 1 from public.places
    where places.id = place_tags.place_id
      and places.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.places
    where places.id = place_tags.place_id
      and places.user_id = auth.uid()
  )
);

create policy place_tags_delete_own
on public.place_tags
for delete
to authenticated
using (
  exists (
    select 1 from public.places
    where places.id = place_tags.place_id
      and places.user_id = auth.uid()
  )
);
