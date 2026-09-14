-- Scope place-image storage writes to the uploading user. Read stays
-- public (the bucket is already public and photos aren't sensitive), but
-- insert/update/delete now require the object's path to start with the
-- caller's own auth.uid(), matching the new places/${userId}/${placeId}/...
-- upload path in lib/supabase/queries.ts.

drop policy if exists place_images_insert on storage.objects;
create policy place_images_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'place-images'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists place_images_update on storage.objects;
create policy place_images_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'place-images'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'place-images'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists place_images_delete on storage.objects;
create policy place_images_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'place-images'
  and (storage.foldername(name))[2] = auth.uid()::text
);
