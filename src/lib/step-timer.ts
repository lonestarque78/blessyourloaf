export type StepTimerStatus = 'idle' | 'running' | 'paused' | 'done'

export interface StepTimerState {
  status: StepTimerStatus
  startedAt: number | null // epoch ms, set only while running
  elapsedBeforePause: number // seconds already consumed by prior run segments
}

export const IDLE_STATE: StepTimerState = { status: 'idle', startedAt: null, elapsedBeforePause: 0 }

// Remaining seconds, recomputed from a stored start timestamp vs. `now` rather than a raw
// interval decrement — the same drift-safe approach BakeCoach uses, so a throttled background
// tab or a phone screen lock doesn't desync the countdown.
export function remainingSeconds(totalSeconds: number, state: StepTimerState, now: number): number {
  if (state.status === 'running' && state.startedAt !== null) {
    return totalSeconds - state.elapsedBeforePause - (now - state.startedAt) / 1000
  }
  return totalSeconds - state.elapsedBeforePause
}

export function isExpired(totalSeconds: number, state: StepTimerState, now: number): boolean {
  return state.status === 'running' && remainingSeconds(totalSeconds, state, now) <= 0
}

export function startState(state: StepTimerState, now: number): StepTimerState {
  return { status: 'running', startedAt: now, elapsedBeforePause: state.elapsedBeforePause }
}

export function pauseState(state: StepTimerState, now: number): StepTimerState {
  const elapsedBeforePause = state.startedAt !== null
    ? state.elapsedBeforePause + (now - state.startedAt) / 1000
    : state.elapsedBeforePause
  return { status: 'paused', startedAt: null, elapsedBeforePause }
}

export function doneState(totalSeconds: number): StepTimerState {
  return { status: 'done', startedAt: null, elapsedBeforePause: totalSeconds }
}

function storageKey(recipeId: string, stepIndex: number): string {
  return `byl:recipe-timer:${recipeId}:${stepIndex}`
}

function isStepTimerState(value: unknown): value is StepTimerState {
  return typeof value === 'object' && value !== null && 'status' in value && 'elapsedBeforePause' in value
}

// Reads/writes are wrapped in try/catch — private browsing (Safari) and storage-quota errors
// throw synchronously, and losing persistence shouldn't break the timer itself for this tab.
export function readTimerState(recipeId: string, stepIndex: number): StepTimerState | null {
  try {
    const raw = localStorage.getItem(storageKey(recipeId, stepIndex))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isStepTimerState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeTimerState(recipeId: string, stepIndex: number, state: StepTimerState): void {
  try {
    localStorage.setItem(storageKey(recipeId, stepIndex), JSON.stringify(state))
  } catch {
    // ignore — timer keeps working in-memory for this tab
  }
}

export function clearTimerState(recipeId: string, stepIndex: number): void {
  try {
    localStorage.removeItem(storageKey(recipeId, stepIndex))
  } catch {
    // ignore
  }
}
