-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('follow', 'like', 'comment', 'review')),
  action_text text not null,
  related_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index notifications_recipient_id_idx on public.notifications(recipient_id);
create index notifications_created_at_idx on public.notifications(created_at desc);
create index notifications_is_read_idx on public.notifications(is_read);

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS policy: Users can only see their own notifications
create policy "Users can view their own notifications"
  on public.notifications
  for select
  using (auth.uid() = recipient_id);

-- RLS policy: Users can delete their own notifications
create policy "Users can delete their own notifications"
  on public.notifications
  for delete
  using (auth.uid() = recipient_id);

-- Function to get notifications with user info
create or replace function public.get_notifications(
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  user_id uuid,
  user_name text,
  user_avatar text,
  recipient_id uuid,
  type text,
  action_text text,
  related_id uuid,
  is_read boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  select
    n.id,
    n.user_id,
    u.name as user_name,
    u.avatar_url as user_avatar,
    n.recipient_id,
    n.type,
    n.action_text,
    n.related_id,
    n.is_read,
    n.created_at,
    n.updated_at
  from notifications n
  join auth.users u on n.user_id = u.id
  where n.recipient_id = auth.uid()
  order by n.created_at desc
  limit p_limit
  offset p_offset;
$$;

-- Function to create follow notification
create or replace function public.create_follow_notification()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notifications (user_id, recipient_id, type, action_text)
  values (new.follower_id, new.following_id, 'follow', (
    select name from auth.users where id = new.follower_id
  ) || ' 님이 팔로우했습니다');
  return new;
end;
$$;

-- Trigger for follow notifications
create trigger on_follow_create
  after insert on public.user_follows
  for each row
  execute function public.create_follow_notification();
