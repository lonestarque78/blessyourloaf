export interface AnthropicRecipeClient {
  messages: {
    create(params: {
      model: string
      max_tokens: number
      system: string
      messages: Array<{ role: 'user'; content: string }>
    }): Promise<{ content: Array<{ type: string; text?: string }> }>
  }
}

export interface ImportedIngredient {
  amount: string
  item: string
  note: string
}

export interface ImportedStep {
  title: string
  description: string
  duration_minutes: number | null
}

export interface ImportedRecipe {
  title: string
  description: string
  category: string
  difficulty: string
  prep_time_minutes: number | null
  bake_time_minutes: number | null
  notes: string
  ingredients: ImportedIngredient[]
  steps: ImportedStep[]
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
  hellip: '…',
}

// Handles both named entities (&nbsp;, &amp;, ...) and numeric entities (&#32;, &#x27;),
// the latter of which sites sometimes double-encode into their JSON-LD text — without this,
// they show up as literal "&#32;" in imported recipes instead of decoding to a space.
export function decodeHtmlEntities(text: string) {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const codePoint = code[1]?.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match
  })
}

function normalizeLine(line: string) {
  return line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractRecipeTextFromHtml(html: string) {
  const withoutTags = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
  const decoded = decodeHtmlEntities(withoutTags)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
  return decoded
    .split(/\n+/)
    .map(normalizeLine)
    .filter(Boolean)
    .join('\n')
}

function inferCategory(title: string) {
  if (!/loaf|focaccia|bread|bun|roll|discard/i.test(title)) return 'other'
  return /discard/i.test(title) ? 'discard' : 'loaf'
}

// Parses "PT40M" / "PT1H30M" / "PT2H" (ISO 8601 durations, as used by schema.org
// prepTime/cookTime) into total minutes.
export function parseIso8601Duration(duration: unknown): number | null {
  if (typeof duration !== 'string') return null
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i)
  if (!match) return null
  const [, hours, minutes, seconds] = match
  if (!hours && !minutes && !seconds) return null
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0) + Math.round((Number(seconds) || 0) / 60)
}

// Splits a single ingredient line (e.g. "1 tablespoon sourdough starter") into amount/item.
// Works best on one clean line per ingredient — exactly what schema.org's recipeIngredient
// array provides, and what buildRecipeImportFallback assembles from raw scraped text.
export function parseIngredientLine(rawLine: string): ImportedIngredient | null {
  const trimmed = decodeHtmlEntities(rawLine).trim()
  if (!trimmed) return null
  if (/^(ingredients|method|steps|directions|instructions):?$/i.test(trimmed)) return null
  if (/^\d+\s*\./.test(trimmed)) return null
  if (/^step\s*\d+/i.test(trimmed)) return null
  if (/^(prep|bake|cook|rest|yield|servings|notes?|tip|hint)/i.test(trimmed)) return null

  const cleaned = trimmed.replace(/^-|^\*|^•/u, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return null

  // Amount is a whole number, a decimal, a bare fraction (1/2), or a mixed number (3 3/4),
  // optionally followed by a unit word — mixed numbers are common in baking ("1 1/2 cups")
  // and were previously mishandled (the whole-number part was split off as its own token).
  const ingredientMatch = cleaned.match(/^(?<amount>(?:\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)(?:\s*(?:cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|g|grams?|kg|kgs?|ml|l|pinches?|dashes?|cloves?|large|small|medium|big)\b)*)\s+(?<item>.+)$/i)

  if (ingredientMatch?.groups) {
    const amount = ingredientMatch.groups.amount.trim()
    const item = ingredientMatch.groups.item.trim()
    return item ? { amount, item, note: '' } : null
  }

  const fallbackMatch = cleaned.match(/^(?<amount>.+?)\s+(?<item>.+)$/)
  if (fallbackMatch?.groups) {
    const amount = fallbackMatch.groups.amount.trim()
    const item = fallbackMatch.groups.item.trim()
    return item ? { amount, item, note: '' } : null
  }

  return { amount: '', item: cleaned, note: '' }
}

function parseIngredients(lines: string[]) {
  return lines.map(parseIngredientLine).filter((i): i is ImportedIngredient => i !== null)
}

function parseSteps(lines: string[]) {
  const steps: ImportedStep[] = []
  const stepPattern = /^(?:step\s*)?(\d+)[.):-]\s*(.+)$/i
  const durationPattern = /(?:for|about|let\s+rest\s+for)\s+(\d+)\s*(?:minutes?|mins?)\b/i

  lines.forEach(rawLine => {
    const line = rawLine.trim()
    if (!line) return
    const match = line.match(stepPattern)
    if (match) {
      const [, , description] = match
      const duration = description.match(durationPattern)?.[1]
      steps.push({
        title: `Step ${match[1]}`,
        description: description.replace(durationPattern, '').trim(),
        duration_minutes: duration ? Number(duration) : null,
      })
    }
  })

  if (steps.length === 0) {
    const fallback = lines.filter(line => line.trim() && !/^(ingredients|method|steps|directions|instructions):?$/i.test(line.trim()))
    fallback.forEach((line, index) => {
      const duration = line.match(durationPattern)?.[1]
      const description = line.replace(durationPattern, '').trim() || line
      steps.push({
        title: `Step ${index + 1}`,
        description,
        duration_minutes: duration ? Number(duration) : null,
      })
    })
  }

  return steps
}

