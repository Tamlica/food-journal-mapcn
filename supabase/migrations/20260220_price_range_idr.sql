alter table public.places
  alter column price_range type integer;

alter table public.places
  drop constraint if exists places_price_range_valid;

alter table public.places
  add constraint places_price_range_valid
  check (price_range is null or price_range between 20000 and 200000);