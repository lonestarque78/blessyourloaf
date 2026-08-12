import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FREE_DAILY_AI_LIMIT } from '@/lib/ai-usage'

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

const FAKE_REPLY = 'Use 1:1 whole wheat for bread flour, but add 5-10% more water — whole wheat drinks up more than white flour.'

// Mirrors the fakeSupabase helper in troubleshooter/route.test.ts, stateful across sequential
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

function requestWithMessage(content: string) {
  return new Request('http://localhost/api/ingredient-substitution', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content }] }),
  })
}

beforeEach(() => {
  mocks.createMock.mockReset()
  mocks.createMock.mockResolvedValue({ content: [{ type: 'text', text: FAKE_REPLY }] })
})

describe('POST /api/ingredient-substitution — daily AI cap', () => {
  it(`answers the first ${FREE_DAILY_AI_LIMIT} on-topic messages from a free-tier user, then blocks the next one without calling Anthropic`, async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      const res = await POST(requestWithMessage('What can I use instead of bread flour?'))
      const data = await res.json()
      expect(data.message).toBe(FAKE_REPLY)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)

    const blockedRes = await POST(requestWithMessage('What can I use instead of bread flour?'))
    const blockedData = await blockedRes.json()
    expect(blockedData.message).toContain(`${FREE_DAILY_AI_LIMIT} free AI actions`)
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)
  })

  it('never caps a paid (active-subscription) user', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 3; i++) {
      const res = await POST(requestWithMessage('What can I use instead of bread flour?'))
      const data = await res.json()
      expect(data.message).toBe(FAKE_REPLY)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 3)
  })
})

describe('POST /api/ingredient-substitution — on-topic enforcement', () => {
  it('short-circuits an obviously off-topic message without calling Anthropic', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    const res = await POST(requestWithMessage('Can you help me write a birthday card message for my sister?'))
    const data = await res.json()
    expect(data.message).toContain('sourdough')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })

  it('allows a substitution question that uses allergy/dietary language not in the base baking keyword list', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    const res = await POST(requestWithMessage("My kid is allergic to dairy, what can I use instead of the milk in this enriched loaf?"))
    const data = await res.json()
    expect(data.message).toBe(FAKE_REPLY)
    expect(mocks.createMock).toHaveBeenCalledTimes(1)
  })
})
