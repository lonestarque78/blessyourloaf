import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AI_ACTION_COST_WEIGHT, FREE_DAILY_AI_LIMIT, PAID_DAILY_AI_LIMIT } from '@/lib/ai-usage'
import { VOICE_SYSTEM_PROMPT } from '@/lib/voice'
import { evaluateCeliacResponse, findVoiceViolations } from '@/lib/voice-compliance'

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
    expect(blockedData.message).toContain(`${FREE_DAILY_AI_LIMIT} free actions`)
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
    expect(data.message).not.toContain('free actions')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/troubleshooter — VOICE.md compliance', () => {
  it('sends the shared VOICE_SYSTEM_PROMPT to Claude, not a route-local paraphrase', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    await POST(requestWithMessage('My starter smells like acetone, what should I do?'))

    const sentSystemPrompt = mocks.createMock.mock.calls[0][0].system as string
    expect(sentSystemPrompt).toContain(VOICE_SYSTEM_PROMPT)
  })

  it('would catch an em dash if Claude ever put one in a reply', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    mocks.createMock.mockResolvedValueOnce({ content: [{ type: 'text', text: "That's hooch — she's fine, just hungry." }] })

    const res = await POST(requestWithMessage('My starter smells like acetone, what should I do?'))
    const data = await res.json()

    expect(findVoiceViolations(data.message)).toContain('em_or_en_dash')
  })

  it('would catch a hedged celiac answer in English', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    const userMessage = 'Is sourdough safe for my sister? She has celiac and I want to know about the gluten.'
    mocks.createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Some people with celiac find they can tolerate a little sourdough in moderation, so it might be okay to try a small amount and see how she feels.' }],
    })

    const res = await POST(requestWithMessage(userMessage))
    const data = await res.json()

    const evaluation = evaluateCeliacResponse(userMessage, data.message)
    expect(evaluation.raisesTopic).toBe(true)
    expect(evaluation.compliant).toBe(false)
  })

  it('would catch a hedged celiac answer in Spanish', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    const formData = new FormData()
    const userMessage = '¿Es segura la masa madre para alguien con celiaquía? Quiero saber sobre el gluten.'
    formData.append('messages', JSON.stringify([{ role: 'user', content: userMessage }]))
    formData.append('starterContext', '')
    formData.append('locale', 'es')
    mocks.createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Algunas personas toleran la masa madre en pequeñas cantidades, así que podría estar bien probar un poco si tienes cuidado.' }],
    })

    const res = await POST(new Request('http://localhost/api/troubleshooter', { method: 'POST', body: formData }))
    const data = await res.json()

    const evaluation = evaluateCeliacResponse(userMessage, data.message)
    expect(evaluation.raisesTopic).toBe(true)
    expect(evaluation.compliant).toBe(false)
  })

  it('accepts a compliant celiac answer as compliant (sanity check the checker isn\'t just always failing)', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    const userMessage = 'Is sourdough safe for my sister? She has celiac and I want to know about the gluten.'
    mocks.createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: "No, and I want to be straight with you about this one. The long fermentation does break down some of the gluten, but it doesn't get rid of it. Sourdough is not gluten free and it isn't safe for celiac disease. That's a conversation for her doctor rather than me." }],
    })

    const res = await POST(requestWithMessage(userMessage))
    const data = await res.json()

    const evaluation = evaluateCeliacResponse(userMessage, data.message)
    expect(evaluation.compliant).toBe(true)
    expect(findVoiceViolations(data.message)).toEqual([])
  })
})
