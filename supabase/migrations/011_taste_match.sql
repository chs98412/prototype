-- 취향 궁합 RPC
create or replace function public.get_taste_match(
  p_user_id   uuid,
  p_friend_id uuid
)
returns table (
  match_pct     numeric,
  common_count  bigint
)
language sql
security definer
as $$
  with common as (
    select
      u.tmdb_id,
      u.media_type,
      u.rating  as user_rating,
      f.rating  as friend_rating
    from public.user_records u
    join public.user_records f
      on f.tmdb_id = u.tmdb_id
     and f.media_type = u.media_type
     and f.user_id = p_friend_id
    where u.user_id = p_user_id
  ),
  rated as (
    select *
    from common
    where user_rating is not null
      and friend_rating is not null
  )
  select
    case
      when count(*) < 5 then null
      else round((1 - avg(abs(user_rating - friend_rating) / 5.0)) * 100)
    end as match_pct,
    (select count(*) from common) as common_count
  from rated;
$$;