export function buildRecipeImportFallback(rawText: string): ImportedRecipe {
  const normalized = rawText.replace(/\r/g, '')
  const lines = normalized
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)

  const title = lines.find(line => !/^(ingredients|method|steps|directions|instructions|notes):?$/i.test(line)) ?? 'Imported Recipe'
  const titleLine = title.replace(/^\d+\.?\s*/, '')

  const ingredientsSectionStart = lines.findIndex(line => /^ingredients:?$/i.test(line))
  const stepsSectionStart = lines.findIndex(line => /^(method|steps|directions|instructions):?$/i.test(line))

  const ingredientLines = ingredientsSectionStart >= 0
    ? lines.slice(ingredientsSectionStart + 1, stepsSectionStart >= 0 ? stepsSectionStart : lines.length)
    : lines.filter(line => /^-\s|^\*\s|^•\s|^\d+\s+/.test(line))

  const stepLines = stepsSectionStart >= 0
    ? lines.slice(stepsSectionStart + 1)
    : lines.filter(line => /^\d+\s*[.):-]/.test(line) || /^step\s*\d+/i.test(line))

  const ingredients = parseIngredients(ingredientLines)
  const steps = parseSteps(stepLines.length > 0 ? stepLines : lines.filter(line => line !== titleLine))

  const prepMatch = normalized.match(/prep(?:aration)?[^\d]*(\d+)/i)
  const bakeMatch = normalized.match(/bake[^\d]*(\d+)/i)
  const cookMatch = normalized.match(/cook[^\d]*(\d+)/i)

  return {
    title: titleLine,
    description: `Imported from a messy recipe source and cleaned into a simple starter-friendly structure.`,
    category: inferCategory(titleLine),
    difficulty: 'intermediate',
    prep_time_minutes: prepMatch ? Number(prepMatch[1]) : null,
    bake_time_minutes: bakeMatch ? Number(bakeMatch[1]) : cookMatch ? Number(cookMatch[1]) : null,
    notes: 'Imported and lightly cleaned for easier use in the kitchen.',
    ingredients: ingredients.length > 0 ? ingredients : [{ amount: '', item: 'Ingredients to add', note: '' }],
    steps: steps.length > 0 ? steps : [{ title: 'Step 1', description: 'Review and refine this recipe before baking.', duration_minutes: null }],
  }
}

export function buildRecipeImportPayload(rawText: string) {
  return buildRecipeImportFallback(rawText)
}

function collectJsonLdItems(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) return parsed.flatMap(collectJsonLdItems)
  if (isJsonObject(parsed)) {
    const graph = parsed['@graph']
    if (Array.isArray(graph)) return graph.flatMap(collectJsonLdItems)
    return [parsed]
  }
  return []
}

function hasRecipeType(item: Record<string, unknown>): boolean {
  const type = item['@type']
  if (typeof type === 'string') return type === 'Recipe'
  if (Array.isArray(type)) return type.includes('Recipe')
  return false
}

// Most recipe-blog platforms embed schema.org Recipe JSON-LD for SEO rich snippets — when
// present, it's a far more reliable source than scraping the rendered page text, since it's
// already structured (clean ingredient list, real instruction steps) and can't accidentally
// pick up nav links, comments, or rating-widget text the way raw text extraction can.
export function extractRecipeJsonLd(html: string): Record<string, unknown> | null {
  const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  while ((match = scriptPattern.exec(html))) {
    let parsed: unknown
    try {
      parsed = JSON.parse(match[1])
    } catch {
      continue
    }
    const recipe = collectJsonLdItems(parsed).find(hasRecipeType)
    if (recipe) return recipe
  }

  return null
}

function flattenHowToItems(items: unknown): Array<{ title: string | null; description: string; duration_minutes: number | null }> {
  if (typeof items === 'string') {
    const text = decodeHtmlEntities(items).trim()
    return text ? [{ title: null, description: text, duration_minutes: null }] : []
  }
  if (!Array.isArray(items)) return []

  return items.flatMap((item): Array<{ title: string | null; description: string; duration_minutes: number | null }> => {
    if (typeof item === 'string') {
      const text = decodeHtmlEntities(item).trim()
      return text ? [{ title: null, description: text, duration_minutes: null }] : []
    }
    if (!isJsonObject(item)) return []

    if (item['@type'] === 'HowToSection') {
      return flattenHowToItems(item.itemListElement)
    }

    const text = typeof item.text === 'string' ? item.text : typeof item.name === 'string' ? item.name : ''
    if (!text) return []

    const title = typeof item.name === 'string' && item.name ? decodeHtmlEntities(item.name) : null
    return [{ title, description: decodeHtmlEntities(text).trim(), duration_minutes: null }]
  })
}

