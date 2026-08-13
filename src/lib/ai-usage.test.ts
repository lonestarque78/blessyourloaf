import { describe, expect, it, vi } from 'vitest'
import { FREE_DAILY_AI_LIMIT, PAID_DAILY_AI_LIMIT, getAiQuotaStatus, isPaidUser, recordAiUsage } from './ai-usage'

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
    gte: vi.fn(async () => ({ count: usageCount ?? 0, error: usageError ?? null })),
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
})

describe('recordAiUsage', () => {
  it('inserts a usage event scoped to the user and action', async () => {
    const supabase = fakeSupabase()
    await recordAiUsage(supabase as never, 'user-1', 'recipe_import')
    expect(supabase.insert).toHaveBeenCalledWith({ user_id: 'user-1', action: 'recipe_import' })
  })

  it('throws if the insert fails', async () => {
    const supabase = fakeSupabase({ insertError: new Error('insert failed') })
    await expect(recordAiUsage(supabase as never, 'user-1', 'recipe_import')).rejects.toThrow('insert failed')
  })
})
