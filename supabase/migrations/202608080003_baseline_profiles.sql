-- Baseline migration documenting the profiles table as it already exists live in Supabase.
-- This table predates migration-tracking in this repo (created directly against the
-- project, not through a versioned migration). Reconstructed here via introspection of the
-- live PostgREST schema (GET /rest/v1/) on 2026-08-08 so it's version-controlled going
-- forward. `create table if not exists` is a no-op against the existing live table; this
-- file exists to document the schema and to bootstrap fresh environments (local dev, CI,
-- a new Supabase project), not to alter production.
--
-- Column types/defaults below were confirmed via introspection. NOT NULL constraints
-- (beyond the primary key) and the auth.users foreign key/cascade were not independently
-- confirmed that way (PostgREST's OpenAPI schema doesn't expose them) — the FK/cascade
-- reflects the standard Supabase profiles pattern and matches the assumption already made
-- in src/app/api/account/delete/route.ts. Row Level Security is enabled here since every
-- other table in this project has it, but the specific policies live on this table were
-- not independently verified — confirm against the Supabase dashboard before treating this
-- file as authoritative on access control.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_tier text default 'free',
  subscription_status text default 'inactive',
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
