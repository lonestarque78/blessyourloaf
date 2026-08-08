-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.

create table if not exists public.starters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  nickname text,
  born_at date not null default current_date,
  flour_type text default 'all-purpose',
  hydration_percent integer default 100,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.starters enable row level security;

create policy "Users can manage own starters"
  on public.starters for all
  using (auth.uid() = user_id);

create trigger update_starters_updated_at
  before update on public.starters
  for each row execute function public.update_updated_at();
