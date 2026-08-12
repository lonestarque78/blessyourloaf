import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// A cookie-free client for genuinely public, unauthenticated reads on statically-rendered
// pages (src/app/[locale]/recipes, /discard) — unlike src/lib/supabase/server.ts's
// createClient(), this never calls next/headers' cookies(), so using it doesn't force the
// calling route to render dynamically. RLS on public.recipes already restricts anon reads
// to published, non-premium rows (see supabase/migrations/202606010006_baseline_recipes.sql),
// so this can't be used to read anything a real anonymous visitor couldn't already see.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
