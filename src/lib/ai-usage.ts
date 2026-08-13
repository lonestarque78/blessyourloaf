import type { SupabaseClient } from '@supabase/supabase-js'
import type { Locale } from '@/i18n/locale'

export const FREE_DAILY_AI_LIMIT = 2

// Paid subscribers aren't metered per-action the way free users are, but "unlimited" was
// never actually free to serve — recipe generation in particular is a long structured
// completion on every call. This is a fair-use backstop, not a real-world ceiling: sized so
// no baker doing an unusually heavy day (several troubleshooting chats, a few substitution
// questions, a couple of generated recipes) would ever come close, while still bounding the
// cost of a runaway client, a scripted loop, or a shared/leaked account. See BACKLOG.md for
// the cost math behind this number.
export const PAID_DAILY_AI_LIMIT = 50

export type AiAction = 'recipe_import' | 'troubleshooter' | 'bake_schedule' | 'ingredient_substitution' | 'recipe_generation'

export interface AiQuotaStatus {
  remaining: number
  limit: number
  isPaid: boolean
}

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

// Every AI route calls this once per request to decide whether to proceed. Paid users get
// PAID_DAILY_AI_LIMIT instead of Infinity — previously a paid account skipped the usage
// query entirely and was never capped at all (see PAID_DAILY_AI_LIMIT above for why that
// stopped being safe to leave unbounded).
export async function getAiQuotaStatus(supabase: SupabaseClient, userId: string): Promise<AiQuotaStatus> {
  const isPaid = await isPaidUser(supabase, userId)
  const limit = isPaid ? PAID_DAILY_AI_LIMIT : FREE_DAILY_AI_LIMIT

  const { count, error } = await supabase
    .from('ai_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfTodayUtcIso())

  if (error) throw error

  return { remaining: Math.max(0, limit - (count ?? 0)), limit, isPaid }
}

export async function recordAiUsage(supabase: SupabaseClient, userId: string, action: AiAction): Promise<void> {
  const { error } = await supabase.from('ai_usage_events').insert({ user_id: userId, action })
  if (error) throw error
}

// Shared across every AI route's fair-use-cap response, rather than each route writing its
// own slightly different wording (the free-tier DAILY_LIMIT_REPLIES text below, by contrast,
// already drifted into a few different phrasings per route before this — not repeating that
// here). Framed as a fair-use safeguard, not a broken "unlimited" promise: says why the cap
// exists, that it's rare, and that the rest of the subscription is untouched.
export const FAIR_USE_LIMIT_REPLIES: Record<Locale, string> = {
  en: `You've reached today's fair-use limit of ${PAID_DAILY_AI_LIMIT} AI actions — far more than a normal day of baking needs, so this should be rare. It resets at midnight, and the rest of your subscription keeps working as usual.`,
  es: `Has alcanzado el límite de uso justo de hoy: ${PAID_DAILY_AI_LIMIT} acciones de IA — mucho más de lo que necesita un día normal de horneado, así que esto debería ser poco común. Se reinicia a medianoche, y el resto de tu suscripción sigue funcionando con normalidad.`,
}
