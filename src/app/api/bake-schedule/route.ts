import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are Miss Loretta Mae, the world's greatest sourdough baker — born and raised right there in Savannah, Georgia. You've been baking sourdough for fifty years, and your bread has won more ribbons at the state fair than anyone can count. You speak with that warm, honeyed Southern charm — you call folks "sugar," "honey," and "darlin'" like it's the most natural thing in the world.

But don't let that sweetness fool you, because you are also a precise, scientifically rigorous fermentation expert. You understand:
- How starter activity and rise percentage predict fermentation speed
- How hydration levels affect dough extensibility and fermentation rate
- How ambient temperature, flour protein content, and hydration interact
- The exact timing for bulk fermentation, cold proofing, and baking at each stage
- How a more active starter (higher rise %) means faster fermentation and shorter bulk times
- How different flour types (whole wheat, rye, AP, bread flour) affect fermentation speed

When given a recipe request, target date/time, and starter information, you calculate a precise bake schedule working backwards from the target completion time. A starter at 75% rise is moderately active; at 100%+ it's very active and will ferment 20–30% faster; at 25–50% it's sluggish and needs extra time.

You MUST return ONLY a valid JSON object — no markdown fences, no explanatory text before or after, no preamble, no "Here is your schedule" — just the raw JSON object starting with { and ending with }.

CRITICAL: Return ONLY a raw JSON object. No markdown. No code blocks. No backticks. No explanation. The very first character of your response must be { and the very last must be }

The JSON object has exactly this structure:
{
  "ingredients": [
    {
      "item": "string — ingredient name",
      "amount": "string — exact amount for a standard home baker batch (one loaf or equivalent)",
      "note": "string — optional note like 'room temperature' or 'active and bubbly'; use empty string if none"
    }
  ],
  "steps": [
    {
      "time": "string — the full formatted date and time (e.g. 'Friday, June 6 at 8:00 PM')",
      "action": "string — what to do",
      "duration": "string — how long it takes",
      "note": "string — your warm Southern tip or scientific explanation, in your voice"
    }
  ]
}

List every ingredient needed for the recipe with exact amounts based on a standard home baker batch size (typically one loaf or equivalent). Use the note field on ingredients for things like "room temperature", "active and bubbly", or "bread flour works best here" — leave it as an empty string if there's nothing worth noting.`

interface BakeScheduleRequest {
  recipe: string
  targetDate: string
  targetTime: string
  starterName: string
  starterActivity: number
  starterLastFed: string
  starterFlour: string
  starterHydration: number
}

export async function POST(request: Request) {
  let body: BakeScheduleRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    recipe,
    targetDate,
    targetTime,
    starterName,
    starterActivity,
    starterLastFed,
    starterFlour,
    starterHydration,
  } = body

  if (!recipe || !targetDate || !targetTime || !starterName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const userPrompt = `I want to bake: ${recipe}
Target completion: ${targetDate} at ${targetTime}

My starter details:
- Name: ${starterName}
- Current activity: ${starterActivity}% rise since last feeding
- Last fed: ${starterLastFed}
- Flour type: ${starterFlour}
- Hydration: ${starterHydration}%

Please calculate my complete bake schedule, working backwards from my target time. Factor in my starter's current activity level (${starterActivity}% rise) when determining fermentation timing. Return ONLY the JSON object with both ingredients and steps arrays.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    console.log('[bake-schedule] stop_reason:', message.stop_reason)
    if (message.stop_reason === 'max_tokens') {
      console.error('[bake-schedule] response truncated by max_tokens limit')
      return NextResponse.json({ error: 'Schedule response was truncated — try a simpler recipe or fewer steps' }, { status: 500 })
    }

    const content = message.content[0]
    console.log('[bake-schedule] content.type:', content.type)

    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type from Claude' }, { status: 500 })
    }

    console.log('[bake-schedule] raw text length:', content.text.length)
    console.log('[bake-schedule] raw text (first 500 chars):', JSON.stringify(content.text.slice(0, 500)))
    console.log('[bake-schedule] raw text (last 200 chars):', JSON.stringify(content.text.slice(-200)))

    let ingredients: unknown[], steps: unknown[]
    try {
      const raw = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      console.log('[bake-schedule] cleaned text (first 200 chars):', JSON.stringify(raw.slice(0, 200)))
      console.log('[bake-schedule] cleaned first char:', JSON.stringify(raw[0]), 'last char:', JSON.stringify(raw[raw.length - 1]))
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.steps) || !Array.isArray(parsed.ingredients)) {
        console.error('[bake-schedule] parsed JSON missing ingredients or steps arrays')
        return NextResponse.json({ error: 'Claude returned unexpected JSON structure', raw: content.text }, { status: 500 })
      }
      ingredients = parsed.ingredients
      steps = parsed.steps
      console.log('[bake-schedule] parse succeeded — ingredients:', ingredients.length, 'steps:', steps.length)
    } catch (parseErr) {
      console.error('[bake-schedule] JSON.parse failed:', parseErr)
      return NextResponse.json({ error: 'Claude returned invalid JSON', raw: content.text }, { status: 500 })
    }

    return NextResponse.json({ ingredients, steps })
  } catch (err) {
    console.error('Anthropic API error:', err)
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 })
  }
}
