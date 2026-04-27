create table if not exists public.user_streaks (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  current_streak int  not null default 0,
  longest_streak int  not null default 0,
  last_logged_date date
);

alter table public.user_streaks enable row level security;

create policy "users can view own streak"
  on public.user_streaks for select
  using (auth.uid() = user_id);

-- log_streak: called by backend with service role key
create or replace function public.log_streak(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_today   date := current_date;
  v_row     public.user_streaks;
  v_new     int;
begin
  select * into v_row from public.user_streaks where user_id = p_user_id;

  if not found then
    insert into public.user_streaks (user_id, current_streak, longest_streak, last_logged_date)
    values (p_user_id, 1, 1, v_today);
    return json_build_object('current_streak', 1, 'longest_streak', 1);
  end if;

  if v_row.last_logged_date = v_today then
    return json_build_object('current_streak', v_row.current_streak, 'longest_streak', v_row.longest_streak);
  end if;

  v_new := case when v_row.last_logged_date = v_today - 1 then v_row.current_streak + 1 else 1 end;

  update public.user_streaks set
    current_streak   = v_new,
    longest_streak   = greatest(v_row.longest_streak, v_new),
    last_logged_date = v_today
  where user_id = p_user_id;

  return json_build_object('current_streak', v_new, 'longest_streak', greatest(v_row.longest_streak, v_new));
end;
$$;
