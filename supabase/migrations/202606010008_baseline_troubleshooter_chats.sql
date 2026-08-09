-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.
--
-- expires_at/archive_expires_at implement the AI prompt retention policy from CLAUDE.md
-- Section 3, but nothing in this codebase currently reads or acts on these columns (no
-- scheduled cleanup job found) — they're set on write and otherwise unused so far.

create table if not exists public.troubleshooter_chats (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  starter_id uuid references public.starters(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '48:00:00'),
  archive_expires_at timestamptz default (now() + interval '14 days')
);

alter table public.troubleshooter_chats enable row level security;

create policy "Users can manage own chats"
  on public.troubleshooter_chats for all
  using (auth.uid() = user_id);

create trigger update_troubleshooter_chats_updated_at
  before update on public.troubleshooter_chats
  for each row execute function public.update_updated_at();
