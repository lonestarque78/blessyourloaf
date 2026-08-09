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
