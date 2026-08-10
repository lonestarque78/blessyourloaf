// Baker's hydration: water weight as a percentage of flour weight.
export function calculateHydrationPercent(flourGrams: number, waterGrams: number): number {
  return (waterGrams / flourGrams) * 100
}

// Back-solves flour/water from a target hydration % and a total dough weight.
// total = flour + water = flour + flour*(hydration/100) = flour * (1 + hydration/100)
export function calculateFlourWaterFromTarget(totalWeightGrams: number, hydrationPercent: number): { flour: number; water: number } {
  const flour = totalWeightGrams / (1 + hydrationPercent / 100)
  return { flour, water: totalWeightGrams - flour }
}

// Same heuristic used throughout the app's AI prompts (troubleshooter, bake schedule):
// every 10°F change roughly doubles or halves fermentation speed. 78°F is the baseline
// "normal room temperature" reference already used in generated recipe/schedule text
// elsewhere in the app.
export const BASELINE_FERMENTATION_TEMP_F = 78

export function calculateAdjustedFermentationHours(baselineHours: number, actualTempF: number): number {
  return baselineHours * Math.pow(2, (BASELINE_FERMENTATION_TEMP_F - actualTempF) / 10)
}

// Formats a fractional hour count as "4 hr 30 min" prose, distinct from bake-timer's
// formatCountdown (which renders a live MM:SS/H:MM:SS countdown, not this kind of estimate).
export function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

// --- Baker's percentages (Advanced Mode on recipe pages) ---
//
// Ingredient amounts are free text ("450g", "1½ cups (180g)", "1 tablespoon", "as needed") —
// there's no structured unit/quantity field to work from. We only trust a gram figure lifted
// directly out of that text; anything without one (volume-only measures, "as needed", egg
// counts) simply opts out of the percentage math rather than blocking the rest of the recipe.
//
// A starter/levain/discard entry is itself flour + water already mixed together, not a
// separate "other" ingredient — folding its gram weight straight into "other" would understate
// both total flour and true hydration on every sourdough recipe. So it gets split into its
// flour/water components (using a stated "NN% hydration" from its note if the recipe gives one,
// defaulting to 100% — equal parts flour and water by weight — otherwise) and both halves are
// folded into the running totals, matching how a professional formula accounts for a preferment.

export type IngredientRole = 'flour' | 'water' | 'starter' | 'other'

export interface BakersPercentageIngredient {
  item: string
  amount: string
  note?: string
}

export interface BakersPercentageRow extends BakersPercentageIngredient {
  role: IngredientRole
  grams: number | null
  percentOfFlour: number | null
  starterBreakdown: { flourGrams: number; waterGrams: number; hydrationPercent: number; hydrationStated: boolean } | null
}

export interface BakersPercentageResult {
  rows: BakersPercentageRow[]
  totalFlourGrams: number | null
  totalWaterGrams: number | null
  trueHydrationPercent: number | null
}

const FLOUR_KEYWORD = /\bflour\b/i
const WATER_KEYWORD = /\bwater\b/i
const STARTER_KEYWORD = /\b(?:starter|levain|leaven|discard)\b/i
const STATED_HYDRATION_PATTERN = /(\d+(?:\.\d+)?)\s*%\s*hydration/i

export const DEFAULT_STARTER_HYDRATION_PERCENT = 100

export function classifyIngredientRole(item: string): IngredientRole {
  if (STARTER_KEYWORD.test(item)) return 'starter'
  if (FLOUR_KEYWORD.test(item)) return 'flour'
  if (WATER_KEYWORD.test(item)) return 'water'
  return 'other'
}

// Grabs the first gram figure in the amount text, e.g. "115g" out of "4 ounces (115g)" or
// "150g" out of "150g (about 1½ cups)". Ignores cup/tablespoon/teaspoon-only amounts entirely
// rather than guessing a density-based conversion, since that varies wildly by ingredient.
export function extractGramsFromAmount(amount: string): number | null {
  const match = amount.match(/(\d+(?:\.\d+)?)\s*g\b/i)
  return match ? Number(match[1]) : null
}

function splitStarterGrams(grams: number, note: string | undefined) {
  const stated = note?.match(STATED_HYDRATION_PATTERN)
  const hydrationPercent = stated ? Number(stated[1]) : DEFAULT_STARTER_HYDRATION_PERCENT
  const flourGrams = grams / (1 + hydrationPercent / 100)
  const waterGrams = grams - flourGrams
  return { flourGrams, waterGrams, hydrationPercent, hydrationStated: Boolean(stated) }
}

export function calculateBakersPercentages(ingredients: BakersPercentageIngredient[]): BakersPercentageResult {
  let totalFlourGrams = 0
  let totalWaterGrams = 0
  let haveFlour = false

  const parsed = ingredients.map(ingredient => {
    const role = classifyIngredientRole(ingredient.item)
    const grams = extractGramsFromAmount(ingredient.amount)
    const starterBreakdown = role === 'starter' && grams !== null ? splitStarterGrams(grams, ingredient.note) : null
    return { ingredient, role, grams, starterBreakdown }
  })

  for (const { role, grams, starterBreakdown } of parsed) {
    if (grams === null) continue
    if (role === 'flour') {
      totalFlourGrams += grams
      haveFlour = true
    } else if (role === 'water') {
      totalWaterGrams += grams
    } else if (starterBreakdown) {
      totalFlourGrams += starterBreakdown.flourGrams
      totalWaterGrams += starterBreakdown.waterGrams
      haveFlour = true
    }
  }

  const finalTotalFlour = haveFlour ? totalFlourGrams : null
  const finalTotalWater = haveFlour ? totalWaterGrams : null
  const trueHydrationPercent = finalTotalFlour && finalTotalFlour > 0 ? (finalTotalWater! / finalTotalFlour) * 100 : null

  const rows: BakersPercentageRow[] = parsed.map(({ ingredient, role, grams, starterBreakdown }) => ({
    ...ingredient,
    role,
    grams,
    percentOfFlour: grams !== null && finalTotalFlour ? (grams / finalTotalFlour) * 100 : null,
    starterBreakdown,
  }))

  return { rows, totalFlourGrams: finalTotalFlour, totalWaterGrams: finalTotalWater, trueHydrationPercent }
}
