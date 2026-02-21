create extension if not exists pgcrypto;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  constraint tags_name_not_blank check (char_length(trim(name)) > 0)
);

create unique index if not exists tags_name_unique_idx on public.tags (lower(name));

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  status text not null,
  rating smallint,
  price_range smallint,
  visit_date date,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint places_name_not_blank check (char_length(trim(name)) > 0),
  constraint places_status_valid check (status in ('visited', 'want_to_go', 'avoid')),
  constraint places_rating_valid check (rating is null or rating between 0.5 and 5),
  constraint places_price_range_valid check (price_range is null or price_range between 1 and 4),
  constraint places_latitude_valid check (latitude between -90 and 90),
  constraint places_longitude_valid check (longitude between -180 and 180),
  constraint places_rating_status_valid check (
    (status = 'visited' and rating between 1 and 5)
    or (status <> 'visited' and rating is null)
  )
);

create index if not exists places_status_idx on public.places (status);
create index if not exists places_rating_idx on public.places (rating);
create index if not exists places_price_range_idx on public.places (price_range);
create index if not exists places_visit_date_idx on public.places (visit_date);
create index if not exists places_coordinates_idx on public.places (latitude, longitude);

create table if not exists public.place_tags (
  place_id uuid not null references public.places (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (place_id, tag_id)
);

create index if not exists place_tags_tag_id_idx on public.place_tags (tag_id);
create index if not exists place_tags_place_id_idx on public.place_tags (place_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
before update on public.places
for each row execute function public.set_updated_at();
