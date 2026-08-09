import { describe, expect, it } from 'vitest'
import { formatCountdown, normalizeBakePhase, parseDurationSeconds } from './bake-timer'

describe('parseDurationSeconds', () => {
  it('parses minutes', () => {
    expect(parseDurationSeconds('30 minutes')).toBe(1800)
    expect(parseDurationSeconds('45 min')).toBe(2700)
  })

  it('parses hours', () => {
    expect(parseDurationSeconds('1 hour')).toBe(3600)
    expect(parseDurationSeconds('12 hours')).toBe(43200)
  })

  it('parses combined hours and minutes', () => {
    expect(parseDurationSeconds('1 hour 30 minutes')).toBe(5400)
  })

  it('returns null when nothing is parseable', () => {
    expect(parseDurationSeconds('until doubled')).toBeNull()
    expect(parseDurationSeconds('')).toBeNull()
  })
})

describe('formatCountdown', () => {
  it('formats under an hour as MM:SS', () => {
    expect(formatCountdown(90)).toBe('01:30')
    expect(formatCountdown(5)).toBe('00:05')
  })

  it('formats an hour or more as H:MM:SS', () => {
    expect(formatCountdown(3661)).toBe('1:01:01')
    expect(formatCountdown(43200)).toBe('12:00:00')
  })

  it('clamps negative input to zero rather than showing a negative countdown', () => {
    expect(formatCountdown(-5)).toBe('00:00')
  })
})

describe('normalizeBakePhase', () => {
  it('passes through recognized phases', () => {
    expect(normalizeBakePhase('autolyse')).toBe('autolyse')
    expect(normalizeBakePhase('bulk_fermentation')).toBe('bulk_fermentation')
    expect(normalizeBakePhase('proofing')).toBe('proofing')
    expect(normalizeBakePhase('bake')).toBe('bake')
  })

  it('defaults to other for missing, unrecognized, or non-string values', () => {
    expect(normalizeBakePhase(undefined)).toBe('other')
    expect(normalizeBakePhase('mixing')).toBe('other')
    expect(normalizeBakePhase(42)).toBe('other')
    expect(normalizeBakePhase(null)).toBe('other')
  })
})
