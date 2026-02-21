alter table public.places
  alter column rating type numeric(2,1);

alter table public.places
  drop constraint if exists places_rating_valid;

alter table public.places
  add constraint places_rating_valid
  check (rating is null or (rating >= 0.5 and rating <= 5));