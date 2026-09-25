-- Security hardening found by the Supabase advisors / policy review.

-- 1. Storage: the original catch-all policies (anon + authenticated, bucket
--    check only) are OR-ed with the owner-scoped place_images_* policies and
--    make them meaningless. Remove them; keep uploads/updates/deletes scoped
--    to places/<uid>/... via the place_images_* policies.
drop policy if exists "insert policy" on storage.objects;
drop policy if exists "update policy" on storage.objects;
drop policy if exists "delete policy" on storage.objects;
drop policy if exists "select policy" on storage.objects;

-- Uploads use upsert: true, which needs SELECT on the row. The bucket is
-- public, so image URLs still load without a policy; this one only lets an
-- owner see/list their own objects.
create policy "place_images_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'place-images'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- 2. Trigger-only SECURITY DEFINER functions should not be callable via
--    /rest/v1/rpc. Triggers keep firing; they don't check invoker EXECUTE.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 3. Pin search_path on trigger functions (bodies only call pg_catalog.now()).
alter function public.profiles_touch_updated_at() set search_path = '';
alter function public.set_updated_at() set search_path = '';
