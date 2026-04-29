-- bio on user_profiles
alter table public.user_profiles
  add column if not exists bio text;

-- review likes
create table if not exists public.review_likes (
  user_id    uuid not null references public.user_profiles(user_id) on delete cascade,
  review_id  uuid not null references public.reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);
alter table public.review_likes enable row level security;
create policy "review_likes_select" on public.review_likes for select using (true);
create policy "review_likes_insert" on public.review_likes for insert with check (auth.uid() = user_id);
create policy "review_likes_delete" on public.review_likes for delete using (auth.uid() = user_id);
