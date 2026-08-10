import { describe, expect, it } from 'vitest'
import { renderNotCachedHtml, renderRecipeHtml } from './render-recipe'
import { OFFLINE_STRINGS } from './strings'
import type { CachedRecipe } from '../lib/recipe-cache'

const strings = OFFLINE_STRINGS.en

const baseRecipe: CachedRecipe = {
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
  steps: [
    { title: 'Mix', description: 'Combine everything.', duration_minutes: 10 },
    { description: 'Shape the loaf.' },
  ],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  cached_at: 1700000000000,
}

describe('renderRecipeHtml', () => {
  it('includes the title, description, and offline badge', () => {
    const html = renderRecipeHtml(baseRecipe, strings)
    expect(html).toContain('Jalapeño Cheddar Loaf')
    expect(html).toContain('A spicy weekend bake.')
    expect(html).toContain(strings.offlineBadge)
  })

  it('escapes HTML in user-entered fields', () => {
    const html = renderRecipeHtml({ ...baseRecipe, title: '<script>alert(1)</script>' }, strings)
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('renders category, difficulty, prep, and bake meta cards using translated labels', () => {
    const html = renderRecipeHtml(baseRecipe, strings)
    expect(html).toContain(strings.categoryLabels.loaf)
    expect(html).toContain(strings.difficultyLabels.intermediate)
    expect(html).toContain(strings.minutesShort(30))
    expect(html).toContain(strings.minutesShort(45))
  })

  it('falls back to the raw category value if there is no matching label', () => {
    const html = renderRecipeHtml({ ...baseRecipe, category: 'mystery' }, strings)
    expect(html).toContain('mystery')
  })

  it('omits meta cards for fields that are null', () => {
    const html = renderRecipeHtml({ ...baseRecipe, category: null, difficulty: null, prep_time_minutes: null, bake_time_minutes: null }, strings)
    expect(html).not.toContain('meta-card')
  })

  it('lists ingredients with amount and optional note', () => {
    const html = renderRecipeHtml(baseRecipe, strings)
    expect(html).toContain('bread flour')
    expect(html).toContain('500g')
    expect(html).toContain('room temp')
  })

  it('numbers steps and only adds a timer placeholder when a duration is set', () => {
    const html = renderRecipeHtml(baseRecipe, strings)
    expect(html).toContain('Combine everything.')
    expect(html).toContain('data-step-timer')
    expect(html).toContain('data-step-index="0"')
    expect(html).toContain('data-duration-minutes="10"')
    expect(html).toContain('Shape the loaf.')

    // Second step has no duration_minutes, so it gets no timer placeholder of its own.
    const secondStepMarkup = html.split('Shape the loaf.')[0].split('Combine everything.')[1]
    expect(secondStepMarkup).not.toContain('data-step-timer')
  })

  it('omits the notes section when there are no notes', () => {
    const html = renderRecipeHtml({ ...baseRecipe, notes: null }, strings)
    expect(html).not.toContain(strings.myNotes)
  })

  it('omits ingredients/steps sections when empty', () => {
    const html = renderRecipeHtml({ ...baseRecipe, ingredients: [], steps: [] }, strings)
    expect(html).not.toContain(strings.whatYoullNeed)
    expect(html).not.toContain(strings.letsGetBaking)
  })
})

describe('renderNotCachedHtml', () => {
  it('includes the not-cached title and body copy', () => {
    const html = renderNotCachedHtml(strings)
    expect(html).toContain(strings.notCachedTitle)
    // The body copy contains an apostrophe, which renderNotCachedHtml HTML-escapes.
    expect(html).toContain(strings.notCachedBody.replace(/'/g, '&#39;'))
  })
})
