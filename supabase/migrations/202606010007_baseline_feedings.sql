-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.

create table if not exists public.feedings (
  id uuid primary key default uuid_generate_v4(),
  starter_id uuid not null references public.starters(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  fed_at timestamptz default now(),
  flour_grams integer,
  water_grams integer,
  starter_grams integer,
  rise_percent integer,
  peak_hours numeric,
  smell text,
  notes text,
  created_at timestamptz default now()
);

alter table public.feedings enable row level security;

create policy "Users can manage own feedings"
  on public.feedings for all
  using (auth.uid() = user_id);
