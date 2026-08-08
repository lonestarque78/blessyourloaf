import { describe, expect, it } from 'vitest'
import { buildRecipeImportFallback, cleanupRecipeWithAnthropic, extractRecipeTextFromHtml } from './recipe-import'

function fakeAnthropic(responseText: string) {
  return {
    messages: {
      create: async () => ({
        content: [{ type: 'text' as const, text: responseText }],
      }),
    },
  }
}

describe('recipe import fallback parser', () => {
  it('turns messy recipe text into a structured payload', () => {
    const result = buildRecipeImportFallback(`Pineapple focaccia

Ingredients:
- 3 cups bread flour
- 2 cups water
- 1 tsp salt

Method:
1. Mix the dough and let it rest for 60 minutes.
2. Stretch and fold twice.
3. Bake for 25 minutes at 450F.`)

    expect(result.title).toContain('Pineapple focaccia')
    expect(result.ingredients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: 'bread flour', amount: '3 cups' }),
        expect.objectContaining({ item: 'water', amount: '2 cups' }),
      ])
    )
    expect(result.steps).toHaveLength(3)
    expect(result.steps[0].description).toContain('Mix the dough')
    expect(result.steps[2].duration_minutes).toBe(25)
  })

  it('extracts visible text from html input', () => {
    const html = '<html><body><h1>Honeyed Rye</h1><p>Ingredients: 2 cups flour</p><p>Step 1: Mix everything.</p></body></html>'
    const extracted = extractRecipeTextFromHtml(html)

    expect(extracted).toContain('Honeyed Rye')
    expect(extracted).toContain('2 cups flour')
    expect(extracted).toContain('Step 1: Mix everything.')
  })

  it('parses a messy Pinterest-style recipe page and extracts timers from steps', () => {
    const html = `
      <html>
        <body>
          <div class="pin-card">
            <h1>✨ Peanut Butter Banana Bread</h1>
            <div class="hero-copy">This easy loaf is perfect for brunch, gifts, or a cozy snack.</div>
            <section class="ingredients-list">
              <h2>Ingredients</h2>
              <ul>
                <li>3 ripe bananas</li>
                <li>1/2 cup smooth peanut butter</li>
                <li>1 cup all-purpose flour</li>
                <li>1/2 tsp baking soda</li>
                <li>1/4 cup honey</li>
              </ul>
            </section>
            <section class="notes">Tip: You can swirl in extra peanut butter on top.</section>
            <section class="instructions">
              <p>Step 1 - Mash bananas and stir in peanut butter.</p>
              <p>Step 2 - Mix in flour, baking soda, and honey.</p>
              <p>Step 3 - Bake for 50 minutes at 350°F, then cool for 10 minutes.</p>
            </section>
          </div>
        </body>
      </html>
    `

    const extracted = extractRecipeTextFromHtml(html)
    const result = buildRecipeImportFallback(extracted)

    expect(result.title).toContain('Peanut Butter Banana Bread')
    expect(result.ingredients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: 'ripe bananas', amount: '3' }),
        expect.objectContaining({ item: 'cup smooth peanut butter', amount: '1/2' }),
        expect.objectContaining({ item: 'all-purpose flour', amount: '1 cup' }),
      ])
    )
    expect(result.steps.length).toBeGreaterThanOrEqual(3)
    expect(result.steps.some(step => step.duration_minutes === 50)).toBe(true)
  })
})

describe('cleanupRecipeWithAnthropic', () => {
  it('normalizes a well-formed AI JSON response into an ImportedRecipe', async () => {
    const anthropic = fakeAnthropic(JSON.stringify({
      title: 'Honeyed Rye Loaf',
      description: 'A lightly sweet rye bread.',
      category: 'loaf',
      difficulty: 'intermediate',
      prep_time_minutes: 20,
      bake_time_minutes: 45,
      notes: 'Best eaten warm.',
      ingredients: [{ amount: '2 cups', item: 'rye flour', note: '' }],
      steps: [{ title: 'Mix', description: 'Combine ingredients.', duration_minutes: 10 }],
    }))

    const result = await cleanupRecipeWithAnthropic(anthropic, 'raw messy text', 'https://example.com/recipe')

    expect(result.title).toBe('Honeyed Rye Loaf')
    expect(result.bake_time_minutes).toBe(45)
    expect(result.ingredients).toEqual([{ amount: '2 cups', item: 'rye flour', note: '' }])
    expect(result.steps).toEqual([{ title: 'Mix', description: 'Combine ingredients.', duration_minutes: 10 }])
  })

  it('fills in defaults for missing or wrongly-typed fields', async () => {
    const anthropic = fakeAnthropic(JSON.stringify({ title: 'Sparse Recipe' }))

    const result = await cleanupRecipeWithAnthropic(anthropic, 'raw text')

    expect(result.title).toBe('Sparse Recipe')
    expect(result.category).toBe('other')
    expect(result.difficulty).toBe('intermediate')
    expect(result.ingredients).toEqual([])
    expect(result.steps).toEqual([])
  })

  it('throws when the response is not valid JSON', async () => {
    const anthropic = fakeAnthropic('not json at all')

    await expect(cleanupRecipeWithAnthropic(anthropic, 'raw text')).rejects.toThrow()
  })

  it('throws when the response has no text content block', async () => {
    const anthropic = { messages: { create: async () => ({ content: [{ type: 'image' }] }) } }

    await expect(cleanupRecipeWithAnthropic(anthropic, 'raw text')).rejects.toThrow('No text response')
  })

  it('throws when the parsed JSON is not an object', async () => {
    const anthropic = fakeAnthropic(JSON.stringify(['not', 'an', 'object']))

    await expect(cleanupRecipeWithAnthropic(anthropic, 'raw text')).rejects.toThrow('Unexpected response shape')
  })
})
