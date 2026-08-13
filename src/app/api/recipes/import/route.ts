import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import {
  buildRecipeFromJsonLd,
  buildRecipeImportFallback,
  cleanupRecipeWithAnthropic,
  extractRecipeJsonLd,
  extractRecipeTextFromHtml,
} from '@/lib/recipe-import'
import { createClient } from '@/lib/supabase/server'
import { getAiQuotaStatus, recordAiUsage } from '@/lib/ai-usage'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/i18n/locale'

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null

// See bake-schedule/route.ts for why this is set explicitly rather than left to Vercel's
// platform default. Smallest max_tokens of the three AI routes (2400), but this one also
// fetches the source URL first — a slow site adds to total request time before the AI call
// even starts.
export const maxDuration = 60

type AiSkipReason = 'not_configured' | 'quota_exceeded' | 'ai_error'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url, rawText, locale: localeField } = await request.json()
    const locale = isSupportedLocale(localeField) ? localeField : DEFAULT_LOCALE

    if (!url && !rawText) {
      return NextResponse.json({ error: 'Please provide a recipe URL or raw text.' }, { status: 400 })
    }

    let text = typeof rawText === 'string' ? rawText : ''
    let structuredRecipe = null as ReturnType<typeof buildRecipeFromJsonLd>

    if (typeof url === 'string' && url.trim()) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlessYourLoaf/1.0; +https://blessyourloaf.com)',
        },
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'We could not fetch that recipe URL.' }, { status: 400 })
      }

      const html = await response.text()
      const recipeLd = extractRecipeJsonLd(html)
      if (recipeLd) structuredRecipe = buildRecipeFromJsonLd(recipeLd)
      if (!structuredRecipe) text = extractRecipeTextFromHtml(html)
    }

    // A site with embedded schema.org Recipe data gives a far more reliable result than
    // scraping rendered text — skip the AI-cleanup/heuristic-fallback path entirely (no AI
    // call, no quota spent) when we have one.
    if (structuredRecipe) {
      return NextResponse.json({ recipe: structuredRecipe, source: 'structured-data' })
    }

    let recipe = buildRecipeImportFallback(text)
    let source: 'anthropic' | 'fallback' = 'fallback'
    let aiSkipReason: AiSkipReason | undefined

    if (!anthropic) {
      aiSkipReason = 'not_configured'
    } else {
      let remaining: number
      try {
        remaining = (await getAiQuotaStatus(supabase, user.id)).remaining
      } catch (error) {
        console.warn('[recipe-import] quota check failed, falling back to heuristic parser', error)
        remaining = 0
        aiSkipReason = 'ai_error'
      }

      if (remaining > 0) {
        try {
          recipe = await cleanupRecipeWithAnthropic(anthropic, text, typeof url === 'string' ? url : undefined, locale)
          source = 'anthropic'
        } catch (error) {
          console.warn('[recipe-import] AI cleanup failed, falling back to heuristic parser', error)
          aiSkipReason = 'ai_error'
        }

        if (source === 'anthropic') {
          try {
            await recordAiUsage(supabase, user.id, 'recipe_import')
          } catch (error) {
            console.warn('[recipe-import] failed to record AI usage', error)
          }
        }
      } else if (!aiSkipReason) {
        aiSkipReason = 'quota_exceeded'
      }
    }

    return NextResponse.json({ recipe, source, ...(aiSkipReason ? { aiSkipReason } : {}) })
  } catch (error) {
    console.error('[recipe-import] error', error)
    return NextResponse.json({ error: 'Unable to import that recipe right now.' }, { status: 500 })
  }
}
