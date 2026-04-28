-- Fix seed data with correct TMDB IDs
update public.challenges set tmdb_ids = array[577922,49026,157336,27205,155,272,1124,9353,77,79637,374720,872585]
where title = '크리스토퍼 놀란 필모 완주';

update public.challenges set tmdb_ids = array[496243,386117,109445,4922,51739,52741,1151534]
where title = '봉준호 감독 완주';

-- update_challenge_progress: called by backend (service role)
-- p_delta: +1 when watched, -1 when deleted
create or replace function public.update_challenge_progress(
  p_user_id uuid,
  p_tmdb_id  integer,
  p_delta    integer default 1
)
returns void
language plpgsql
security definer
as $$
declare
  v_ch  public.challenges;
  v_cnt int;
begin
  -- 1) tmdb_id 기반 도전과제
  for v_ch in
    select * from public.challenges where p_tmdb_id = any(tmdb_ids)
  loop
    insert into public.user_challenge_progress (user_id, challenge_id, current_count)
    values (p_user_id, v_ch.id, greatest(0, p_delta))
    on conflict (user_id, challenge_id) do update set
      current_count = greatest(0, user_challenge_progress.current_count + p_delta),
      completed_at  = case
        when greatest(0, user_challenge_progress.current_count + p_delta) >= v_ch.required_count
             and user_challenge_progress.completed_at is null
          then now()
        when greatest(0, user_challenge_progress.current_count + p_delta) < v_ch.required_count
          then null
        else user_challenge_progress.completed_at
      end;
  end loop;

  -- 2) 빈 tmdb_ids 도전과제 (예: "첫 기록") — 전체 시청 기록 수로 판단
  for v_ch in
    select * from public.challenges where cardinality(tmdb_ids) = 0
  loop
    select count(*) into v_cnt
    from public.user_records
    where user_id = p_user_id and status = 'watched';

    insert into public.user_challenge_progress (user_id, challenge_id, current_count)
    values (p_user_id, v_ch.id, least(v_cnt, v_ch.required_count))
    on conflict (user_id, challenge_id) do update set
      current_count = least(v_cnt, v_ch.required_count),
      completed_at  = case
        when v_cnt >= v_ch.required_count
          then coalesce(user_challenge_progress.completed_at, now())
        else null
      end;
  end loop;
end;
$$;
