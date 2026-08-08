import type { SupabaseClient } from '@supabase/supabase-js'

export const FREE_DAILY_AI_LIMIT = 2

export type AiAction = 'recipe_import' | 'troubleshooter' | 'ingredient_substitution' | 'recipe_generation'

function startOfTodayUtcIso() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

// Phase 4 wires up real subscription status; until then every user is treated as free-tier.
async function isPaidUser(_supabase: SupabaseClient, _userId: string): Promise<boolean> {
  return false
}

export async function getRemainingFreeAiActions(supabase: SupabaseClient, userId: string): Promise<number> {
  if (await isPaidUser(supabase, userId)) return Infinity

  const { count, error } = await supabase
    .from('ai_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfTodayUtcIso())

  if (error) throw error

  return Math.max(0, FREE_DAILY_AI_LIMIT - (count ?? 0))
}

export async function recordAiUsage(supabase: SupabaseClient, userId: string, action: AiAction): Promise<void> {
  const { error } = await supabase.from('ai_usage_events').insert({ user_id: userId, action })
  if (error) throw error
}
