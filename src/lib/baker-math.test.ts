import { describe, expect, it } from 'vitest'
import {
  calculateAdjustedFermentationHours,
  calculateBakersPercentages,
  calculateFlourWaterFromTarget,
  calculateHydrationPercent,
  classifyIngredientRole,
  extractGramsFromAmount,
  formatHoursMinutes,
} from './baker-math'

describe('calculateHydrationPercent', () => {
  it('computes water as a percentage of flour', () => {
    expect(calculateHydrationPercent(500, 375)).toBe(75)
    expect(calculateHydrationPercent(100, 100)).toBe(100)
    expect(calculateHydrationPercent(400, 260)).toBe(65)
  })
})

describe('calculateFlourWaterFromTarget', () => {
  it('back-solves flour and water that sum to the total at the target hydration', () => {
    const { flour, water } = calculateFlourWaterFromTarget(900, 75)
    expect(flour + water).toBeCloseTo(900, 5)
    expect(calculateHydrationPercent(flour, water)).toBeCloseTo(75, 5)
  })

  it('matches a hand-checked example', () => {
    // 500g flour + 375g water = 875g total at 75% hydration
    const { flour, water } = calculateFlourWaterFromTarget(875, 75)
    expect(flour).toBeCloseTo(500, 1)
    expect(water).toBeCloseTo(375, 1)
  })
})

describe('calculateAdjustedFermentationHours', () => {
  it('halves the time for every 10°F warmer than baseline', () => {
    expect(calculateAdjustedFermentationHours(4, 88)).toBeCloseTo(2, 5)
    expect(calculateAdjustedFermentationHours(4, 98)).toBeCloseTo(1, 5)
  })

  it('doubles the time for every 10°F cooler than baseline', () => {
    expect(calculateAdjustedFermentationHours(4, 68)).toBeCloseTo(8, 5)
    expect(calculateAdjustedFermentationHours(4, 58)).toBeCloseTo(16, 5)
  })

  it('returns the baseline unchanged at the baseline temperature', () => {
    expect(calculateAdjustedFermentationHours(4, 78)).toBeCloseTo(4, 5)
  })
})

describe('formatHoursMinutes', () => {
  it('formats whole hours', () => {
    expect(formatHoursMinutes(4)).toBe('4 hr')
  })

  it('formats minutes only under an hour', () => {
    expect(formatHoursMinutes(0.5)).toBe('30 min')
  })

  it('formats combined hours and minutes', () => {
    expect(formatHoursMinutes(2.25)).toBe('2 hr 15 min')
  })
})

describe('extractGramsFromAmount', () => {
  it('reads a standalone gram amount', () => {
    expect(extractGramsFromAmount('450g')).toBe(450)
  })

  it('reads a gram amount tucked inside a parenthetical', () => {
    expect(extractGramsFromAmount('1½ cups (180g)')).toBe(180)
    expect(extractGramsFromAmount('4 ounces (115g)')).toBe(115)
    expect(extractGramsFromAmount('150g (about 1½ cups)')).toBe(150)
  })

  it('returns null when no gram figure is present', () => {
    expect(extractGramsFromAmount('1 tablespoon')).toBeNull()
    expect(extractGramsFromAmount('as needed')).toBeNull()
    expect(extractGramsFromAmount('2–3 medium (about ½ cup)')).toBeNull()
    expect(extractGramsFromAmount('1')).toBeNull()
  })
})

describe('classifyIngredientRole', () => {
  it('recognizes flour by keyword', () => {
    expect(classifyIngredientRole('bread flour')).toBe('flour')
    expect(classifyIngredientRole('whole wheat flour')).toBe('flour')
  })

  it('recognizes water by keyword', () => {
    expect(classifyIngredientRole('filtered water, divided')).toBe('water')
  })

  it('recognizes starter, levain, and discard as starter', () => {
    expect(classifyIngredientRole('active sourdough starter')).toBe('starter')
    expect(classifyIngredientRole('stiff levain')).toBe('starter')
    expect(classifyIngredientRole('sourdough starter discard')).toBe('starter')
  })

  it('starter keyword wins over flour keyword when both appear', () => {
    expect(classifyIngredientRole('rye flour starter')).toBe('starter')
  })

  it('falls back to other', () => {
    expect(classifyIngredientRole('fine sea salt')).toBe('other')
  })
})

