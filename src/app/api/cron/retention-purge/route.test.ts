import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  deletedByTable: {} as Record<string, { data: { id: string }[] | null; error: { message: string } | null }>,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      delete: () => ({
        lt: () => ({
          select: async () => mocks.deletedByTable[table] ?? { data: [], error: null },
        }),
      }),
    }),
  }),
}))

const { GET } = await import('./route')

function cronRequest(secret?: string) {
  return new Request('http://localhost/api/cron/retention-purge', {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
}

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', 'test-cron-secret')
  mocks.deletedByTable = {}
})

describe('GET /api/cron/retention-purge', () => {
  it('rejects requests without the correct CRON_SECRET bearer token', async () => {
    const res = await GET(cronRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('rejects requests when CRON_SECRET is not configured', async () => {
    vi.unstubAllEnvs()
    const res = await GET(cronRequest())
    expect(res.status).toBe(401)
  })

  it('purges expired rows from both chat tables and reports counts', async () => {
    mocks.deletedByTable.troubleshooter_chats = { data: [{ id: 'a' }, { id: 'b' }], error: null }
    mocks.deletedByTable.ingredient_substitution_chats = { data: [{ id: 'c' }], error: null }

    const res = await GET(cronRequest('test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      purged: { troubleshooter_chats: 2, ingredient_substitution_chats: 1 },
    })
  })

  it('reports zero counts when nothing is past its retention window', async () => {
    mocks.deletedByTable.troubleshooter_chats = { data: [], error: null }
    mocks.deletedByTable.ingredient_substitution_chats = { data: [], error: null }

    const res = await GET(cronRequest('test-cron-secret'))
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      purged: { troubleshooter_chats: 0, ingredient_substitution_chats: 0 },
    })
  })

  it('returns 500 if purging a table fails', async () => {
    mocks.deletedByTable.troubleshooter_chats = { data: null, error: { message: 'boom' } }

    const res = await GET(cronRequest('test-cron-secret'))
    expect(res.status).toBe(500)
  })
})
