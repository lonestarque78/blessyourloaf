import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AI_ACTION_COST_WEIGHT, FREE_DAILY_AI_LIMIT, PAID_DAILY_AI_LIMIT } from '@/lib/ai-usage'

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
  title: 'Classic Sourdough Boule',
  description: 'A simple crusty loaf.',
  category: 'loaf',
  difficulty: 'intermediate',
  prep_time_minutes: 30,
  bake_time_minutes: 45,
  notes: '',
  ingredients: [{ item: 'bread flour', amount: '500g', note: '' }],
  steps: [{ title: 'Mix', description: 'Combine ingredients.', duration_minutes: 10 }],
})

// Mirrors the fakeSupabase helper in src/lib/ai-usage.test.ts, but stateful across sequential
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
            weightedUnits += AI_ACTION_COST_WEIGHT.recipe_import
            return { error: null }
          }),
        }
      }
      if (table === 'profiles') return { select: vi.fn(() => profileQuery) }
      throw new Error(`unexpected table ${table}`)
    }),
  }
}

// rawText only (no url) so the route never hits the network fetch() path — keeps this test
// focused on the quota gate rather than URL scraping.
function importRequest() {
  return new Request('http://localhost/api/recipes/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText: 'Messy pinned recipe text: flour, water, salt. Mix, rest, bake.' }),
  })
}

beforeEach(() => {
  mocks.createMock.mockReset()
  mocks.createMock.mockResolvedValue({ content: [{ type: 'text', text: FAKE_RECIPE_JSON }] })
})

describe('POST /api/recipes/import — daily AI cap', () => {
  it(`uses Anthropic cleanup for the first ${FREE_DAILY_AI_LIMIT} imports from a free-tier user, then falls back to the heuristic parser`, async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      const res = await POST(importRequest())
      const data = await res.json()
      expect(data.source).toBe('anthropic')
      expect(data.recipe.title).toBe('Classic Sourdough Boule')
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)

    const blockedRes = await POST(importRequest())
    const blockedData = await blockedRes.json()
    expect(blockedData.source).toBe('fallback')
    expect(blockedData.aiSkipReason).toBe('quota_exceeded')
    // Still the same count as before — the blocked request never reached Anthropic.
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)
  })

  it('does not cap a paid (active-subscription) user at the free-tier limit', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 2; i++) {
      const res = await POST(importRequest())
      const data = await res.json()
      expect(data.source).toBe('anthropic')
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 2)
  })

  it('still caps a paid user at the fair-use limit once their weighted usage reaches PAID_DAILY_AI_LIMIT, falling back to the heuristic parser like a capped free user does', async () => {
    mocks.supabaseRef.current = fakeSupabase('active', PAID_DAILY_AI_LIMIT)

    const res = await POST(importRequest())
    const data = await res.json()
    expect(data.source).toBe('fallback')
    expect(data.aiSkipReason).toBe('quota_exceeded')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })
})
