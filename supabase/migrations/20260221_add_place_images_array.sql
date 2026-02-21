alter table public.places
add column if not exists image_urls text[] not null default '{}';

update public.places
set image_urls = array[image_url]
where image_url is not null
  and image_url <> ''
  and (
    image_urls is null
    or array_length(image_urls, 1) is null
    or array_length(image_urls, 1) = 0
  );
