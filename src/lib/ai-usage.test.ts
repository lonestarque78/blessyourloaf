import { describe, expect, it, vi } from 'vitest'
import { FREE_DAILY_AI_LIMIT, getRemainingFreeAiActions, recordAiUsage } from './ai-usage'

function fakeSupabase({ count, selectError, insertError }: { count?: number; selectError?: Error; insertError?: Error } = {}) {
  const insert = vi.fn(async () => ({ error: insertError ?? null }))

  const query = {
    eq: vi.fn(function (this: typeof query) { return this }),
    gte: vi.fn(async function () { return { count: count ?? 0, error: selectError ?? null } }),
  }

  const from = vi.fn((table: string) => {
    if (table !== 'ai_usage_events') throw new Error(`unexpected table ${table}`)
    return {
      select: vi.fn(() => query),
      insert,
    }
  })

  return { from, insert } as unknown as { from: typeof from; insert: typeof insert }
}

describe('getRemainingFreeAiActions', () => {
  it('returns the full limit when the user has no usage today', async () => {
    const supabase = fakeSupabase({ count: 0 })
    const remaining = await getRemainingFreeAiActions(supabase as never, 'user-1')
    expect(remaining).toBe(FREE_DAILY_AI_LIMIT)
  })

  it('subtracts today\'s usage from the limit', async () => {
    const supabase = fakeSupabase({ count: 1 })
    const remaining = await getRemainingFreeAiActions(supabase as never, 'user-1')
    expect(remaining).toBe(FREE_DAILY_AI_LIMIT - 1)
  })

  it('never returns a negative remaining count', async () => {
    const supabase = fakeSupabase({ count: 99 })
    const remaining = await getRemainingFreeAiActions(supabase as never, 'user-1')
    expect(remaining).toBe(0)
  })

  it('throws if the usage query fails', async () => {
    const supabase = fakeSupabase({ selectError: new Error('db down') })
    await expect(getRemainingFreeAiActions(supabase as never, 'user-1')).rejects.toThrow('db down')
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
