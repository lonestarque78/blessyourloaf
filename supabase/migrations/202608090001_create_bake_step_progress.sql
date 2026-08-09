-- Phase 3: tracks per-step timer progress for a saved bake, so the step-by-step coach can
-- resume correctly after the page is reloaded or the browser is closed for hours (a
-- multi-hour autolyse or an overnight bulk fermentation can't rely on client-only timer
-- state). One row per (bake_schedule, step_index); started_at/completed_at drive the coach's
-- live countdown, which is always recomputed from these timestamps, never a client interval.

create table if not exists public.bake_step_progress (
  id uuid primary key default uuid_generate_v4(),
  bake_schedule_id uuid not null references public.bake_schedules(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  step_index integer not null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (bake_schedule_id, step_index)
);

create index if not exists bake_step_progress_schedule_idx on public.bake_step_progress (bake_schedule_id);

alter table public.bake_step_progress enable row level security;

create policy "Users can manage own bake step progress"
  on public.bake_step_progress for all
  using (auth.uid() = user_id);

create trigger update_bake_step_progress_updated_at
  before update on public.bake_step_progress
  for each row execute function public.update_updated_at();
