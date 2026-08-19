import { describe, expect, it } from 'vitest'
import { buildRecipeJsonLd } from './recipe-schema'

const BASE_RECIPE = {
  title: 'Classic Sourdough Loaf',
  description: 'A golden, crackling crust with a chewy, open crumb.',
  category: 'loaf',
  ingredients: [
    { item: 'bread flour', amount: '450g', note: '' },
    { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
  ],
  steps: [
    { title: 'Autolyse', description: 'Mix flour and water, rest 45 minutes.' },
    { title: 'Bulk ferment', description: 'Stretch and fold every 30 minutes for 4 hours.' },
  ],
  prep_time_minutes: 60,
  bake_time_minutes: 45,
}

describe('buildRecipeJsonLd', () => {
  it('produces valid Recipe JSON-LD with times, ingredients, and instructions', () => {
    const ld = buildRecipeJsonLd(BASE_RECIPE, 'https://www.blessyourloaf.com/recipes/classic-sourdough-loaf')

    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('Recipe')
    expect(ld.name).toBe('Classic Sourdough Loaf')
    expect(ld.description).toBe(BASE_RECIPE.description)
    expect(ld.recipeCategory).toBe('loaf')
    expect(ld.prepTime).toBe('PT60M')
    expect(ld.cookTime).toBe('PT45M')
    expect(ld.totalTime).toBe('PT105M')
    expect(ld.url).toBe('https://www.blessyourloaf.com/recipes/classic-sourdough-loaf')
  })

  it('joins amount, item, and note into each recipeIngredient string', () => {
    const ld = buildRecipeJsonLd(BASE_RECIPE, 'https://example.com/r')
    expect(ld.recipeIngredient).toEqual([
      '450g bread flour',
      '100g active sourdough starter 100% hydration',
    ])
  })

  it('turns steps into positioned HowToStep objects, in order', () => {
    const ld = buildRecipeJsonLd(BASE_RECIPE, 'https://example.com/r')
    expect(ld.recipeInstructions).toEqual([
      { '@type': 'HowToStep', position: 1, name: 'Autolyse', text: 'Mix flour and water, rest 45 minutes.' },
      { '@type': 'HowToStep', position: 2, name: 'Bulk ferment', text: 'Stretch and fold every 30 minutes for 4 hours.' },
    ])
  })

  it('includes author as the organization and datePublished/keywords when available', () => {
    const ld = buildRecipeJsonLd(
      { ...BASE_RECIPE, tags: ['sourdough', 'beginner'], created_at: '2026-06-06T00:00:00.000Z' },
      'https://example.com/r'
    )
    expect(ld.author).toEqual({ '@type': 'Organization', name: 'Bless Your Loaf' })
    expect(ld.datePublished).toBe('2026-06-06T00:00:00.000Z')
    expect(ld.keywords).toBe('sourdough, beginner')
  })

  it('omits image when image_url is null rather than emitting a broken image field', () => {
    const ld = buildRecipeJsonLd({ ...BASE_RECIPE, image_url: null }, 'https://example.com/r')
    expect(ld.image).toBeUndefined()
  })

  it('includes image when image_url is present', () => {
    const ld = buildRecipeJsonLd({ ...BASE_RECIPE, image_url: 'https://example.com/photo.jpg' }, 'https://example.com/r')
    expect(ld.image).toEqual(['https://example.com/photo.jpg'])
  })

  it('omits prepTime/cookTime/totalTime rather than emitting a zero duration when minutes are missing', () => {
    const ld = buildRecipeJsonLd({ ...BASE_RECIPE, prep_time_minutes: null, bake_time_minutes: null }, 'https://example.com/r')
    expect(ld.prepTime).toBeUndefined()
    expect(ld.cookTime).toBeUndefined()
    expect(ld.totalTime).toBeUndefined()
  })

  it('does not emit recipeYield, aggregateRating, or nutrition — no column backs any of them', () => {
    const ld = buildRecipeJsonLd(BASE_RECIPE, 'https://example.com/r')
    expect(ld).not.toHaveProperty('recipeYield')
    expect(ld).not.toHaveProperty('aggregateRating')
    expect(ld).not.toHaveProperty('nutrition')
  })
})
