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

// Not every AI action costs the same to serve — a bake schedule or a generated recipe is a
// long structured completion, while a substitution question is a short exchange. Weighting
// PAID_DAILY_AI_LIMIT by real, measured relative cost (see BACKLOG.md for the actual
// token/dollar numbers per action, remeasured 2026-08-12) means the fair-use cap bounds
// dollars, not just call count. 1 unit ≈ the cost of the cheapest action. Retune here only —
// nothing else needs to change. The free tier is intentionally left unweighted (a flat
// FREE_DAILY_AI_LIMIT actions, any mix) since it's small enough that cost isn't the concern
// there and weighting it would shrink what a new trial user can do with a single expensive
// action.
export const AI_ACTION_COST_WEIGHT: Record<AiAction, number> = {
  ingredient_substitution: 1,
  recipe_import: 1,
  troubleshooter: 2,
  recipe_generation: 3,
  bake_schedule: 5,
}

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
//
// Free and paid users are counted differently on purpose: free stays a simple row count (raw
// actions, unweighted — see AI_ACTION_COST_WEIGHT above for why), paid sums each row's
// cost_weight so the 50/day budget tracks dollars rather than call count.
export async function getAiQuotaStatus(supabase: SupabaseClient, userId: string): Promise<AiQuotaStatus> {
  const isPaid = await isPaidUser(supabase, userId)

  if (!isPaid) {
    const { count, error } = await supabase
      .from('ai_usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfTodayUtcIso())

    if (error) throw error

    return { remaining: Math.max(0, FREE_DAILY_AI_LIMIT - (count ?? 0)), limit: FREE_DAILY_AI_LIMIT, isPaid: false }
  }

  const { data, error } = await supabase
    .from('ai_usage_events')
    .select('cost_weight')
    .eq('user_id', userId)
    .gte('created_at', startOfTodayUtcIso())

  if (error) throw error

  const usedUnits = (data ?? []).reduce((sum: number, row: { cost_weight: number | null }) => sum + (row.cost_weight ?? 1), 0)

  return { remaining: Math.max(0, PAID_DAILY_AI_LIMIT - usedUnits), limit: PAID_DAILY_AI_LIMIT, isPaid: true }
}

export async function recordAiUsage(supabase: SupabaseClient, userId: string, action: AiAction): Promise<void> {
  const { error } = await supabase
    .from('ai_usage_events')
    .insert({ user_id: userId, action, cost_weight: AI_ACTION_COST_WEIGHT[action] })
  if (error) throw error
}

// Shared across every AI route's fair-use-cap response, rather than each route writing its
// own slightly different wording (the free-tier DAILY_LIMIT_REPLIES text below, by contrast,
// already drifted into a few different phrasings per route before this — not repeating that
// here). Framed as a fair-use safeguard, not a broken "unlimited" promise: says why the cap
// exists, that it's rare, and that the rest of the subscription is untouched. Deliberately
// doesn't quote PAID_DAILY_AI_LIMIT as a literal action count — since AI_ACTION_COST_WEIGHT
// means a heavy day of bake schedules hits the cap in far fewer than 50 calls, a hard number
// here would read as a broken promise of its own.
export const FAIR_USE_LIMIT_REPLIES: Record<Locale, string> = {
  en: `You've reached today's fair-use limit for AI features, far more than a normal day of baking needs, so this should be rare. It resets at midnight, and the rest of your subscription keeps working as usual.`,
  es: `Has alcanzado el límite de uso justo de hoy para las funciones de IA, mucho más de lo que necesita un día normal de horneado, así que esto debería ser poco común. Se reinicia a medianoche, y el resto de tu suscripción sigue funcionando con normalidad.`,
}

// Shared by every AI route's free-tier daily-cap response, same reasoning as
// FAIR_USE_LIMIT_REPLIES above: one message instead of each route hand-copying (and
// gradually drifting from) its own wording. Never say "AI" here since this is user-facing
// text (VOICE.md), despite the constant's own name.
export const FREE_DAILY_LIMIT_REPLIES: Record<Locale, string> = {
  en: `You've used your ${FREE_DAILY_AI_LIMIT} free actions for today. Come back tomorrow, or upgrade anytime for far more than a normal day of baking needs.`,
  es: `Ya usaste tus ${FREE_DAILY_AI_LIMIT} acciones gratuitas de hoy. Vuelve mañana, o mejora tu plan cuando quieras, para tener mucho más de lo que necesita un día normal de horneado.`,
}
