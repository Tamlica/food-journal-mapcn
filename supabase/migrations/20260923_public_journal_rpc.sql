-- Read path for the public showcase page (/u/<username>).
--
-- A SECURITY DEFINER function is used instead of anonymous RLS policies on
-- places/tags so that anonymous visitors can never query those tables
-- directly, and so the shape of what is exposed is controlled in one place:
-- no notes, no user ids, only places the owner marked public, and only if
-- the owner's profile is public.

create or replace function public.get_public_journal(p_username text)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_result jsonb;
begin
  select * into v_profile
  from public.profiles
  where username = lower(p_username)
    and is_public;

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'profile', jsonb_build_object(
      'username', v_profile.username,
      'displayName', v_profile.display_name,
      'bio', v_profile.bio
    ),
    'places', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'status', p.status,
        'rating', p.rating,
        'priceRange', p.price_range,
        'visitDate', p.visit_date,
        'latitude', p.latitude,
        'longitude', p.longitude,
        'imageUrls', coalesce(to_jsonb(p.image_urls), '[]'::jsonb),
        'tagIds', coalesce((
          select jsonb_agg(pt.tag_id)
          from public.place_tags pt
          where pt.place_id = p.id
        ), '[]'::jsonb)
      ) order by p.updated_at desc)
      from public.places p
      where p.user_id = v_profile.user_id
        and p.is_public
    ), '[]'::jsonb),
    'tags', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'color', t.color
      ))
      from public.tags t
      where t.id in (
        select pt.tag_id
        from public.place_tags pt
        join public.places p on p.id = pt.place_id
        where p.user_id = v_profile.user_id
          and p.is_public
      )
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_public_journal(text) from public;
grant execute on function public.get_public_journal(text) to anon, authenticated;
