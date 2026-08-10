import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  IDLE_STATE,
  clearTimerState,
  doneState,
  isExpired,
  pauseState,
  readTimerState,
  remainingSeconds,
  startState,
  writeTimerState,
  type StepTimerState,
} from './step-timer'

describe('remainingSeconds', () => {
  it('returns the full duration for an idle timer', () => {
    expect(remainingSeconds(600, IDLE_STATE, Date.now())).toBe(600)
  })

  it('subtracts elapsed time since startedAt while running', () => {
    const state: StepTimerState = { status: 'running', startedAt: 1000, elapsedBeforePause: 0 }
    expect(remainingSeconds(600, state, 1000 + 90_000)).toBe(510)
  })

  it('accounts for time already consumed before a pause', () => {
    const state: StepTimerState = { status: 'running', startedAt: 5000, elapsedBeforePause: 200 }
    expect(remainingSeconds(600, state, 5000 + 60_000)).toBe(340)
  })

  it('holds steady while paused, ignoring `now`', () => {
    const state: StepTimerState = { status: 'paused', startedAt: null, elapsedBeforePause: 250 }
    expect(remainingSeconds(600, state, Date.now())).toBe(350)
  })
})

describe('isExpired', () => {
  it('is false when running with time left', () => {
    const state: StepTimerState = { status: 'running', startedAt: 0, elapsedBeforePause: 0 }
    expect(isExpired(600, state, 60_000)).toBe(false)
  })

  it('is true once the running countdown reaches zero', () => {
    const state: StepTimerState = { status: 'running', startedAt: 0, elapsedBeforePause: 0 }
    expect(isExpired(600, state, 600_000)).toBe(true)
  })

  it('is false when paused, even past the original duration', () => {
    const state: StepTimerState = { status: 'paused', startedAt: null, elapsedBeforePause: 9999 }
    expect(isExpired(600, state, Date.now())).toBe(false)
  })
})

describe('startState', () => {
  it('starts fresh from idle', () => {
    expect(startState(IDLE_STATE, 1000)).toEqual({ status: 'running', startedAt: 1000, elapsedBeforePause: 0 })
  })

  it('resumes from paused, keeping accumulated elapsed time', () => {
    const paused: StepTimerState = { status: 'paused', startedAt: null, elapsedBeforePause: 120 }
    expect(startState(paused, 5000)).toEqual({ status: 'running', startedAt: 5000, elapsedBeforePause: 120 })
  })
})

describe('pauseState', () => {
  it('folds the current run segment into elapsedBeforePause', () => {
    const state: StepTimerState = { status: 'running', startedAt: 1000, elapsedBeforePause: 60 }
    expect(pauseState(state, 1000 + 30_000)).toEqual({ status: 'paused', startedAt: null, elapsedBeforePause: 90 })
  })

  it('is a no-op on elapsed time if somehow called without a startedAt', () => {
    const state: StepTimerState = { status: 'paused', startedAt: null, elapsedBeforePause: 45 }
    expect(pauseState(state, Date.now())).toEqual({ status: 'paused', startedAt: null, elapsedBeforePause: 45 })
  })
})

describe('doneState', () => {
  it('consumes the full duration', () => {
    expect(doneState(600)).toEqual({ status: 'done', startedAt: null, elapsedBeforePause: 600 })
  })
})

describe('localStorage persistence', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null when nothing is stored', () => {
    expect(readTimerState('recipe-1', 0)).toBeNull()
  })

  it('round-trips a written state', () => {
    const state: StepTimerState = { status: 'running', startedAt: 1234, elapsedBeforePause: 10 }
    writeTimerState('recipe-1', 2, state)
    expect(readTimerState('recipe-1', 2)).toEqual(state)
  })

  it('keys state independently per recipe and step index', () => {
    writeTimerState('recipe-1', 0, { status: 'paused', startedAt: null, elapsedBeforePause: 5 })
    writeTimerState('recipe-1', 1, { status: 'running', startedAt: 99, elapsedBeforePause: 0 })
    writeTimerState('recipe-2', 0, { status: 'done', startedAt: null, elapsedBeforePause: 600 })

    expect(readTimerState('recipe-1', 0)).toEqual({ status: 'paused', startedAt: null, elapsedBeforePause: 5 })
    expect(readTimerState('recipe-1', 1)).toEqual({ status: 'running', startedAt: 99, elapsedBeforePause: 0 })
    expect(readTimerState('recipe-2', 0)).toEqual({ status: 'done', startedAt: null, elapsedBeforePause: 600 })
  })

  it('clears stored state', () => {
    writeTimerState('recipe-1', 0, { status: 'done', startedAt: null, elapsedBeforePause: 600 })
    clearTimerState('recipe-1', 0)
    expect(readTimerState('recipe-1', 0)).toBeNull()
  })

  it('ignores malformed JSON rather than throwing', () => {
    store.set('byl:recipe-timer:recipe-1:0', '{not valid json')
    expect(readTimerState('recipe-1', 0)).toBeNull()
  })
})