// Returns null (rather than a mostly-empty recipe) when the JSON-LD has neither ingredients
// nor steps, so the caller can fall back to raw-text extraction + AI cleanup instead.
export function buildRecipeFromJsonLd(recipeLd: Record<string, unknown>): ImportedRecipe | null {
  const title = typeof recipeLd.name === 'string' ? decodeHtmlEntities(recipeLd.name).trim() : ''
  const description = typeof recipeLd.description === 'string' ? decodeHtmlEntities(recipeLd.description).trim() : ''

  const ingredientLines = Array.isArray(recipeLd.recipeIngredient)
    ? recipeLd.recipeIngredient.filter((line): line is string => typeof line === 'string')
    : []
  const ingredients = ingredientLines.map(parseIngredientLine).filter((i): i is ImportedIngredient => i !== null)

  const steps = flattenHowToItems(recipeLd.recipeInstructions).map((step, index) => ({
    title: step.title || `Step ${index + 1}`,
    description: step.description,
    duration_minutes: step.duration_minutes,
  }))

  if (!title && ingredients.length === 0 && steps.length === 0) return null

  const categoryHint = Array.isArray(recipeLd.recipeCategory) && typeof recipeLd.recipeCategory[0] === 'string'
    ? `${title} ${recipeLd.recipeCategory[0]}`
    : title

  return normalizeImportedRecipe({
    title: title || 'Imported Recipe',
    description,
    category: inferCategory(categoryHint),
    difficulty: 'intermediate',
    prep_time_minutes: parseIso8601Duration(recipeLd.prepTime),
    bake_time_minutes: parseIso8601Duration(recipeLd.cookTime),
    notes: 'Imported from this recipe’s structured data.',
    ingredients,
    steps,
  })
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function cleanupRecipeWithAnthropic(
  anthropic: AnthropicRecipeClient,
  text: string,
  sourceUrl?: string
): Promise<ImportedRecipe> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2400,
    system: 'You are a recipe editor. Convert messy recipe text into a clean JSON object with title, description, category, difficulty, prep_time_minutes, bake_time_minutes, notes, ingredients, and steps. Return only valid JSON. If a field is unknown, use null or an empty string.',
    messages: [{ role: 'user', content: `Clean this recipe text from ${sourceUrl ?? 'an unknown source'} into a JSON object. Keep the original intent, but structure it clearly.\n\n${text}` }],
  })

  const textPayload = response.content.find(part => part.type === 'text')
  if (!textPayload || typeof textPayload.text !== 'string') throw new Error('No text response')

  // Claude sometimes wraps its JSON in a markdown code fence despite being told not to.
  const cleanedText = textPayload.text.replace(/^```json\n?/i, '').replace(/```\s*$/, '').trim()
  const parsed = JSON.parse(cleanedText)
  if (!isJsonObject(parsed)) throw new Error('Unexpected response shape')

  return normalizeImportedRecipe({
    title: typeof parsed.title === 'string' ? parsed.title : 'Imported Recipe',
    description: typeof parsed.description === 'string' ? parsed.description : '',
    category: typeof parsed.category === 'string' ? parsed.category : 'other',
    difficulty: typeof parsed.difficulty === 'string' ? parsed.difficulty : 'intermediate',
    prep_time_minutes: typeof parsed.prep_time_minutes === 'number' ? parsed.prep_time_minutes : null,
    bake_time_minutes: typeof parsed.bake_time_minutes === 'number' ? parsed.bake_time_minutes : null,
    notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map((item, index) => ({
      amount: typeof (item as Record<string, unknown>).amount === 'string' ? (item as Record<string, unknown>).amount as string : '',
      item: typeof (item as Record<string, unknown>).item === 'string' ? (item as Record<string, unknown>).item as string : `Ingredient ${index + 1}`,
      note: typeof (item as Record<string, unknown>).note === 'string' ? (item as Record<string, unknown>).note as string : '',
    })) : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map((step, index) => ({
      title: typeof (step as Record<string, unknown>).title === 'string' ? (step as Record<string, unknown>).title as string : `Step ${index + 1}`,
      description: typeof (step as Record<string, unknown>).description === 'string' ? (step as Record<string, unknown>).description as string : '',
      duration_minutes: typeof (step as Record<string, unknown>).duration_minutes === 'number' ? (step as Record<string, unknown>).duration_minutes as number : null,
    })) : [],
  })
}

export function normalizeImportedRecipe(recipe: ImportedRecipe) {
  return {
    ...recipe,
    title: recipe.title || 'Imported Recipe',
    ingredients: recipe.ingredients.filter(ingredient => ingredient.item.trim()).map(ingredient => ({
      amount: ingredient.amount || '',
      item: ingredient.item.trim(),
      note: ingredient.note || '',
    })),
    steps: recipe.steps.map(step => ({
      title: step.title || 'Step',
      description: step.description.trim(),
      duration_minutes: step.duration_minutes ?? null,
    })),
    category: recipe.category || 'other',
    difficulty: recipe.difficulty || 'intermediate',
    prep_time_minutes: recipe.prep_time_minutes ?? null,
    bake_time_minutes: recipe.bake_time_minutes ?? null,
  }
}
