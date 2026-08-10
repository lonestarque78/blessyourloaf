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
} from '../lib/step-timer'
import { formatCountdown } from '../lib/bake-timer'
import type { OfflineRecipeStrings } from './strings'

// DOM glue only — the actual timer math lives in step-timer.ts (same module the online
// StepTimer.tsx component uses) and is unit-tested there. This mounts one interactive
// timer per `[data-step-timer]` placeholder left by render-recipe.ts, reading and writing
// the exact same localStorage keys, so a timer started online and continued offline (or
// vice versa) is one continuous timer.
export function mountStepTimers(root: ParentNode, recipeId: string, strings: OfflineRecipeStrings): void {
  root.querySelectorAll<HTMLElement>('[data-step-timer]').forEach((el) => {
    const stepIndex = Number(el.dataset.stepIndex)
    const durationMinutes = Number(el.dataset.durationMinutes)
    if (Number.isNaN(stepIndex) || Number.isNaN(durationMinutes)) return
    mountStepTimer(el, recipeId, stepIndex, durationMinutes, strings)
  })
}

function mountStepTimer(
  el: HTMLElement,
  recipeId: string,
  stepIndex: number,
  durationMinutes: number,
  strings: OfflineRecipeStrings
): void {
  const totalSeconds = durationMinutes * 60
  let state: StepTimerState = readTimerState(recipeId, stepIndex) ?? IDLE_STATE
  let interval: ReturnType<typeof setInterval> | null = null

  function stopTicking(): void {
    if (interval !== null) {
      clearInterval(interval)
      interval = null
    }
  }

  function startTicking(): void {
    stopTicking()
    if (state.status === 'running') interval = setInterval(render, 1000)
  }

  function render(): void {
    const now = Date.now()

    if (state.status === 'running' && isExpired(totalSeconds, state, now)) {
      state = doneState(totalSeconds)
      writeTimerState(recipeId, stepIndex, state)
      stopTicking()
    }

    el.replaceChildren()

    if (state.status === 'idle') {
      el.appendChild(makeButton(strings.minutesShort(durationMinutes), start))
      return
    }

    if (state.status === 'done') {
      el.appendChild(makeSpan(strings.timerDone, 'timer-done'))
      el.appendChild(makeButton(strings.timerReset, reset))
      return
    }

    el.appendChild(makeSpan(formatCountdown(Math.max(0, remainingSeconds(totalSeconds, state, now))), 'timer-countdown'))
    el.appendChild(makeButton(state.status === 'running' ? strings.timerPause : strings.timerResume, state.status === 'running' ? pause : start))
    el.appendChild(makeButton(strings.timerReset, reset))
  }

  function start(): void {
    state = startState(state, Date.now())
    writeTimerState(recipeId, stepIndex, state)
    startTicking()
    render()
  }

  function pause(): void {
    state = pauseState(state, Date.now())
    writeTimerState(recipeId, stepIndex, state)
    stopTicking()
    render()
  }

  function reset(): void {
    state = IDLE_STATE
    clearTimerState(recipeId, stepIndex)
    stopTicking()
    render()
  }

  function makeButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = label
    button.addEventListener('click', onClick)
    return button
  }

  function makeSpan(text: string, className: string): HTMLSpanElement {
    const span = document.createElement('span')
    span.className = className
    span.textContent = text
    return span
  }

  startTicking()
  render()
}
