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

function normalizeLine(line: string) {
  return line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractRecipeTextFromHtml(html: string) {
  const withoutTags = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
  const decoded = withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
  return decoded
    .split(/\n+/)
    .map(normalizeLine)
    .filter(Boolean)
    .join('\n')
}

function parseIngredients(lines: string[]) {
  const ingredients: ImportedIngredient[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^(ingredients|method|steps|directions|instructions):?$/i.test(trimmed)) continue
    if (/^\d+\s*\./.test(trimmed)) continue
    if (/^step\s*\d+/i.test(trimmed)) continue
    if (/^(prep|bake|cook|rest|yield|servings|notes?|tip|hint)/i.test(trimmed)) continue

    const cleaned = trimmed.replace(/^-|^\*|^•/u, '').trim()
    const ingredientMatch = cleaned.match(/^(?<amount>\d+(?:\.\d+)?(?:\s*(?:cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|g|grams?|kg|kgs?|ml|l|pinches?|dashes?|cloves?|large|small|medium|big)\b)*)\s+(?<item>.+)$/i)

    if (ingredientMatch?.groups) {
      const amount = ingredientMatch.groups.amount.trim()
      const item = ingredientMatch.groups.item.trim()
      if (item) {
        ingredients.push({ amount, item, note: '' })
      }
    } else if (cleaned) {
      const fallbackMatch = cleaned.match(/^(?<amount>.+?)\s+(?<item>.+)$/)
      if (fallbackMatch?.groups) {
        const amount = fallbackMatch.groups.amount.trim()
        const item = fallbackMatch.groups.item.trim()
        if (item) {
          ingredients.push({ amount, item, note: '' })
        }
      } else {
        ingredients.push({ amount: '', item: cleaned, note: '' })
      }
    }
  }

  return ingredients
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

  const category = /loaf|focaccia|bread|bun|roll|discard/i.test(titleLine)
    ? /discard/i.test(titleLine)
      ? 'discard'
      : 'loaf'
    : 'other'

  return {
    title: titleLine,
    description: `Imported from a messy recipe source and cleaned into a simple starter-friendly structure.`,
    category,
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

  const parsed = JSON.parse(textPayload.text)
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
