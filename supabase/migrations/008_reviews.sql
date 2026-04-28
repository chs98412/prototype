-- reviews 테이블
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.user_profiles(user_id) on delete cascade,
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  content     text not null check (char_length(content) between 1 and 500),
  is_spoiler  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 유저당 작품별 리뷰 1개
create unique index reviews_user_tmdb_idx on public.reviews (user_id, tmdb_id, media_type);

alter table public.reviews enable row level security;

create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete" on public.reviews for delete using (auth.uid() = user_id);
