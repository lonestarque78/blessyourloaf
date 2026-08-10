import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendPushToUser } from './push-notifications'

const { sendNotification, setVapidDetails } = vi.hoisted(() => ({
  sendNotification: vi.fn(),
  setVapidDetails: vi.fn(),
}))

vi.mock('web-push', () => ({
  default: { sendNotification, setVapidDetails },
}))

type FakeSubscription = { id: string; endpoint: string; p256dh: string; auth_key: string }

function fakeSupabase(subscriptions: FakeSubscription[]) {
  const deleted: string[] = []

  const selectQuery = {
    eq: vi.fn(async () => ({ data: subscriptions, error: null })),
  }

  const deleteQuery = {
    eq: vi.fn(async (_column: string, id: string) => {
      deleted.push(id)
      return { error: null }
    }),
  }

  const from = vi.fn((table: string) => {
    if (table !== 'push_subscriptions') throw new Error(`unexpected table ${table}`)
    return {
      select: vi.fn(() => selectQuery),
      delete: vi.fn(() => deleteQuery),
    }
  })

  return { from, deleted } as unknown as { from: typeof from; deleted: string[] }
}

describe('sendPushToUser', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'test-public-key')
    vi.stubEnv('VAPID_PRIVATE_KEY', 'test-private-key')
    vi.stubEnv('VAPID_SUBJECT', 'mailto:test@example.com')
    sendNotification.mockReset()
    setVapidDetails.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws if VAPID keys are not configured', async () => {
    vi.unstubAllEnvs()
    const supabase = fakeSupabase([])
    await expect(
      sendPushToUser(supabase as never, 'user-1', { title: 't', body: 'b' })
    ).rejects.toThrow('VAPID keys are not configured')
  })

  it('sends to every subscription on file for the user', async () => {
    sendNotification.mockResolvedValue(undefined)
    const supabase = fakeSupabase([
      { id: 'sub-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth_key: 'a1' },
      { id: 'sub-2', endpoint: 'https://push.example/2', p256dh: 'p2', auth_key: 'a2' },
    ])

    const summary = await sendPushToUser(supabase as never, 'user-1', { title: 't', body: 'b' })

    expect(summary).toEqual({ sent: 2, removed: 0, failed: 0 })
    expect(sendNotification).toHaveBeenCalledTimes(2)
    expect(setVapidDetails).toHaveBeenCalledWith('mailto:test@example.com', 'test-public-key', 'test-private-key')
  })

  it('deletes a subscription the push service reports as gone (410)', async () => {
    sendNotification.mockRejectedValue(Object.assign(new Error('gone'), { statusCode: 410 }))
    const supabase = fakeSupabase([
      { id: 'sub-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth_key: 'a1' },
    ])

    const summary = await sendPushToUser(supabase as never, 'user-1', { title: 't', body: 'b' })

    expect(summary).toEqual({ sent: 0, removed: 1, failed: 0 })
    expect(supabase.deleted).toEqual(['sub-1'])
  })

  it('counts other failures without deleting the subscription', async () => {
    sendNotification.mockRejectedValue(Object.assign(new Error('server error'), { statusCode: 500 }))
    const supabase = fakeSupabase([
      { id: 'sub-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth_key: 'a1' },
    ])

    const summary = await sendPushToUser(supabase as never, 'user-1', { title: 't', body: 'b' })

    expect(summary).toEqual({ sent: 0, removed: 0, failed: 1 })
    expect(supabase.deleted).toEqual([])
  })

  it('returns all zeroes when the user has no subscriptions', async () => {
    const supabase = fakeSupabase([])
    const summary = await sendPushToUser(supabase as never, 'user-1', { title: 't', body: 'b' })
    expect(summary).toEqual({ sent: 0, removed: 0, failed: 0 })
    expect(sendNotification).not.toHaveBeenCalled()
  })
})
