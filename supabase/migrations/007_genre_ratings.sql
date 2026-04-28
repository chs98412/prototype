-- user_records에 genre_ids 컬럼 추가 (취향 레이팅용)
alter table public.user_records
  add column if not exists genre_ids integer[];

-- 장르별 취향 레이팅 RPC
create or replace function public.get_genre_ratings(p_user_id uuid)
returns table (
  genre_id   integer,
  cnt        bigint,
  avg_rating numeric,
  level      integer
)
language sql
security definer
as $$
  with genre_data as (
    select
      unnest(genre_ids) as genre_id,
      rating
    from public.user_records
    where user_id = p_user_id
      and genre_ids is not null
      and array_length(genre_ids, 1) > 0
  ),
  aggregated as (
    select
      genre_id,
      count(*)                                                as cnt,
      coalesce(avg(rating) filter (where rating is not null), 0) as avg_rating
    from genre_data
    group by genre_id
  )
  select
    genre_id,
    cnt,
    round(avg_rating::numeric, 1) as avg_rating,
    case
      when cnt < 3                                   then 0
      when (cnt * 0.4 + avg_rating * 0.6) < 2       then 1
      when (cnt * 0.4 + avg_rating * 0.6) < 4       then 2
      when (cnt * 0.4 + avg_rating * 0.6) < 6       then 3
      when (cnt * 0.4 + avg_rating * 0.6) < 8       then 4
      else                                                5
    end as level
  from aggregated
  order by cnt desc, avg_rating desc;
$$;
