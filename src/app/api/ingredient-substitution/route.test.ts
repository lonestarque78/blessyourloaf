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

const FAKE_REPLY = 'Use 1:1 whole wheat for bread flour, but add 5-10% more water — whole wheat drinks up more than white flour.'

// Mirrors the fakeSupabase helper in troubleshooter/route.test.ts, stateful across sequential
// calls within one test so it behaves like a real day's worth of usage accumulating.
// chatUpdates records every ingredient_substitution_chats update, so persistence tests can
// assert on what actually got written without a real database.
// Tracks row count and weighted units separately, same as the real table does: the free tier
// reads `count` (raw rows, via a head query that doesn't care about cost_weight), the paid
// tier reads `data` and sums cost_weight. A single insert affects both, but by different
// amounts (+1 row, +weight units) — collapsing them into one counter breaks the free-tier
// simulation, since a free user's raw row count would then wrongly track this route's cost
// weight instead of 1.
function fakeSupabase(subscriptionStatus: string, chatUpdates: Array<{ id: string; messages: unknown }> = [], startingUsageCount = 0) {
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
            weightedUnits += AI_ACTION_COST_WEIGHT.ingredient_substitution
            return { error: null }
          }),
        }
      }
      if (table === 'profiles') return { select: vi.fn(() => profileQuery) }
      if (table === 'ingredient_substitution_chats') {
        return {
          update: vi.fn((values: { messages: unknown }) => {
            const chatQuery = {
              eq: vi.fn(function (this: typeof chatQuery, column: string, value: string) {
                if (column === 'id') chatUpdates.push({ id: value, messages: values.messages })
                return this
              }),
            }
            return chatQuery
          }),
        }
      }
      throw new Error(`unexpected table ${table}`)
    }),
  }
}

function requestWithMessage(content: string, chatId?: string) {
  return new Request('http://localhost/api/ingredient-substitution', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content }], ...(chatId ? { chatId } : {}) }),
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

  it('does not cap a paid (active-subscription) user at the free-tier limit', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 3; i++) {
      const res = await POST(requestWithMessage('What can I use instead of bread flour?'))
      const data = await res.json()
      expect(data.message).toBe(FAKE_REPLY)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 3)
  })

  it('still caps a paid user at the fair-use limit once their weighted usage reaches PAID_DAILY_AI_LIMIT, with a fair-use (not free-tier) message', async () => {
    mocks.supabaseRef.current = fakeSupabase('active', [], PAID_DAILY_AI_LIMIT)

    const res = await POST(requestWithMessage('What can I use instead of bread flour?'))
    const data = await res.json()
    expect(data.message).toContain('fair-use limit')
    expect(data.message).not.toContain('free AI actions')
    expect(mocks.createMock).not.toHaveBeenCalled()
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

describe('POST /api/ingredient-substitution — chat persistence', () => {
  it('appends the assistant reply to the chat row when a chatId is provided', async () => {
    const chatUpdates: Array<{ id: string; messages: unknown }> = []
    mocks.supabaseRef.current = fakeSupabase('inactive', chatUpdates)

    await POST(requestWithMessage('What can I use instead of bread flour?', 'chat-123'))

    expect(chatUpdates).toHaveLength(1)
    expect(chatUpdates[0].id).toBe('chat-123')
    expect(chatUpdates[0].messages).toEqual([
      { role: 'user', content: 'What can I use instead of bread flour?' },
      { role: 'assistant', content: FAKE_REPLY },
    ])
  })

  it('persists the daily-limit reply too, so a resumed chat shows why the AI stopped responding', async () => {
    const chatUpdates: Array<{ id: string; messages: unknown }> = []
    mocks.supabaseRef.current = fakeSupabase('inactive', chatUpdates)

    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      await POST(requestWithMessage('What can I use instead of bread flour?', 'chat-123'))
    }
    chatUpdates.length = 0 // only care about the blocked call below

    await POST(requestWithMessage('What can I use instead of bread flour?', 'chat-123'))

    expect(chatUpdates).toHaveLength(1)
    const lastMessage = (chatUpdates[0].messages as Array<{ role: string; content: string }>).at(-1)
    expect(lastMessage?.role).toBe('assistant')
    expect(lastMessage?.content).toContain(`${FREE_DAILY_AI_LIMIT} free AI actions`)
  })

  it('never touches the chats table when no chatId is provided', async () => {
    const chatUpdates: Array<{ id: string; messages: unknown }> = []
    mocks.supabaseRef.current = fakeSupabase('inactive', chatUpdates)

    await POST(requestWithMessage('What can I use instead of bread flour?'))

    expect(chatUpdates).toHaveLength(0)
  })
})
