-- Part 1 of feeding-reminder push notifications: just the storage for browser push
-- subscriptions (Web Push standard: an endpoint URL plus the two keys needed to encrypt
-- a payload for it). No reminder-sending logic yet — that's part 2. This table only
-- backs "Enable notifications" and the "send test notification" button, which prove the
-- subscribe -> store -> send -> service worker pipeline works end to end.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger update_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.update_updated_at();
