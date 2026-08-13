import { describe, expect, it, vi } from 'vitest'
import { AI_ACTION_COST_WEIGHT, FREE_DAILY_AI_LIMIT, PAID_DAILY_AI_LIMIT, getAiQuotaStatus, isPaidUser, recordAiUsage } from './ai-usage'

// usageCount doubles as both "raw row count" (what the free-tier path selects with a head
// query) and "already-consumed weighted units" (what the paid-tier path sums from cost_weight)
// — represented here as a single row whose cost_weight equals the running total, since
// getAiQuotaStatus only ever reduces over cost_weight and never inspects row identity.
function fakeSupabase({
  usageCount,
  usageError,
  insertError,
  profile,
  profileError,
}: {
  usageCount?: number
  usageError?: Error
  insertError?: Error
  profile?: { subscription_status: string } | null
  profileError?: Error
} = {}) {
  const insert = vi.fn(async () => ({ error: insertError ?? null }))

  const usageQuery = {
    eq: vi.fn(function (this: typeof usageQuery) { return this }),
    gte: vi.fn(async () => ({
      count: usageCount ?? 0,
      data: usageCount ? [{ cost_weight: usageCount }] : [],
      error: usageError ?? null,
    })),
  }

  const profileQuery = {
    eq: vi.fn(function (this: typeof profileQuery) { return this }),
    maybeSingle: vi.fn(async () => ({ data: profile ?? null, error: profileError ?? null })),
  }

  const from = vi.fn((table: string) => {
    if (table === 'ai_usage_events') return { select: vi.fn(() => usageQuery), insert }
    if (table === 'profiles') return { select: vi.fn(() => profileQuery) }
    throw new Error(`unexpected table ${table}`)
  })

  return { from, insert } as unknown as { from: typeof from; insert: typeof insert }
}

describe('isPaidUser', () => {
  it('is true when subscription_status is active', async () => {
    const supabase = fakeSupabase({ profile: { subscription_status: 'active' } })
    expect(await isPaidUser(supabase as never, 'user-1')).toBe(true)
  })

  it.each(['past_due', 'inactive', 'canceled'])('is false when subscription_status is %s', async status => {
    const supabase = fakeSupabase({ profile: { subscription_status: status } })
    expect(await isPaidUser(supabase as never, 'user-1')).toBe(false)
  })

  it('is false when the user has no profile row', async () => {
    const supabase = fakeSupabase({ profile: null })
    expect(await isPaidUser(supabase as never, 'user-1')).toBe(false)
  })

  it('throws if the profile query fails', async () => {
    const supabase = fakeSupabase({ profileError: new Error('db down') })
    await expect(isPaidUser(supabase as never, 'user-1')).rejects.toThrow('db down')
  })
})

describe('getAiQuotaStatus', () => {
  it('returns the full free limit when a free user has no usage today', async () => {
    const supabase = fakeSupabase({ usageCount: 0, profile: { subscription_status: 'inactive' } })
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    expect(status).toEqual({ remaining: FREE_DAILY_AI_LIMIT, limit: FREE_DAILY_AI_LIMIT, isPaid: false })
  })

  it('subtracts today\'s usage from the free limit', async () => {
    const supabase = fakeSupabase({ usageCount: 1, profile: { subscription_status: 'inactive' } })
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    expect(status.remaining).toBe(FREE_DAILY_AI_LIMIT - 1)
  })

  it('never returns a negative remaining count for a free user', async () => {
    const supabase = fakeSupabase({ usageCount: 99, profile: { subscription_status: 'inactive' } })
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    expect(status.remaining).toBe(0)
  })

  it('gives a paid user the higher PAID_DAILY_AI_LIMIT, not unlimited', async () => {
    const supabase = fakeSupabase({ usageCount: 3, profile: { subscription_status: 'active' } })
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    expect(status).toEqual({ remaining: PAID_DAILY_AI_LIMIT - 3, limit: PAID_DAILY_AI_LIMIT, isPaid: true })
  })

  it('caps a paid user at 0 remaining once they cross PAID_DAILY_AI_LIMIT, rather than staying unbounded', async () => {
    const supabase = fakeSupabase({ usageCount: PAID_DAILY_AI_LIMIT + 10, profile: { subscription_status: 'active' } })
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    expect(status.remaining).toBe(0)
    expect(status.isPaid).toBe(true)
  })

  it('throws if the usage query fails', async () => {
    const supabase = fakeSupabase({ usageError: new Error('db down'), profile: { subscription_status: 'inactive' } })
    await expect(getAiQuotaStatus(supabase as never, 'user-1')).rejects.toThrow('db down')
  })

  it('weights a paid user\'s usage by cost, not raw row count — a few expensive actions can exhaust the budget faster than the same number of cheap ones', async () => {
    const usageQuery = {
      eq: vi.fn(function (this: typeof usageQuery) { return this }),
      gte: vi.fn(async () => ({
        data: [
          { cost_weight: AI_ACTION_COST_WEIGHT.bake_schedule },
          { cost_weight: AI_ACTION_COST_WEIGHT.bake_schedule },
          { cost_weight: AI_ACTION_COST_WEIGHT.ingredient_substitution },
        ],
        error: null,
      })),
    }
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'ai_usage_events') return { select: vi.fn(() => usageQuery) }
        if (table === 'profiles') {
          return { select: vi.fn(() => ({ eq: vi.fn(function (this: unknown) { return this }), maybeSingle: vi.fn(async () => ({ data: { subscription_status: 'active' }, error: null })) })) }
        }
        throw new Error(`unexpected table ${table}`)
      }),
    }
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    const expectedUsedUnits = 2 * AI_ACTION_COST_WEIGHT.bake_schedule + AI_ACTION_COST_WEIGHT.ingredient_substitution
    expect(status.remaining).toBe(PAID_DAILY_AI_LIMIT - expectedUsedUnits)
  })

  it('treats a free user\'s usage as a flat action count regardless of which actions they used — free tier is intentionally left unweighted', async () => {
    const supabase = fakeSupabase({ usageCount: 1, profile: { subscription_status: 'inactive' } })
    const status = await getAiQuotaStatus(supabase as never, 'user-1')
    expect(status.remaining).toBe(FREE_DAILY_AI_LIMIT - 1)
    expect(status.limit).toBe(FREE_DAILY_AI_LIMIT)
  })
})

describe('recordAiUsage', () => {
  it('inserts a usage event scoped to the user and action, tagged with that action\'s cost weight', async () => {
    const supabase = fakeSupabase()
    await recordAiUsage(supabase as never, 'user-1', 'recipe_import')
    expect(supabase.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      action: 'recipe_import',
      cost_weight: AI_ACTION_COST_WEIGHT.recipe_import,
    })
  })

  it('throws if the insert fails', async () => {
    const supabase = fakeSupabase({ insertError: new Error('insert failed') })
    await expect(recordAiUsage(supabase as never, 'user-1', 'recipe_import')).rejects.toThrow('insert failed')
  })
})
