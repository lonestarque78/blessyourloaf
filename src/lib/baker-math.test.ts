import { describe, expect, it } from 'vitest'
import {
  calculateAdjustedFermentationHours,
  calculateFlourWaterFromTarget,
  calculateHydrationPercent,
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
