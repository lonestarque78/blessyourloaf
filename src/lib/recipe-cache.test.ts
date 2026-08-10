import 'fake-indexeddb/auto'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheRecipe, getCachedRecipe, type CachedRecipe } from './recipe-cache'

const baseRecipe: Omit<CachedRecipe, 'cached_at'> = {
  id: 'recipe-1',
  title: 'Jalapeño Cheddar Loaf',
  description: 'A spicy weekend bake.',
  category: 'loaf',
  difficulty: 'intermediate',
  prep_time_minutes: 30,
  bake_time_minutes: 45,
  tags: ['spicy', 'cheddar'],
  notes: 'Extra cheese next time.',
  ingredients: [{ item: 'bread flour', amount: '500g', note: 'room temp' }],
  steps: [{ title: 'Mix', description: 'Combine everything.', duration_minutes: 10 }],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('recipe-cache', () => {
  // fake-indexeddb polyfills `indexedDB`, but recipe-cache also gates on `typeof window`,
  // mirroring how the module behaves in a real (non-SSR) browser tab.
  beforeAll(() => {
    vi.stubGlobal('window', globalThis)
  })

  it('returns undefined for a recipe that was never cached', async () => {
    expect(await getCachedRecipe('never-cached')).toBeUndefined()
  })

  it('round-trips a cached recipe', async () => {
    await cacheRecipe(baseRecipe)
    const cached = await getCachedRecipe('recipe-1')
    expect(cached).toMatchObject(baseRecipe)
    expect(cached?.cached_at).toBeTypeOf('number')
  })

  it('overwrites the previous copy when cached again', async () => {
    await cacheRecipe(baseRecipe)
    await cacheRecipe({ ...baseRecipe, title: 'Updated Title' })
    const cached = await getCachedRecipe('recipe-1')
    expect(cached?.title).toBe('Updated Title')
  })

  describe('without a browser environment', () => {
    beforeEach(() => {
      vi.stubGlobal('window', undefined)
    })

    it('cacheRecipe is a no-op', async () => {
      await expect(cacheRecipe(baseRecipe)).resolves.toBeUndefined()
    })

    it('getCachedRecipe resolves undefined', async () => {
      await expect(getCachedRecipe('recipe-1')).resolves.toBeUndefined()
    })
  })
})
