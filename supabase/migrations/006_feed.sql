-- user_records에 title/poster_path 컬럼 추가 (피드 표시용)
alter table public.user_records
  add column if not exists title       text,
  add column if not exists poster_path text;

-- 친구 활동 피드 RPC
create or replace function public.get_friend_feed(
  p_user_id uuid,
  p_limit   int default 20,
  p_offset  int default 0
)
returns table (
  tmdb_id      integer,
  media_type   text,
  status       text,
  rating       numeric,
  title        text,
  poster_path  text,
  updated_at   timestamptz,
  friend_id    uuid,
  display_name text,
  avatar_url   text
)
language sql
security definer
as $$
  select
    ur.tmdb_id,
    ur.media_type,
    ur.status,
    ur.rating,
    ur.title,
    ur.poster_path,
    ur.updated_at,
    up.user_id   as friend_id,
    up.display_name,
    up.avatar_url
  from public.user_records ur
  join public.user_follows  uf on uf.following_id = ur.user_id and uf.follower_id = p_user_id
  join public.user_profiles up on up.user_id = ur.user_id
  order by ur.updated_at desc
  limit p_limit offset p_offset;
$$;
