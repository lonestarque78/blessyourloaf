-- Data-only change, not a schema change: makes the entire recipe library (20 recipes, was
-- 18 premium / 2 free) free and public. Decided alongside the pricing-copy rework in the same
-- commit — the paid tier ("Baker's Pass") now sells unlimited AI troubleshooting, ingredient
-- substitution, and recipe generation, not recipe access. The is_premium/published columns,
-- the RLS policies that gate on them (see 202606010006_baseline_recipes.sql), and the
-- redirect-to-login/subscribe path in src/app/[locale]/recipes/[slug]/page.tsx are all left
-- fully intact — this only changes the data, so the gating mechanism still works if a future
-- recipe is added with is_premium = true.
--
-- Applied by hand against the linked project ahead of this commit (via the REST API with the
-- service role key, equivalent to this UPDATE) so the live site reflects it immediately, per
-- the migration workflow noted in BACKLOG.md — this file is what keeps `supabase migration
-- list` from showing the remote ahead of git. Idempotent: safe to re-run.
update public.recipes
set is_premium = false,
    published = true
where is_premium = true or published = false;
