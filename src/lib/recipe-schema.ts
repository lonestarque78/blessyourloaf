// Builds schema.org Recipe JSON-LD for a recipe detail page — what produces the rich recipe
// card (image, star rating slot, time) in Google search results, rather than a plain blue
// link. See https://developers.google.com/search/docs/appearance/structured-data/recipe.
//
// Deliberately omits recipeYield/servings and aggregateRating/nutrition/video: the `recipes`
// table has no column backing any of them, and inventing a plausible-looking value would be
// worse than leaving the property out — Google's structured-data guidelines explicitly warn
// against content that isn't actually on the page. Add real columns for these before adding
// the corresponding JSON-LD fields, not the other way around.

export interface RecipeForSchema {
  title: string
  description: string | null
  category: string
  ingredients: unknown
  steps: unknown
  prep_time_minutes: number | null
  bake_time_minutes: number | null
  image_url?: string | null
  tags?: string[] | null
  created_at?: string | null
}

interface RecipeIngredient {
  item: string
  amount: string
  note?: string
}

interface RecipeStep {
  title: string
  description: string
}

// schema.org (and ISO 8601) duration string, e.g. 45 -> "PT45M". Returns undefined for a
// missing/zero/negative value rather than emitting a meaningless "PT0M" — Google's validator
// flags an empty or zero duration as an error, not just an omission.
function minutesToIso8601Duration(minutes: number | null | undefined): string | undefined {
  if (!minutes || minutes <= 0) return undefined
  return `PT${Math.round(minutes)}M`
}

export function buildRecipeJsonLd(recipe: RecipeForSchema, canonicalUrl: string): Record<string, unknown> {
  const ingredients = (recipe.ingredients as RecipeIngredient[] | null) ?? []
  const steps = (recipe.steps as RecipeStep[] | null) ?? []

  const prepTime = minutesToIso8601Duration(recipe.prep_time_minutes)
  const cookTime = minutesToIso8601Duration(recipe.bake_time_minutes)
  const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.bake_time_minutes ?? 0)
  const totalTime = minutesToIso8601Duration(totalMinutes)

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    ...(recipe.description ? { description: recipe.description } : {}),
    ...(recipe.image_url ? { image: [recipe.image_url] } : {}),
    author: { '@type': 'Organization', name: 'Bless Your Loaf' },
    ...(recipe.created_at ? { datePublished: recipe.created_at } : {}),
    recipeCategory: recipe.category,
    ...(recipe.tags && recipe.tags.length > 0 ? { keywords: recipe.tags.join(', ') } : {}),
    ...(prepTime ? { prepTime } : {}),
    ...(cookTime ? { cookTime } : {}),
    ...(totalTime ? { totalTime } : {}),
    recipeIngredient: ingredients.map(i => [i.amount, i.item, i.note].filter(Boolean).join(' ').trim()),
    recipeInstructions: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
    url: canonicalUrl,
  }
}