describe('calculateBakersPercentages', () => {
  it('folds a starter\'s own flour and water into the totals (default 100% hydration)', () => {
    // A real seeded loaf: 450g bread flour + 50g whole wheat + 375g water + 100g starter
    // (100% hydration, stated in its note) + 10g salt.
    const result = calculateBakersPercentages([
      { item: 'bread flour', amount: '450g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '375g', note: '350g for autolyse, 25g to dissolve salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration, fed 4–12 hours before use' },
      { item: 'fine sea salt', amount: '10g' },
    ])

    // Starter splits into 50g flour + 50g water, so total flour = 450+50+50 = 550,
    // total water = 375+50 = 425 — hydration is higher than the naive 375/500 = 75%.
    expect(result.totalFlourGrams).toBeCloseTo(550, 5)
    expect(result.totalWaterGrams).toBeCloseTo(425, 5)
    expect(result.trueHydrationPercent).toBeCloseTo((425 / 550) * 100, 5)

    const starterRow = result.rows.find(r => r.item === 'active sourdough starter')!
    expect(starterRow.role).toBe('starter')
    expect(starterRow.percentOfFlour).toBeCloseTo((100 / 550) * 100, 5)
    expect(starterRow.starterBreakdown).toEqual({ flourGrams: 50, waterGrams: 50, hydrationPercent: 100, hydrationStated: true })

    const saltRow = result.rows.find(r => r.item === 'fine sea salt')!
    expect(saltRow.percentOfFlour).toBeCloseTo((10 / 550) * 100, 5)
  })

  it('defaults an unstated starter hydration to 100% (50/50 split)', () => {
    const result = calculateBakersPercentages([
      { item: 'bread flour', amount: '500g' },
      { item: 'water', amount: '300g' },
      { item: 'starter', amount: '100g' },
    ])

    const starterRow = result.rows[2]
    expect(starterRow.starterBreakdown).toEqual({ flourGrams: 50, waterGrams: 50, hydrationPercent: 100, hydrationStated: false })
    expect(result.totalFlourGrams).toBeCloseTo(550, 5)
  })

  it('honors a stated non-default starter hydration', () => {
    const result = calculateBakersPercentages([
      { item: 'bread flour', amount: '500g' },
      { item: 'stiff levain', amount: '150g', note: 'built at 50% hydration' },
    ])

    // 150g at 50% hydration: flour = 150 / 1.5 = 100g, water = 50g.
    const levainRow = result.rows[1]
    expect(levainRow.starterBreakdown!.flourGrams).toBeCloseTo(100, 5)
    expect(levainRow.starterBreakdown!.waterGrams).toBeCloseTo(50, 5)
    expect(levainRow.starterBreakdown!.hydrationStated).toBe(true)
    expect(result.totalFlourGrams).toBeCloseTo(600, 5)
  })

  it('leaves ingredients without a gram figure out of the math without blocking the rest', () => {
    const result = calculateBakersPercentages([
      { item: 'bread flour', amount: '500g' },
      { item: 'water', amount: '375g' },
      { item: 'rice flour', amount: 'as needed', note: 'for dusting the banneton' },
      { item: 'sesame seeds', amount: '2 tablespoons' },
    ])

    expect(result.totalFlourGrams).toBeCloseTo(500, 5)
    const riceFlourRow = result.rows.find(r => r.item === 'rice flour')!
    expect(riceFlourRow.grams).toBeNull()
    expect(riceFlourRow.percentOfFlour).toBeNull()
    const sesameRow = result.rows.find(r => r.item === 'sesame seeds')!
    expect(sesameRow.grams).toBeNull()
    expect(sesameRow.percentOfFlour).toBeNull()

    const flourRow = result.rows.find(r => r.item === 'bread flour')!
    expect(flourRow.percentOfFlour).toBeCloseTo(100, 5)
  })

  it('derives total flour from a starter/discard alone when no flour ingredient is listed separately', () => {
    // A discard-recipe pattern: discard supplies the only flour-equivalent weight.
    const result = calculateBakersPercentages([
      { item: 'sourdough starter discard', amount: '1 cup (240g)', note: 'unfed, room temperature' },
      { item: 'large egg', amount: '1' },
    ])

    // 240g at the default 100% hydration splits into 120g flour + 120g water.
    expect(result.totalFlourGrams).toBeCloseTo(120, 5)
  })

  it('returns null totals and no percentages when no flour-equivalent grams can be found', () => {
    const result = calculateBakersPercentages([
      { item: 'all-purpose flour', amount: '1 cup' },
      { item: 'large egg', amount: '1' },
      { item: 'buttermilk', amount: '¾ cup' },
    ])
    expect(result.totalFlourGrams).toBeNull()
    expect(result.totalWaterGrams).toBeNull()
    expect(result.trueHydrationPercent).toBeNull()
    expect(result.rows.every(r => r.percentOfFlour === null)).toBe(true)
  })

  it('sums multiple flour types before folding in the starter', () => {
    const result = calculateBakersPercentages([
      { item: 'bread flour', amount: '300g' },
      { item: 'dark rye flour', amount: '150g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'water', amount: '375g' },
      { item: 'starter', amount: '150g', note: '100% hydration' },
    ])

    // 300+150+50 direct flour + 75g from the starter's split = 575.
    expect(result.totalFlourGrams).toBeCloseTo(575, 5)
    const ryeRow = result.rows.find(r => r.item === 'dark rye flour')!
    expect(ryeRow.percentOfFlour).toBeCloseTo((150 / 575) * 100, 5)
  })
})
