create table if not exists public.webhook_events (
  id uuid default gen_random_uuid() primary key,
  event_id text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb not null,
  source text not null default 'stripe',
  idempotency_key text not null
);

create index if not exists webhook_events_event_type_idx on public.webhook_events (event_type);
create index if not exists webhook_events_processed_at_idx on public.webhook_events (processed_at);
