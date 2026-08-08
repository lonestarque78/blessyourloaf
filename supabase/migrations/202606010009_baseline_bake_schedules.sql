-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.

create table if not exists public.bake_schedules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete set null,
  target_ready_at timestamptz not null,
  steps jsonb not null,
  notes text,
  completed boolean default false,
  created_at timestamptz default now(),
  recipe_name text,
  target_date date,
  target_time text
);

alter table public.bake_schedules enable row level security;

create policy "Users can manage own bake schedules"
  on public.bake_schedules for all
  using (auth.uid() = user_id);
