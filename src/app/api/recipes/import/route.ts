import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { buildRecipeImportFallback, cleanupRecipeWithAnthropic, extractRecipeTextFromHtml } from '@/lib/recipe-import'
import { createClient } from '@/lib/supabase/server'
import { getRemainingFreeAiActions, recordAiUsage } from '@/lib/ai-usage'

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null

type AiSkipReason = 'not_configured' | 'quota_exceeded' | 'ai_error'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url, rawText } = await request.json()

    if (!url && !rawText) {
      return NextResponse.json({ error: 'Please provide a recipe URL or raw text.' }, { status: 400 })
    }

    let text = typeof rawText === 'string' ? rawText : ''

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
      text = extractRecipeTextFromHtml(html)
    }

    let recipe = buildRecipeImportFallback(text)
    let source: 'anthropic' | 'fallback' = 'fallback'
    let aiSkipReason: AiSkipReason | undefined

    if (!anthropic) {
      aiSkipReason = 'not_configured'
    } else {
      let remaining: number
      try {
        remaining = await getRemainingFreeAiActions(supabase, user.id)
      } catch (error) {
        console.warn('[recipe-import] quota check failed, falling back to heuristic parser', error)
        remaining = 0
        aiSkipReason = 'ai_error'
      }

      if (remaining > 0) {
        try {
          recipe = await cleanupRecipeWithAnthropic(anthropic, text, typeof url === 'string' ? url : undefined)
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
