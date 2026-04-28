-- 연간 시청 목표 테이블
create table public.user_goals (
  user_id      uuid not null references public.user_profiles(user_id) on delete cascade,
  year         int not null,
  target_count int not null check (target_count > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, year)
);

alter table public.user_goals enable row level security;

create policy "goals_select" on public.user_goals for select using (true);
create policy "goals_insert" on public.user_goals for insert with check (auth.uid() = user_id);
create policy "goals_update" on public.user_goals for update using (auth.uid() = user_id);
create policy "goals_delete" on public.user_goals for delete using (auth.uid() = user_id);
