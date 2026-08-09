-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.

create table if not exists public.recipes (
  id uuid primary key default extensions.uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  category text check (category in ('loaf', 'discard', 'rolls', 'focaccia', 'other')),
  is_premium boolean default false,
  prep_time_minutes integer,
  bake_time_minutes integer,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  ingredients jsonb,
  steps jsonb,
  tags text[],
  image_url text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.recipes enable row level security;

-- No insert/update/delete policy exists live — recipes are managed via the service role
-- (e.g. an admin script or dashboard), not by regular authenticated users.
create policy "Anyone can view free recipes"
  on public.recipes for select
  using (published = true and is_premium = false);

create policy "Subscribers can view premium recipes"
  on public.recipes for select
  using (
    published = true
    and is_premium = true
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.subscription_status = any (array['active', 'trialing'])
    )
  );

create trigger update_recipes_updated_at
  before update on public.recipes
  for each row execute function public.update_updated_at();
