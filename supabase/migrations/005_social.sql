create table if not exists public.user_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

create table if not exists public.user_follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.user_profiles enable row level security;
alter table public.user_follows  enable row level security;

create policy "profiles are public"
  on public.user_profiles for select using (true);

create policy "users can update own profile"
  on public.user_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "follows are public"
  on public.user_follows for select using (true);

create policy "users can manage own follows"
  on public.user_follows for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- 신규 가입 시 user_profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
