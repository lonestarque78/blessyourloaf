'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BAKE_PHASE_ICONS, BAKE_PHASE_LABELS, formatCountdown, normalizeBakePhase, parseDurationSeconds } from '@/lib/bake-timer'

interface Step {
  time: string
  action: string
  duration: string
  note: string
  phase?: string
}

interface ProgressRow {
  step_index: number
  started_at: string | null
  completed_at: string | null
}

interface Schedule {
  id: string
  recipe_name: string | null
  target_ready_at: string | null
  completed: boolean
  steps: Step[]
}

interface Props {
  schedule: Schedule
  initialProgress: ProgressRow[]
}

type ProgressMap = Record<number, { started_at: string | null; completed_at: string | null }>

function toProgressMap(rows: ProgressRow[]): ProgressMap {
  const map: ProgressMap = {}
  for (const row of rows) map[row.step_index] = { started_at: row.started_at, completed_at: row.completed_at }
  return map
}

export default function BakeCoach({ schedule, initialProgress }: Props) {
  const steps = schedule.steps
  const [progress, setProgress] = useState<ProgressMap>(() => toProgressMap(initialProgress))
  const [busyIndex, setBusyIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  // The clock lives in state, set only from the effect below — reading Date.now() directly
  // during render would make render impure (and, incidentally, risk a hydration mismatch).
  // null until the effect's first tick; countdowns simply don't render for that one frame.
  const [now, setNow] = useState<number | null>(null)

  // Re-renders every second so live countdowns update. The actual remaining time is always
  // recomputed from started_at (a server timestamp) vs. this state, never a raw interval
  // count, so a page reload or a browser closed for hours picks back up correctly.
  useEffect(() => {
    // Seed the clock on mount, then keep it ticking — standard live-clock pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const currentIndex = useMemo(() => steps.findIndex((_, i) => !progress[i]?.completed_at), [steps, progress])
  const allDone = currentIndex === -1
  const doneCount = steps.length - (allDone ? 0 : steps.length - currentIndex)

  const currentStep = allDone ? null : steps[currentIndex]
  const currentProgress = allDone ? null : progress[currentIndex]
  const currentDurationSeconds = currentStep ? parseDurationSeconds(currentStep.duration) : null

  let remainingSeconds: number | null = null
  if (now !== null && currentProgress?.started_at && currentDurationSeconds !== null) {
    const elapsed = (now - new Date(currentProgress.started_at).getTime()) / 1000
    remainingSeconds = currentDurationSeconds - elapsed
  }
  const isReady = remainingSeconds !== null && remainingSeconds <= 0

  // In-app cue for a finished timer when you're on the page — no OS-level push notifications
  // (that needs a service worker, which is Phase 7 / offline-mode work, not built yet).
  useEffect(() => {
    if (!isReady) return
    const original = document.title
    document.title = '🍞 Ready! — Bless Your Loaf'
    return () => { document.title = original }
  }, [isReady])

  async function postProgress(stepIndex: number, action: 'start' | 'complete' | 'reopen') {
    setBusyIndex(stepIndex)
    setError('')
    try {
      const res = await fetch(`/api/bake-schedule/${schedule.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepIndex, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't update that step, sugar — try again.")
        return
      }
      setProgress(prev => ({
        ...prev,
        [stepIndex]: { started_at: data.progress.started_at, completed_at: data.progress.completed_at },
      }))
    } catch {
      setError("Couldn't reach the kitchen — please try again, darlin'.")
    } finally {
      setBusyIndex(null)
    }
  }

  if (allDone) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-md border border-[#f0e4db] text-center">
        <div className="text-6xl mb-6">🍞</div>
        <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-3">
          You did it, sugar!
        </h1>
        <p className="font-lora italic text-[#9a7060] mb-8 max-w-sm mx-auto">
          &quot;Another beautiful loaf in the books. Go on and admire your work.&quot;
        </p>
        <Link href={`/dashboard/history/${schedule.id}`}
          className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora hover:-translate-y-0.5 transition-transform shadow-md">
          View This Bake
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">👩‍🍳</div>
        <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-2">
          {schedule.recipe_name || 'Your Bake'}
        </h1>
        <p className="font-lora italic text-sm text-[#9a7060]">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <div className="w-full max-w-xs mx-auto h-2 bg-[#f0e4db] rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-6">
          <p className="font-lora text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#c9956c] to-[#b5838d]" />
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = progress[index]?.completed_at ? 'done' : index === currentIndex ? 'current' : 'upcoming'
            const phase = normalizeBakePhase(step.phase)

            if (status === 'upcoming') {
              return (
                <div key={index} className="flex gap-6 relative opacity-40">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-white border-2 border-[#e8d5c8] text-[#c8a99a] text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="font-lora text-sm text-[#9a7060]">{step.action}</div>
                  </div>
                </div>
              )
            }

            if (status === 'done') {
              return (
                <div key={index} className="flex gap-6 relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-[#f0e4db] text-[#b07d62]">
                    ✓
                  </div>
                  <div className="flex-1 pb-2 flex items-center justify-between gap-3">
                    <div className="font-lora text-sm text-[#9a7060] line-through decoration-[#c8a99a]">{step.action}</div>
                    <button
                      onClick={() => postProgress(index, 'reopen')}
                      disabled={busyIndex === index}
                      className="font-lora text-xs text-[#b07d62] hover:underline flex-shrink-0 disabled:opacity-50"
                    >
                      Undo
                    </button>
                  </div>
                </div>
              )
            }

            // current
            const started = Boolean(progress[index]?.started_at)
            return (
              <div key={index} className="flex gap-6 relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white shadow-md ring-4 ring-[#f9ede5]">
                  {BAKE_PHASE_ICONS[phase]}
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-md border border-[#f0e4db]">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-lora text-xs uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#f9ede5] text-[#b07d62]">
                      {BAKE_PHASE_LABELS[phase]}
                    </span>
                    {step.duration && (
                      <span className="font-lora text-xs text-[#9a7060] bg-[#fdf6f0] px-2.5 py-1 rounded-full border border-[#f0e4db]">
                        {step.duration}
                      </span>
                    )}
                  </div>

                  <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-1">{step.action}</h2>
                  {step.time && (
                    <p className="font-lora text-xs text-[#9a7060] mb-2">Originally planned for {step.time}</p>
                  )}
                  {step.note && (
                    <p className="font-lora italic text-sm text-[#7a4f3a] mb-4">&quot;{step.note}&quot;</p>
                  )}

                  {/* Timer */}
                  {currentDurationSeconds !== null && (
                    <div className="mb-4">
                      {!started ? (
                        <button
                          onClick={() => postProgress(index, 'start')}
                          disabled={busyIndex === index}
                          className="font-lora text-sm px-5 py-2.5 rounded-full border border-[#c9956c] text-[#b07d62] hover:bg-[#f9ede5] transition-colors disabled:opacity-50"
                        >
                          Start Timer
                        </button>
                      ) : isReady ? (
                        <p className="font-lora text-lg font-semibold" style={{ color: '#b5838d' }}>
                          Time&apos;s up, darlin&apos;! 🍞
                        </p>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-2xl font-bold text-[#c9956c]">
                            {remainingSeconds !== null ? formatCountdown(remainingSeconds) : null}
                          </span>
                          <button
                            onClick={() => postProgress(index, 'reopen')}
                            disabled={busyIndex === index}
                            className="font-lora text-xs text-[#9a7060] hover:underline disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => postProgress(index, 'complete')}
                    disabled={busyIndex === index}
                    className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {busyIndex === index ? "Savin'..." : 'Mark Done →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
