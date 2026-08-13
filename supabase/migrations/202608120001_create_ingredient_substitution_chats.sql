-- Persists the ingredient-substitution chat, same shape and RLS as
-- 202606010008_baseline_troubleshooter_chats.sql (no starter_id — substitution questions
-- aren't tied to a specific starter's health the way troubleshooting is).
--
-- One deliberate difference from troubleshooter's query pattern: troubleshooter only
-- resumes a chat if updated within the last 48 hours (expires_at), otherwise starts a fresh
-- one, since it models an in-progress diagnosis session. A substitution question is meant to
-- be found again regardless of how old it is ("what did it say about honey vs. sugar last
-- week?"), so the app-side query for this table skips that expiry filter and just loads the
-- single most recent chat. expires_at/archive_expires_at are kept anyway for schema
-- consistency with troubleshooter_chats and the AI prompt retention policy in CLAUDE.md
-- Section 3 — like troubleshooter_chats, nothing currently reads or enforces them.

create table if not exists public.ingredient_substitution_chats (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '48:00:00'),
  archive_expires_at timestamptz default (now() + interval '14 days')
);

create index if not exists ingredient_substitution_chats_user_updated_idx
  on public.ingredient_substitution_chats (user_id, updated_at desc);

alter table public.ingredient_substitution_chats enable row level security;

create policy "Users can manage own chats"
  on public.ingredient_substitution_chats for all
  using (auth.uid() = user_id);

create trigger update_ingredient_substitution_chats_updated_at
  before update on public.ingredient_substitution_chats
  for each row execute function public.update_updated_at();
