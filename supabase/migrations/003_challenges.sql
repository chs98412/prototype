create table if not exists public.challenges (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null,
  required_count int  not null,
  badge_emoji   text not null default '🏆',
  tmdb_ids      integer[] not null default '{}',
  created_at    timestamptz not null default now()
);

create table if not exists public.user_challenge_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  current_count int  not null default 0,
  completed_at  timestamptz,
  unique (user_id, challenge_id)
);

alter table public.challenges enable row level security;
alter table public.user_challenge_progress enable row level security;

create policy "challenges are public"
  on public.challenges for select using (true);

create policy "users can manage own progress"
  on public.user_challenge_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed: 초기 도전과제 5개
insert into public.challenges (title, description, required_count, badge_emoji, tmdb_ids) values
(
  '첫 기록',
  '첫 번째 작품을 기록하세요.',
  1,
  '🎬',
  '{}'
),
(
  '크리스토퍼 놀란 필모 완주',
  '크리스토퍼 놀란 감독의 장편 영화를 모두 감상하세요.',
  12,
  '🌀',
  '{157336, 49026, 374720, 27205, 155, 4233, 1422, 11517, 264660, 9091, 296, 209}'
),
(
  '봉준호 감독 완주',
  '봉준호 감독의 장편 영화를 모두 감상하세요.',
  8,
  '🎭',
  '{496243, 503919, 82695, 91314, 27042, 168672, 34734, 4503}'
),
(
  '칸 황금종려상 10편',
  '칸 국제영화제 황금종려상 수상작을 10편 이상 감상하세요.',
  10,
  '🌿',
  '{}'
),
(
  '마블 입문',
  '마블 시네마틱 유니버스 작품을 10편 이상 감상하세요.',
  10,
  '🦸',
  '{}'
)
on conflict do nothing;
