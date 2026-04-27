create table if not exists public.user_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  status      text not null check (status in ('watched', 'watching', 'want')),
  rating      numeric(3, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);

alter table public.user_records enable row level security;

create policy "users can manage own records"
  on public.user_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
