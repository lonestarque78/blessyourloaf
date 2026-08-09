-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.

create table if not exists public.user_recipes (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in ('loaf', 'discard', 'rolls', 'focaccia', 'other')),
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes integer,
  bake_time_minutes integer,
  ingredients jsonb,
  steps jsonb,
  notes text,
  tags text[],
  source_recipe_id uuid references public.recipes(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_recipes enable row level security;

create policy "Users can manage own recipes"
  on public.user_recipes for all
  using (auth.uid() = user_id);

create trigger update_user_recipes_updated_at
  before update on public.user_recipes
  for each row execute function public.update_updated_at();
