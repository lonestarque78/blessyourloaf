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

  // Guaranteed non-null past the allDone return above — steps[currentIndex] exists whenever
  // currentIndex !== -1.
  const step = currentStep!
  const phase = normalizeBakePhase(step.phase)
  const started = Boolean(currentProgress?.started_at)

  return (
    // lg:h-[...] + flex is what makes the current step reachable without scrolling on a normal
    // desktop viewport: the sidebar log and the main card both stretch to this fixed height and
    // scroll internally if they overflow it, instead of growing the page. Below the lg
    // breakpoint this collapses to plain stacked flow (current step first, log below) — mobile
    // scrolling is an accepted tradeoff, not something this layout tries to eliminate too.
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8.5rem)] lg:min-h-[420px]">
      {/* Sidebar: recipe header, progress, and a compact log of every step */}
      <aside className="order-2 lg:order-1 lg:w-64 flex-shrink-0 lg:overflow-y-auto lg:pr-1">
        <div className="mb-5">
          <h1 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-1">
            {schedule.recipe_name || 'Your Bake'}
          </h1>
          <p className="font-lora italic text-xs text-[#9a7060] mb-2">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <div className="w-full h-2 bg-[#f0e4db] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] transition-all"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
            <p className="font-lora text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-0.5">
          {steps.map((s, index) => {
            const rowStatus = progress[index]?.completed_at ? 'done' : index === currentIndex ? 'current' : 'upcoming'

            if (rowStatus === 'done') {
              return (
                <div key={index} className="group flex items-center gap-2 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#f0e4db] text-[#b07d62] flex items-center justify-center text-[10px] flex-shrink-0">
                    ✓
                  </span>
                  <span className="font-lora text-xs text-[#9a7060] line-through decoration-[#c8a99a] truncate flex-1 min-w-0">
                    {s.action}
                  </span>
                  <button
                    onClick={() => postProgress(index, 'reopen')}
                    disabled={busyIndex === index}
                    className="font-lora text-[10px] text-[#b07d62] hover:underline flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    Undo
                  </button>
                </div>
              )
            }

            if (rowStatus === 'current') {
              return (
                <div key={index} className="flex items-center gap-2 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white flex items-center justify-center text-[10px] flex-shrink-0">
                    {BAKE_PHASE_ICONS[normalizeBakePhase(s.phase)]}
                  </span>
                  <span className="font-lora text-xs font-semibold text-[#3d2b1f] truncate">{s.action}</span>
                </div>
              )
            }

            return (
              <div key={index} className="flex items-center gap-2 py-1.5 opacity-40">
                <span className="w-5 h-5 rounded-full border border-[#e8d5c8] text-[#c8a99a] flex items-center justify-center text-[9px] flex-shrink-0">
                  {index + 1}
                </span>
                <span className="font-lora text-xs text-[#9a7060] truncate">{s.action}</span>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main: the current step only */}
      <main className="order-1 lg:order-2 flex-1 min-w-0 bg-white rounded-2xl shadow-md border border-[#f0e4db] flex flex-col lg:overflow-hidden">
        {/* "Image" placeholder — no photo data exists on a step today, so a large phase icon
            stands in as the hero visual. */}
        <div className="flex-shrink-0 bg-gradient-to-br from-[#f9ede5] to-[#f0e4db] px-6 pt-6 pb-4 text-center rounded-t-2xl">
          <div className="text-6xl mb-2">{BAKE_PHASE_ICONS[phase]}</div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="font-lora text-xs uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/70 text-[#b07d62]">
              {BAKE_PHASE_LABELS[phase]}
            </span>
            {step.duration && (
              <span className="font-lora text-xs text-[#7a4f3a] bg-white/70 px-2.5 py-1 rounded-full">
                {step.duration}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable only if the title/instructions genuinely don't fit — the hero above and
            the timer/action footer below stay put either way. */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-1">{step.action}</h2>
          {step.time && (
            <p className="font-lora text-xs text-[#9a7060] mb-3">Originally planned for {step.time}</p>
          )}
          {step.note && (
            <p className="font-lora italic text-[#7a4f3a]">&quot;{step.note}&quot;</p>
          )}
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-[#f0e4db]">
          {currentDurationSeconds !== null && (
            <div className="mb-3">
              {!started ? (
                <button
                  onClick={() => postProgress(currentIndex, 'start')}
                  disabled={busyIndex === currentIndex}
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
                    onClick={() => postProgress(currentIndex, 'reopen')}
                    disabled={busyIndex === currentIndex}
                    className="font-lora text-xs text-[#9a7060] hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => postProgress(currentIndex, 'complete')}
            disabled={busyIndex === currentIndex}
            className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {busyIndex === currentIndex ? "Savin'..." : 'Mark Done →'}
          </button>
        </div>
      </main>
    </div>
  )
}
