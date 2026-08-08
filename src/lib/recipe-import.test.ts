import { describe, expect, it } from 'vitest'
import {
  buildRecipeFromJsonLd,
  buildRecipeImportFallback,
  cleanupRecipeWithAnthropic,
  decodeHtmlEntities,
  extractRecipeJsonLd,
  extractRecipeTextFromHtml,
  parseIso8601Duration,
} from './recipe-import'

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
        expect.objectContaining({ item: 'smooth peanut butter', amount: '1/2 cup' }),
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

  it('parses successfully when Claude wraps the JSON in a markdown code fence', async () => {
    const anthropic = fakeAnthropic('```json\n' + JSON.stringify({ title: 'Fenced Recipe' }) + '\n```')

    const result = await cleanupRecipeWithAnthropic(anthropic, 'raw text')

    expect(result.title).toBe('Fenced Recipe')
  })
})

describe('decodeHtmlEntities', () => {
  it('decodes named entities', () => {
    expect(decodeHtmlEntities('Salt &amp; pepper')).toBe('Salt & pepper')
    expect(decodeHtmlEntities('&ldquo;starter&rdquo;')).toBe('“starter”')
  })

  it('decodes numeric decimal and hex entities', () => {
    expect(decodeHtmlEntities('a&#32;b')).toBe('a b')
    expect(decodeHtmlEntities('a&#x27;b')).toBe("a'b")
  })

  it('leaves unrecognized entities untouched', () => {
    expect(decodeHtmlEntities('&notarealentity;')).toBe('&notarealentity;')
  })
})

describe('parseIso8601Duration', () => {
  it('parses minutes-only durations', () => {
    expect(parseIso8601Duration('PT40M')).toBe(40)
  })

  it('parses hours-and-minutes durations', () => {
    expect(parseIso8601Duration('PT1H30M')).toBe(90)
  })

  it('parses hours-only durations', () => {
    expect(parseIso8601Duration('PT2H')).toBe(120)
  })

  it('returns null for missing or unparseable input', () => {
    expect(parseIso8601Duration(undefined)).toBeNull()
    expect(parseIso8601Duration('40 minutes')).toBeNull()
    expect(parseIso8601Duration(42)).toBeNull()
  })
})

describe('extractRecipeJsonLd + buildRecipeFromJsonLd', () => {
  // Trimmed-down real-world fixture: littlespoonfarm.com's Jalapeño Cheddar Sourdough
  // page, which is what surfaced the raw-text-scraping bugs this feature works around
  // (rating-widget text picked up as a step, ingredients fragmented, HTML entities left
  // undecoded).
  const RECIPE_LD = {
    '@type': 'Recipe',
    name: 'Jalapeño Cheddar Sourdough Bread Recipe',
    description: 'A crusty artisan loaf &amp; loaded with cheddar cheese.',
    prepTime: 'PT40M',
    cookTime: 'PT50M',
    recipeIngredient: [
      '1 tablespoon sourdough starter',
      '3 3/4 cups  bread flour',
      '2 teaspoons fine sea salt',
    ],
    recipeInstructions: [
      {
        '@type': 'HowToSection',
        name: 'Make the Dough',
        itemListElement: [
          { '@type': 'HowToStep', name: 'Autolyse', text: 'Combine water and starter, rest 1 hour.' },
          { '@type': 'HowToStep', name: 'Bake', text: 'Bake at 450° for 30 minutes.' },
        ],
      },
    ],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.98', ratingCount: '296' },
  }

  function htmlWithLdJson(payload: unknown) {
    return `<html><head><script type="application/ld+json">${JSON.stringify(payload)}</script></head><body></body></html>`
  }

  it('finds a Recipe nested inside a @graph array', () => {
    const html = htmlWithLdJson({ '@graph': [{ '@type': 'WebPage' }, RECIPE_LD] })
    const recipeLd = extractRecipeJsonLd(html)

    expect(recipeLd?.name).toBe(RECIPE_LD.name)
  })

  it('finds a bare Recipe object with no @graph wrapper', () => {
    const html = htmlWithLdJson(RECIPE_LD)
    const recipeLd = extractRecipeJsonLd(html)

    expect(recipeLd?.name).toBe(RECIPE_LD.name)
  })

  it('returns null when there is no ld+json script at all', () => {
    expect(extractRecipeJsonLd('<html><body><h1>No structured data here</h1></body></html>')).toBeNull()
  })

  it('skips malformed JSON in one script block and keeps checking others', () => {
    const html = `
      <script type="application/ld+json">{ not valid json </script>
      ${htmlWithLdJson(RECIPE_LD)}
    `
    expect(extractRecipeJsonLd(html)?.name).toBe(RECIPE_LD.name)
  })

  it('builds a clean ImportedRecipe from JSON-LD: real ingredients, real steps, no rating-widget contamination', () => {
    const result = buildRecipeFromJsonLd(RECIPE_LD)

    expect(result).not.toBeNull()
    expect(result!.title).toBe('Jalapeño Cheddar Sourdough Bread Recipe')
    expect(result!.description).toBe('A crusty artisan loaf & loaded with cheddar cheese.')
    expect(result!.prep_time_minutes).toBe(40)
    expect(result!.bake_time_minutes).toBe(50)

    expect(result!.ingredients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: 'bread flour', amount: '3 3/4 cups' }),
        expect.objectContaining({ item: 'fine sea salt', amount: '2 teaspoons' }),
      ])
    )

    // Steps come from recipeInstructions only — never from ratings/reviews.
    expect(result!.steps).toHaveLength(2)
    expect(result!.steps[0]).toEqual({ title: 'Autolyse', description: 'Combine water and starter, rest 1 hour.', duration_minutes: null })
    expect(result!.steps.some(s => /votes|rating/i.test(s.description))).toBe(false)
  })

  it('decodes HTML entities in ingredient and step text', () => {
    const result = buildRecipeFromJsonLd({
      ...RECIPE_LD,
      recipeIngredient: ['1 cup flour &#38; water'],
      recipeInstructions: [{ '@type': 'HowToStep', name: 'Mix', text: 'Stir until smooth&#32;and combined.' }],
    })

    expect(result!.ingredients[0].item).not.toContain('&#38;')
    expect(result!.steps[0].description).toBe('Stir until smooth and combined.')
  })

  it('falls back to plain numbered steps when recipeInstructions is an array of strings', () => {
    const result = buildRecipeFromJsonLd({ ...RECIPE_LD, recipeInstructions: ['Mix everything.', 'Bake it.'] })

    expect(result!.steps).toEqual([
      { title: 'Step 1', description: 'Mix everything.', duration_minutes: null },
      { title: 'Step 2', description: 'Bake it.', duration_minutes: null },
    ])
  })

  it('returns null when the Recipe object has no name, ingredients, or steps', () => {
    expect(buildRecipeFromJsonLd({ '@type': 'Recipe', aggregateRating: RECIPE_LD.aggregateRating })).toBeNull()
  })
})
