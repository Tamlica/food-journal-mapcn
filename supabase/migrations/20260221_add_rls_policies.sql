alter table public.places enable row level security;
alter table public.tags enable row level security;
alter table public.place_tags enable row level security;

drop policy if exists places_select_all on public.places;
create policy places_select_all
on public.places
for select
to anon, authenticated
using (true);

drop policy if exists places_insert_all on public.places;
create policy places_insert_all
on public.places
for insert
to anon, authenticated
with check (true);

drop policy if exists places_update_all on public.places;
create policy places_update_all
on public.places
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists places_delete_all on public.places;
create policy places_delete_all
on public.places
for delete
to anon, authenticated
using (true);

drop policy if exists tags_select_all on public.tags;
create policy tags_select_all
on public.tags
for select
to anon, authenticated
using (true);

drop policy if exists tags_insert_all on public.tags;
create policy tags_insert_all
on public.tags
for insert
to anon, authenticated
with check (true);

drop policy if exists tags_update_all on public.tags;
create policy tags_update_all
on public.tags
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists tags_delete_all on public.tags;
create policy tags_delete_all
on public.tags
for delete
to anon, authenticated
using (true);

drop policy if exists place_tags_select_all on public.place_tags;
create policy place_tags_select_all
on public.place_tags
for select
to anon, authenticated
using (true);

drop policy if exists place_tags_insert_all on public.place_tags;
create policy place_tags_insert_all
on public.place_tags
for insert
to anon, authenticated
with check (true);

drop policy if exists place_tags_update_all on public.place_tags;
create policy place_tags_update_all
on public.place_tags
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists place_tags_delete_all on public.place_tags;
create policy place_tags_delete_all
on public.place_tags
for delete
to anon, authenticated
using (true);
