'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatCountdown } from '@/lib/bake-timer'
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
} from '@/lib/step-timer'

interface Props {
  recipeId: string
  stepIndex: number
  durationMinutes: number
}

export default function StepTimer({ recipeId, stepIndex, durationMinutes }: Props) {
  const t = useTranslations('MyRecipes.detail')
  const totalSeconds = durationMinutes * 60

  const [state, setState] = useState<StepTimerState>(IDLE_STATE)
  // The clock lives in state, set only from the effect below — reading Date.now() directly
  // during render would make render impure (and risk a hydration mismatch), same pattern as
  // BakeCoach's countdown.
  const [now, setNow] = useState<number | null>(null)

  // Hydrate from localStorage after mount only — reading it during render (this component is
  // still server-rendered for the initial HTML) would throw server-side and desync from the
  // server-rendered "idle" markup.
  useEffect(() => {
    const stored = readTimerState(recipeId, stepIndex)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setState(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.status !== 'running') return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [state.status])

  let remaining: number | null = null
  let expired = false
  if (now !== null) {
    remaining = remainingSeconds(totalSeconds, state, now)
    expired = isExpired(totalSeconds, state, now)
  }

  useEffect(() => {
    if (!expired) return
    const next = doneState(totalSeconds)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next)
    writeTimerState(recipeId, stepIndex, next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired])

  function handleStart() {
    const next = startState(state, Date.now())
    setState(next)
    writeTimerState(recipeId, stepIndex, next)
  }

  function handlePause() {
    const next = pauseState(state, Date.now())
    setState(next)
    writeTimerState(recipeId, stepIndex, next)
  }

  function handleReset() {
    setState(IDLE_STATE)
    clearTimerState(recipeId, stepIndex)
  }

  if (state.status === 'idle') {
    return (
      <button
        onClick={handleStart}
        className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2.5 py-1 rounded-full hover:bg-[#f0e4db] transition-colors"
      >
        {t('minutesShort', { count: durationMinutes })}
      </button>
    )
  }

  if (state.status === 'done') {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span className="font-lora text-xs font-semibold" style={{ color: '#b5838d' }}>
          {t('timerDone')}
        </span>
        <button onClick={handleReset} className="font-lora text-xs text-[#9a7060] hover:underline">
          {t('timerReset')}
        </button>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span className="font-mono text-xs font-bold text-[#c9956c]">
        {remaining !== null ? formatCountdown(Math.max(0, remaining)) : null}
      </span>
      {state.status === 'running' ? (
        <button onClick={handlePause} className="font-lora text-xs text-[#b07d62] hover:underline">
          {t('timerPause')}
        </button>
      ) : (
        <button onClick={handleStart} className="font-lora text-xs text-[#b07d62] hover:underline">
          {t('timerResume')}
        </button>
      )}
      <button onClick={handleReset} className="font-lora text-xs text-[#9a7060] hover:underline">
        {t('timerReset')}
      </button>
    </span>
  )
}
