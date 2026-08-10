import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sendNotification: vi.fn(),
  setVapidDetails: vi.fn(),
  rpc: vi.fn(),
  subscriptionsByUser: {} as Record<string, { id: string; endpoint: string; p256dh: string; auth_key: string; locale: string }[]>,
}))

vi.mock('web-push', () => ({
  default: { sendNotification: mocks.sendNotification, setVapidDetails: mocks.setVapidDetails },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: mocks.rpc,
    from: (table: string) => {
      if (table !== 'push_subscriptions') throw new Error(`unexpected table ${table}`)
      return {
        select: () => ({
          eq: async (_column: string, userId: string) => ({
            data: mocks.subscriptionsByUser[userId] ?? [],
            error: null,
          }),
        }),
        delete: () => ({ eq: async () => ({ error: null }) }),
      }
    },
  }),
}))

const { GET } = await import('./route')

function cronRequest(secret?: string) {
  return new Request('http://localhost/api/cron/feeding-reminders', {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
}

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', 'test-cron-secret')
  vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'test-public-key')
  vi.stubEnv('VAPID_PRIVATE_KEY', 'test-private-key')
  vi.stubEnv('VAPID_SUBJECT', 'mailto:test@example.com')
  mocks.sendNotification.mockReset().mockResolvedValue(undefined)
  mocks.setVapidDetails.mockReset()
  mocks.rpc.mockReset()
  mocks.subscriptionsByUser = {}
})

describe('GET /api/cron/feeding-reminders', () => {
  it('rejects requests without the correct CRON_SECRET bearer token', async () => {
    const res = await GET(cronRequest('wrong-secret'))
    expect(res.status).toBe(401)
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('rejects requests when CRON_SECRET is not configured', async () => {
    vi.unstubAllEnvs()
    const res = await GET(cronRequest())
    expect(res.status).toBe(401)
  })

  it('sends nothing and reports zero counts when no starters are due', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null })
    const res = await GET(cronRequest('test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true, dueCount: 0, notified: 0, sent: 0, failed: 0 })
    expect(mocks.sendNotification).not.toHaveBeenCalled()
  })

  it('sends a localized push per subscription locale for a due starter', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ starter_id: 'starter-1', user_id: 'user-1', starter_name: 'Willow' }],
      error: null,
    })
    mocks.subscriptionsByUser['user-1'] = [
      { id: 'sub-en', endpoint: 'https://push.example/en', p256dh: 'p1', auth_key: 'a1', locale: 'en' },
      { id: 'sub-es', endpoint: 'https://push.example/es', p256dh: 'p2', auth_key: 'a2', locale: 'es' },
    ]

    const res = await GET(cronRequest('test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true, dueCount: 1, notified: 1, sent: 2, failed: 0 })

    expect(mocks.sendNotification).toHaveBeenCalledTimes(2)
    const payloads = mocks.sendNotification.mock.calls.map(([, payload]) => JSON.parse(payload as string))
    expect(payloads.find(p => p.title === 'Feeding time 🫙').body).toContain('Willow')
    expect(payloads.find(p => p.title === 'Hora de alimentar 🫙').body).toContain('Willow')
  })

  it('defaults to English and skips users with no push subscriptions', async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        { starter_id: 'starter-1', user_id: 'user-1', starter_name: 'Willow' },
        { starter_id: 'starter-2', user_id: 'user-2', starter_name: 'Biscuit' },
      ],
      error: null,
    })
    mocks.subscriptionsByUser['user-1'] = [
      { id: 'sub-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth_key: 'a1', locale: '' },
    ]
    // user-2 has no subscriptions on file

    const res = await GET(cronRequest('test-cron-secret'))
    const body = await res.json()
    expect(body).toEqual({ success: true, dueCount: 2, notified: 1, sent: 1, failed: 0 })
    expect(mocks.sendNotification).toHaveBeenCalledTimes(1)
    const [, payload] = mocks.sendNotification.mock.calls[0]
    expect(JSON.parse(payload as string).title).toBe('Feeding time 🫙')
  })

  it('returns 500 if claiming due reminders fails', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const res = await GET(cronRequest('test-cron-secret'))
    expect(res.status).toBe(500)
    expect(mocks.sendNotification).not.toHaveBeenCalled()
  })
})
