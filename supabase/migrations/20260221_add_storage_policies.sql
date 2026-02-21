insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'place-images',
  'place-images',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists place_images_select on storage.objects;
create policy place_images_select
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'place-images');

drop policy if exists place_images_insert on storage.objects;
create policy place_images_insert
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'place-images');

drop policy if exists place_images_update on storage.objects;
create policy place_images_update
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'place-images')
with check (bucket_id = 'place-images');

drop policy if exists place_images_delete on storage.objects;
create policy place_images_delete
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'place-images');
