import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AI_ACTION_COST_WEIGHT, FREE_DAILY_AI_LIMIT, PAID_DAILY_AI_LIMIT } from '@/lib/ai-usage'
import { VOICE_SYSTEM_PROMPT } from '@/lib/voice'
import { findVoiceViolations } from '@/lib/voice-compliance'

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

// Mirrors the STAY ON TOPIC escape hatch in SYSTEM_PROMPT: an empty ingredients array is how
// a decline is signaled, same idea as recipe-generation's empty-title sentinel.
const DECLINE_JSON = JSON.stringify({
  ingredients: [],
  steps: [{ time: '', action: "This doesn't look like a baking request I can schedule.", duration: '', note: 'Tell me what you would like to bake, and a target date and time.', phase: 'other' }],
})

// Mirrors the fakeSupabase helper in src/lib/ai-usage.test.ts, but stateful across sequential
// calls within one test so it behaves like a real day's worth of usage accumulating. Tracks
// row count and weighted units separately, same as the real table does: the free tier reads
// `count` (raw rows, via a head query that doesn't care about cost_weight), the paid tier reads
// `data` and sums cost_weight. A single insert affects both, but by different amounts (+1 row,
// +weight units) — collapsing them into one counter breaks the free-tier simulation, since a
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
            weightedUnits += AI_ACTION_COST_WEIGHT.bake_schedule
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
    expect(blockedData.error).toContain(`${FREE_DAILY_AI_LIMIT} free actions`)
    // Still the same count as before — the blocked request never reached Anthropic.
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT)
  })

  it('does not cap a paid (active-subscription) user at the free-tier limit', async () => {
    mocks.supabaseRef.current = fakeSupabase('active')

    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 2; i++) {
      const res = await POST(scheduleRequest())
      expect(res.status).toBe(200)
    }
    expect(mocks.createMock).toHaveBeenCalledTimes(FREE_DAILY_AI_LIMIT + 2)
  })

  it('still caps a paid user at the fair-use limit once their weighted usage reaches PAID_DAILY_AI_LIMIT, with a fair-use (not free-tier) message', async () => {
    mocks.supabaseRef.current = fakeSupabase('active', PAID_DAILY_AI_LIMIT)

    const res = await POST(scheduleRequest())
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toContain('fair-use limit')
    expect(data.error).not.toContain('free actions')
    expect(mocks.createMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/bake-schedule — on-topic enforcement', () => {
  it("does not charge the daily cap for a Claude-level decline (empty ingredients) — a free user shouldn't lose an action to being told no", async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    mocks.createMock.mockResolvedValue({ stop_reason: 'end_turn', content: [{ type: 'text', text: DECLINE_JSON }] })

    const res = await POST(scheduleRequest())
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.error).toContain("doesn't look like a baking request")

    // Confirm the decline did NOT consume any of the free daily actions: all
    // FREE_DAILY_AI_LIMIT of them should still be available.
    mocks.createMock.mockResolvedValue({ stop_reason: 'end_turn', content: [{ type: 'text', text: FAKE_SCHEDULE_JSON }] })
    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) {
      const okRes = await POST(scheduleRequest())
      expect(okRes.status).toBe(200)
    }
    const cappedRes = await POST(scheduleRequest())
    expect(cappedRes.status).toBe(429)
  })
})

describe('POST /api/bake-schedule — VOICE.md compliance', () => {
  it('sends the shared VOICE_SYSTEM_PROMPT to Claude, not a route-local paraphrase', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')

    await POST(scheduleRequest())

    const sentSystemPrompt = mocks.createMock.mock.calls[0][0].system as string
    expect(sentSystemPrompt).toContain(VOICE_SYSTEM_PROMPT)
  })

  it('would catch an em dash inside a JSON note field, not just in chat prose', async () => {
    mocks.supabaseRef.current = fakeSupabase('inactive')
    mocks.createMock.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify({
        ingredients: [{ item: 'Bread flour', amount: '500g', note: '' }],
        steps: [{ time: 'Friday, June 6 at 8:00 PM', action: 'Mix dough', duration: '20 min', note: 'Room temperature flour works best — cold flour slows the mix.', phase: 'bulk_fermentation' }],
      }) }],
    })

    const res = await POST(scheduleRequest())
    const data = await res.json()

    expect(findVoiceViolations(data.steps[0].note)).toContain('em_or_en_dash')
  })
})
