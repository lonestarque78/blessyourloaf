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

const FAKE_REPLY = 'Feed her again in 12 hours and keep her around 78°F.'

// Mirrors the fakeSupabase helper in src/lib/ai-usage.test.ts, but stateful across sequential
// calls within one test so it behaves like a real day's worth of usage accumulating.
// startingUsageCount lets a test start already partway (or all the way) through the day's
// quota, without looping the route dozens of times just to get there. Tracks row count and
// weighted units separately, same as the real table does: the free tier reads `count` (raw
// rows, via a head query that doesn't care about cost_weight), the paid tier reads `data` and
// sums cost_weight. A single insert affects both, but by different amounts (+1 row, +weight
// units) — collapsing them into one counter previously broke the free-tier simulation, since a
// free user's raw row count would then wrongly track this route's cost weight instead of 1.
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
            weightedUnits += AI_ACTION_COST_WEIGHT.troubleshooter
            return { error: null }
          }),
        }
      }
      if (table === 'profiles') return { select: vi.fn(() => profileQuery) }
      throw new Error(`unexpected table ${table}`)
    }),
  }
}

// No chatId appended, so the route never touches troubleshooter_chats — keeps this test
// focused on the quota gate rather than chat persistence.
function requestWithMessage(content: string) {
  const formData = new FormData()
  formData.append('messages', JSON.stringify([{ role: 'user', content }]))
  formData.append('starterContext', '')
  return new Request('http://localhost/api/troubleshooter', { method: 'POST', body: formData })
}

beforeEach(() => {
  mocks.createMock.mockReset()
  mocks.createMock.mockResolvedValue({ content: [{ type: 'text', text: FAKE_REPLY }] })
})

describe('POST /api/troubleshooter — daily AI cap', () => {
  it(`answers the first ${FREE_DAILY_AI_LIMIT} on-topic messages from a free-tier user, then blocks the next one without calling Anthropic`, async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      const res = await POST(requestWithMessage('My starter smells like acetone, what should I do?'))
      const data = await res.json()
      expect(data.message).toBe(FAKE_REPLY)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)

    const blockedRes = await POST(requestWithMessage('My starter smells like acetone, what should I do?'))
    const blockedData = await blockedRes.json()
    expect(blockedData.message).toContain(`${FREE_DAILY_AI_LIMIT} free AI actions`)
    // Still the same count as before — the blocked request never reached Anthropic.
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)
  })

  it('does not cap a paid (active-subscription) user at the free-tier limit', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 3; i++) {
      const res = await POST(requestWithMessage('My starter smells like acetone, what should I do?'))
      const data = await res.json()
      expect(data.message).toBe(FAKE_REPLY)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 3)
  })

  it('still caps a paid user at the fair-use limit once their weighted usage reaches PAID_DAILY_AI_LIMIT, with a fair-use (not free-tier) message', async () => {
    mocks.supabaseRef.current = fakeSupabase('active', PAID_DAILY_AI_LIMIT)

    const res = await POST(requestWithMessage('My starter smells like acetone, what should I do?'))
    const data = await res.json()
    expect(data.message).toContain('fair-use limit')
    expect(data.message).not.toContain('free AI actions')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })
})
