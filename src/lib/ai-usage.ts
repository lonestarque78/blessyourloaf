import type { SupabaseClient } from '@supabase/supabase-js'

export const FREE_DAILY_AI_LIMIT = 2

export type AiAction = 'recipe_import' | 'troubleshooter' | 'bake_schedule' | 'ingredient_substitution' | 'recipe_generation'

function startOfTodayUtcIso() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

// A user counts as paid only while Stripe reports their subscription as 'active'. Other
// non-free statuses (e.g. 'past_due') fall back to free-tier limits until the webhook
// flips them back to 'active' — errs toward bounding AI cost over granting a grace period.
export async function isPaidUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return data?.subscription_status === 'active'
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
