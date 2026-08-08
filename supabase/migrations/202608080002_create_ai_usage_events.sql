create table if not exists public.ai_usage_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_created_idx on public.ai_usage_events (user_id, created_at);

alter table public.ai_usage_events enable row level security;

-- Users can see their own usage history (e.g. to show "1 of 2 free actions used today" in the UI).
create policy "Users can view their own AI usage events"
  on public.ai_usage_events for select
  using (auth.uid() = user_id);

-- Server routes insert on the authenticated user's behalf after verifying the request; no user can log
-- usage against another user's id.
create policy "Users can insert their own AI usage events"
  on public.ai_usage_events for insert
  with check (auth.uid() = user_id);
