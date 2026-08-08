-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.
--
-- Replaces the earlier 202608080003_baseline_profiles.sql, which was reconstructed from
-- PostgREST's OpenAPI schema alone (no direct SQL access) and got nullability, the check
-- constraints, the unique constraint, and the RLS policies wrong or missing entirely. This
-- version is confirmed against pg_catalog and pg_policies directly.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'monthly', 'annual')),
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'trialing', 'canceled', 'past_due')),
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- No INSERT policy exists live — rows are created only via the SECURITY DEFINER
-- handle_new_user() trigger on auth.users, which bypasses RLS.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
