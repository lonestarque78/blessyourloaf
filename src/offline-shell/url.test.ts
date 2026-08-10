import { describe, expect, it } from 'vitest'
import { parseRecipeIdFromPath, pickLocale } from './url'

describe('parseRecipeIdFromPath', () => {
  it('extracts the id from a detail route', () => {
    expect(parseRecipeIdFromPath('/dashboard/my-recipes/abc-123')).toBe('abc-123')
  })

  it('tolerates a trailing slash', () => {
    expect(parseRecipeIdFromPath('/dashboard/my-recipes/abc-123/')).toBe('abc-123')
  })

  it('returns null for the list page (no id)', () => {
    expect(parseRecipeIdFromPath('/dashboard/my-recipes')).toBeNull()
  })

  it('returns null for the new-recipe route', () => {
    expect(parseRecipeIdFromPath('/dashboard/my-recipes/new')).toBeNull()
  })

  it('returns null for unrelated routes', () => {
    expect(parseRecipeIdFromPath('/dashboard/starters/abc-123')).toBeNull()
  })

  it('returns null for a nested route like edit', () => {
    expect(parseRecipeIdFromPath('/dashboard/my-recipes/abc-123/edit')).toBeNull()
  })
})

describe('pickLocale', () => {
  it('defaults to English with no cookie', () => {
    expect(pickLocale('')).toBe('en')
  })

  it('reads the BYL_LOCALE cookie', () => {
    expect(pickLocale('BYL_LOCALE=es')).toBe('es')
  })

  it('finds the cookie among others', () => {
    expect(pickLocale('foo=bar; BYL_LOCALE=es; baz=qux')).toBe('es')
  })

  it('falls back to English for an unsupported value', () => {
    expect(pickLocale('BYL_LOCALE=fr')).toBe('en')
  })
})
