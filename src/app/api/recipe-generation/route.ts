import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FAIR_USE_LIMIT_REPLIES, FREE_DAILY_LIMIT_REPLIES, getAiQuotaStatus, recordAiUsage } from '@/lib/ai-usage'
import { looksOffTopic } from '@/lib/sourdough-ai'
import { generateRecipeWithAnthropic, RecipeGenerationDeclinedError } from '@/lib/recipe-generation'
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/i18n/locale'

const client = new Anthropic()

// See bake-schedule/route.ts for why this is set explicitly rather than left to Vercel's
// platform default. Same max_tokens budget as recipe-import's cleanup call (2400), but
// composing a fresh recipe from a short description takes a bit more reasoning than cleaning
// up text that's already there, so this leans toward recipe-import's 60s rather than a
// tighter budget.
export const maxDuration = 60

const OFF_TOPIC_REPLIES: Record<Locale, string> = {
  en: "That doesn't look like a sourdough baking request. Tell us what you'd like to bake (a loaf, rolls, focaccia, or anything else made with your starter) and we'll build the recipe.",
  es: 'Eso no parece una solicitud de receta de panadería con masa madre. Cuéntanos qué te gustaría hornear (una hogaza, panecillos, focaccia o cualquier otra cosa hecha con tu masa madre) y construiremos la receta.',
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { description?: string; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const locale: Locale = isSupportedLocale(body.locale) ? body.locale : DEFAULT_LOCALE

  if (!description) {
    return NextResponse.json({ error: 'Tell us what you would like to bake.' }, { status: 400 })
  }

  // Cheap keyword pre-check, same reasoning as the one shared by troubleshooter and
  // ingredient-substitution (see sourdough-ai.ts) — catches an obviously off-topic
  // description before spending an Anthropic call on it. The system prompt's own STAY ON
  // TOPIC escape hatch (see recipe-generation.ts) is what catches anything that slips past
  // this, via RecipeGenerationDeclinedError below.
  if (looksOffTopic(description)) {
    return NextResponse.json({ error: OFF_TOPIC_REPLIES[locale] }, { status: 422 })
  }

  let quota: { remaining: number; isPaid: boolean }
  try {
    quota = await getAiQuotaStatus(supabase, user.id)
  } catch (error) {
    console.warn('[recipe-generation] quota check failed, blocking AI call', error)
    quota = { remaining: 0, isPaid: false }
  }

  if (quota.remaining <= 0) {
    const message = quota.isPaid ? FAIR_USE_LIMIT_REPLIES[locale] : FREE_DAILY_LIMIT_REPLIES[locale]
    return NextResponse.json({ error: message }, { status: 429 })
  }

  try {
    const recipe = await generateRecipeWithAnthropic(client, description, locale)

    try {
      await recordAiUsage(supabase, user.id, 'recipe_generation')
    } catch (error) {
      console.warn('[recipe-generation] failed to record AI usage', error)
    }

    return NextResponse.json({ recipe })
  } catch (err) {
    if (err instanceof RecipeGenerationDeclinedError) {
      // Claude ran but declined as off-topic rather than producing a recipe — don't charge
      // the daily cap for a "no". A free user only gets FREE_DAILY_AI_LIMIT tries a day, and
      // losing one to a decline (rather than a real answer) is a bad trade for the cost of
      // one skipped Anthropic call.
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    console.error('[recipe-generation] Anthropic error:', err)
    return NextResponse.json({ error: 'Unable to generate that recipe right now.' }, { status: 500 })
  }
}
