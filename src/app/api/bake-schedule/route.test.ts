import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FREE_DAILY_AI_LIMIT } from '@/lib/ai-usage'

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

const FAKE_SCHEDULE_JSON = JSON.stringify({
  ingredients: [{ item: 'Bread flour', amount: '500g', note: '' }],
  steps: [{ time: 'Friday, June 6 at 8:00 PM', action: 'Mix dough', duration: '20 min', note: '', phase: 'bulk_fermentation' }],
})

// Mirrors the fakeSupabase helper in src/lib/ai-usage.test.ts, but stateful across sequential
// calls within one test so it behaves like a real day's worth of usage accumulating.
function fakeSupabase(subscriptionStatus: string) {
  let usageCount = 0

  const usageQuery = {
    eq: vi.fn(function (this: typeof usageQuery) { return this }),
    gte: vi.fn(async () => ({ count: usageCount, error: null })),
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
            usageCount += 1
            return { error: null }
          }),
        }
      }
      if (table === 'profiles') return { select: vi.fn(() => profileQuery) }
      throw new Error(`unexpected table ${table}`)
    }),
  }
}

function scheduleRequest() {
  return new Request('http://localhost/api/bake-schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipe: 'Classic sourdough boule',
      targetDate: 'Saturday, June 7',
      targetTime: '10:00 AM',
      starterName: 'Bertha',
      starterActivity: 80,
      starterLastFed: '6 hours ago',
      starterFlour: 'bread flour',
      starterHydration: 100,
    }),
  })
}

beforeEach(() => {
  mocks.createMock.mockReset()
  mocks.createMock.mockResolvedValue({
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: FAKE_SCHEDULE_JSON }],
  })
})

describe('POST /api/bake-schedule — daily AI cap', () => {
  it(`generates the first ${FREE_DAILY_AI_LIMIT} schedules for a free-tier user, then returns 429 without calling Anthropic`, async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      const res = await POST(scheduleRequest())
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.steps).toHaveLength(1)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)

    const blockedRes = await POST(scheduleRequest())
    expect(blockedRes.status).toBe(429)
    const blockedData = await blockedRes.json()
    expect(blockedData.error).toContain(`${FREE_DAILY_AI_LIMIT} free AI actions`)
    // Still the same count as before — the blocked request never reached Anthropic.
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)
  })

  it('never caps a paid (active-subscription) user', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 2; i++) {
      const res = await POST(scheduleRequest())
      expect(res.status).toBe(200)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 2)
  })
})
