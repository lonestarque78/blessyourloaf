#!/usr/bin/env node
// Lightweight post-migration check: confirms every table the app depends on actually
// exists and is reachable. Run in CI right after migrations are applied, or manually
// against any environment with `node scripts/verify-schema.mjs`.
//
// Deliberately not a full schema diff (columns/RLS/etc.) — this only catches the failure
// mode that bit us once already: a migration file existing in the repo without ever
// having been applied to the target database, leaving a table the app queries missing.
// Keep this list in sync with supabase/migrations/.

import { createClient } from '@supabase/supabase-js'

const EXPECTED_TABLES = [
  'profiles',
  'starters',
  'recipes',
  'feedings',
  'troubleshooter_chats',
  'ingredient_substitution_chats',
  'bake_schedules',
  'user_recipes',
  'webhook_events',
  'ai_usage_events',
  'push_subscriptions',
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const missing = []

for (const table of EXPECTED_TABLES) {
  const { error } = await supabase.from(table).select('id', { head: true, count: 'exact' })
  if (error) missing.push({ table, error: error.message })
}

if (missing.length > 0) {
  console.error(`${missing.length}/${EXPECTED_TABLES.length} expected tables are missing or unreachable:`)
  for (const { table, error } of missing) {
    console.error(`  - ${table}: ${error}`)
  }
  process.exit(1)
}

console.log(`All ${EXPECTED_TABLES.length} expected tables exist: ${EXPECTED_TABLES.join(', ')}`)
