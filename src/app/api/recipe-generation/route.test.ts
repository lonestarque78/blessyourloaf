import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AI_ACTION_COST_WEIGHT, FREE_DAILY_AI_LIMIT, PAID_DAILY_AI_LIMIT } from '@/lib/ai-usage'
import { VOICE_SYSTEM_PROMPT } from '@/lib/voice'
import { findVoiceViolations } from '@/lib/voice-compliance'

process.env.ANTHROPIC_API_KEY = 'test-key'

const mocks = vi.hoisted(() => ({
  createMock: vi.fn(),
  supabaseRef: { current: null as unknown },
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mocks.createMock }
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mocks.supabaseRef.current,
}))

const { POST } = await import('./route')

const FAKE_RECIPE_JSON = JSON.stringify({
  title: 'Rosemary Olive Oil Boule',
  description: 'A fragrant, crusty loaf perfect alongside soup.',
  category: 'loaf',
  difficulty: 'intermediate',
  prep_time_minutes: 30,
  bake_time_minutes: 45,
  notes: '',
  ingredients: [{ amount: '500g', item: 'bread flour', note: '' }],
  steps: [{ title: 'Mix', description: 'Combine ingredients.', duration_minutes: 10 }],
})

const DECLINE_JSON = JSON.stringify({
  title: '',
  description: "This doesn't look like a sourdough baking request I can help with.",
  category: 'other',
  difficulty: 'beginner',
  prep_time_minutes: null,
  bake_time_minutes: null,
  notes: 'Tell me what you would like to bake.',
  ingredients: [],
  steps: [],
})

// Mirrors the fakeSupabase helper in troubleshooter/route.test.ts, stateful across sequential
// calls within one test so it behaves like a real day's worth of usage accumulating.
// Tracks row count and weighted units separately, same as the real table does: the free tier
// reads `count` (raw rows, via a head query that doesn't care about cost_weight), the paid
// tier reads `data` and sums cost_weight. A single insert affects both, but by different
// amounts (+1 row, +weight units) — collapsing them into one counter breaks the free-tier
// simulation, since a free user's raw row count would then wrongly track this route's cost
// weight instead of 1.
function fakeSupabase(subscriptionStatus: string, startingUsageCount = 0) {
  let rowCount = startingUsageCount
  let weightedUnits = startingUsageCount

  const usageQuery = {
    eq: vi.fn(function (this: typeof usageQuery) { return this }),
    gte: vi.fn(async () => ({
      count: rowCount,
      data: weightedUnits ? [{ cost_weight: weightedUnits }] : [],
      error: null,
    })),
  }
  const profileQuery = {
    eq: vi.fn(function (this: typeof profileQuery) { return this }),
    maybeSingle: vi.fn(async () => ({ data: { subscription_status: subscriptionStatus }, error: null })),
  }

  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
    from: vi.fn((table: string) => {
      if (table === 'ai_usage_events') {
        return {
          select: vi.fn(() => usageQuery),
          insert: vi.fn(async () => {
            rowCount += 1
            weightedUnits += AI_ACTION_COST_WEIGHT.recipe_generation
            return { error: null }
          }),
        }
      }
      if (table === 'profiles') return { select: vi.fn(() => profileQuery) }
      throw new Error(`unexpected table ${table}`)
    }),
  }
}

function generateRequest(description: string) {
  return new Request('http://localhost/api/recipe-generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })
}

beforeEach(() => {
  mocks.createMock.mockReset()
  mocks.createMock.mockResolvedValue({ content: [{ type: 'text', text: FAKE_RECIPE_JSON }] })
})

describe('POST /api/recipe-generation — daily AI cap', () => {
  it(`generates the first ${FREE_DAILY_AI_LIMIT} recipes for a free-tier user, then returns 429 without calling Anthropic`, async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      const res = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
      const data = await res.json()
      expect(res.status).toBe(200)
      expect(data.recipe.title).toBe('Rosemary Olive Oil Boule')
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)

    const blockedRes = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
    expect(blockedRes.status).toBe(429)
    const blockedData = await blockedRes.json()
    expect(blockedData.error).toContain(`${FREE_DAILY_AI_LIMIT} free actions`)
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)
  })

  it('does not cap a paid (active-subscription) user at the free-tier limit', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 2; i++) {
      const res = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
      expect(res.status).toBe(200)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 2)
  })

  it('still caps a paid user at the fair-use limit once their weighted usage reaches PAID_DAILY_AI_LIMIT — recipe generation is weighted heavier than a chat message, so it exhausts the budget faster', async () => {
    mocks.supabaseRef.current = fakeSupabase('active', PAID_DAILY_AI_LIMIT)

    const res = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toContain('fair-use limit')
    expect(data.error).not.toContain('free actions')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/recipe-generation — on-topic enforcement', () => {
  it('short-circuits an obviously off-topic description without calling Anthropic', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    const res = await POST(generateRequest('Can you help me write a birthday card message for my sister?'))
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.error).toContain('sourdough')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })

  it("counts a Claude-level decline (empty title) against the daily cap, since the API call still ran", async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    mocks.createMock.mockResolvedValue({ content: [{ type: 'text', text: DECLINE_JSON }] })

    const res = await POST(generateRequest('Bake me something that is technically about bread but is actually a trick request'))
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.error).toContain("doesn't look like a sourdough baking request")

    // Confirm the decline consumed one of the free daily actions: FREE_DAILY_AI_LIMIT - 1
    // more successful generations should be allowed before the cap kicks in.
    mocks.createMock.mockResolvedValue({ content: [{ type: 'text', text: FAKE_RECIPE_JSON }] })
    for (let i = 0; i < FREE_DAILY_AI_LIMIT - 1; i++) {
      const okRes = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
      expect(okRes.status).toBe(200)
    }
    const cappedRes = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
    expect(cappedRes.status).toBe(429)
  })
})

describe('POST /api/recipe-generation — VOICE.md compliance', () => {
  it('sends the shared VOICE_SYSTEM_PROMPT to Claude, not a route-local paraphrase', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    await POST(generateRequest('A rosemary olive oil boule for a dinner party'))

    const sentSystemPrompt = mocks.createMock.mock.calls[0][0].system as string
    expect(sentSystemPrompt).toContain(VOICE_SYSTEM_PROMPT)
  })

  it('would catch an em dash inside a generated recipe field, not just in chat prose', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    mocks.createMock.mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify({
      title: 'Rosemary Olive Oil Boule',
      description: 'A fragrant, crusty loaf — perfect alongside soup.',
      category: 'loaf',
      difficulty: 'intermediate',
      prep_time_minutes: 30,
      bake_time_minutes: 45,
      notes: '',
      ingredients: [{ amount: '500g', item: 'bread flour', note: '' }],
      steps: [{ title: 'Mix', description: 'Combine ingredients.', duration_minutes: 10 }],
    }) }] })

    const res = await POST(generateRequest('A rosemary olive oil boule for a dinner party'))
    const data = await res.json()

    expect(findVoiceViolations(data.recipe.description)).toContain('em_or_en_dash')
  })
})
