-- 연간 활동 히트맵 RPC
create or replace function public.get_activity_heatmap(
  p_user_id uuid,
  p_year    int default extract(year from now())::int
)
returns table (
  activity_date date,
  cnt           bigint
)
language sql
security definer
as $$
  select
    date_trunc('day', updated_at)::date as activity_date,
    count(*)                             as cnt
  from public.user_records
  where user_id = p_user_id
    and extract(year from updated_at) = p_year
  group by 1
  order by 1;
$$;
