'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Starter {
  id: string
  name: string
  nickname: string | null
  flour_type: string
  hydration_percent: number
  is_active: boolean
}

interface Feeding {
  id: string
  starter_id: string
  fed_at: string
  rise_percent: number | null
}

interface Ingredient {
  item: string
  amount: string
  note: string
}

interface Step {
  time: string
  action: string
  duration: string
  note: string
}

function parseDurationSeconds(duration: string): number | null {
  const lower = duration.toLowerCase()
  let total = 0
  let found = false

  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*h(?:our)?s?/)
  const minMatch = lower.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/)

  if (hourMatch) { total += parseFloat(hourMatch[1]) * 3600; found = true }
  if (minMatch)  { total += parseFloat(minMatch[1])  * 60;   found = true }

  return found && total > 0 ? Math.round(total) : null
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function SchedulerPage() {
  const [loading, setLoading] = useState(true)
  const [starters, setStarters] = useState<Starter[]>([])
  const [latestFeedings, setLatestFeedings] = useState<Record<string, Feeding | null>>({})

  const [recipe, setRecipe] = useState('')
  const [selectedStarterId, setSelectedStarterId] = useState<string | null>(null)
  const [adjustedRise, setAdjustedRise] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [targetTime, setTargetTime] = useState('08:00')

  const [generating, setGenerating] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null)
  const [schedule, setSchedule] = useState<Step[] | null>(null)
  const [error, setError] = useState('')

  // Save schedule state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Timer state
  const [activeTimerIndex, setActiveTimerIndex] = useState<number | null>(null)
  const [timerSeconds, setTimerSeconds] = useState<Record<number, number>>({})
  const [timerFinished, setTimerFinished] = useState<Set<number>>(new Set())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        const { data: startersData, error: startersError } = await supabase
          .from('starters')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (startersError || !startersData || startersData.length === 0) return

        setStarters(startersData)

        const ids = startersData.map((s: Starter) => s.id)
        const { data: feedingsData } = await supabase
          .from('feedings')
          .select('id, starter_id, fed_at, rise_percent')
          .in('starter_id', ids)
          .order('fed_at', { ascending: false })

        const feedingMap: Record<string, Feeding | null> = {}
        for (const id of ids) {
          feedingMap[id] = feedingsData?.find((f: Feeding) => f.starter_id === id) ?? null
        }
        setLatestFeedings(feedingMap)

        const first = startersData.find((s: Starter) => s.is_active) ?? startersData[0]
        setSelectedStarterId(first.id)
        setAdjustedRise(feedingMap[first.id]?.rise_percent?.toString() ?? '')
      } catch {
        // silently fail — empty state will render
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Tick the active timer
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (activeTimerIndex === null) return

    intervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        const current = prev[activeTimerIndex] ?? 0
        if (current <= 1) {
          clearInterval(intervalRef.current!)
          setActiveTimerIndex(null)
          setTimerFinished(f => new Set(f).add(activeTimerIndex))
          return { ...prev, [activeTimerIndex]: 0 }
        }
        return { ...prev, [activeTimerIndex]: current - 1 }
      })
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeTimerIndex])

  const selectedStarter = starters.find(s => s.id === selectedStarterId) ?? null
  const selectedFeeding = selectedStarterId ? (latestFeedings[selectedStarterId] ?? null) : null

  function handleStarterSelect(id: string) {
    setSelectedStarterId(id)
    setAdjustedRise(latestFeedings[id]?.rise_percent?.toString() ?? '')
    setSchedule(null)
  }

  function handleStartTimer(index: number, step: Step) {
    const totalSecs = parseDurationSeconds(step.duration)
    if (totalSecs === null) return

    // Pause existing if different
    if (activeTimerIndex !== null && activeTimerIndex !== index) {
      // just clear interval — timerSeconds[activeTimerIndex] retains paused value
      if (intervalRef.current) clearInterval(intervalRef.current)
      setActiveTimerIndex(null)
    }

    // If this timer hasn't been started yet, seed it
    setTimerSeconds(prev => ({
      ...prev,
      [index]: prev[index] !== undefined ? prev[index] : totalSecs,
    }))
    setTimerFinished(f => { const s = new Set(f); s.delete(index); return s })
    setActiveTimerIndex(index)
  }

  function handlePauseTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setActiveTimerIndex(null)
  }

  async function handleSubmit() {
    if (!recipe.trim() || !selectedStarter || !targetDate) return
    setGenerating(true)
    setError('')
    setIngredients(null)
    setSchedule(null)
    setSaved(false)
    setSaveError('')
    setActiveTimerIndex(null)
    setTimerSeconds({})
    setTimerFinished(new Set())
    if (intervalRef.current) clearInterval(intervalRef.current)

    try {
      const res = await fetch('/api/bake-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: recipe.trim(),
          targetDate,
          targetTime,
          starterName: selectedStarter.name,
          starterActivity: parseInt(adjustedRise) || 75,
          starterLastFed: selectedFeeding?.fed_at ?? 'unknown',
          starterFlour: selectedStarter.flour_type,
          starterHydration: selectedStarter.hydration_percent,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong in the kitchen, sugar.")
      } else {
        setIngredients(data.ingredients ?? null)
        setSchedule(data.steps)
      }
    } catch {
      setError("Couldn't reach the kitchen — please try again, darlin'.")
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!schedule || saved || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/bake-schedule/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe, targetDate, targetTime, steps: schedule }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? "Couldn't save, sugar — try again.")
      } else {
        setSaved(true)
      }
    } catch {
      setSaveError("Couldn't reach the kitchen — please try again, darlin'.")
    } finally {
      setSaving(false)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/dashboard" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to Dashboard
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-2">Bake Scheduler</h1>
        <p className="font-lora italic text-[#9a7060]">
          "Tell me what you're bakin' and I'll tell you exactly when to get started, darlin'."
        </p>
      </div>

      {!loading && starters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-md border border-[#f0e4db] text-center">
          <div className="text-6xl mb-6">🫙</div>
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-3">
            You'll need a starter first, sugar
          </h2>
          <p className="font-lora italic text-[#9a7060] mb-8 max-w-sm mx-auto">
            "Miss Loretta can't schedule a bake without knowin' about your starter. Go on and introduce us."
          </p>
          <Link href="/dashboard/starters/new"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora hover:-translate-y-0.5 transition-transform shadow-md">
            Create My First Starter
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-6">
            <div className="space-y-8">

              {/* What to bake */}
              <div>
                <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-3">
                  What are you bakin'?
                </label>
                <input
                  type="text"
                  value={recipe}
                  onChange={e => { setRecipe(e.target.value); setSchedule(null) }}
                  placeholder="e.g. classic sourdough boule, focaccia with rosemary, rye bagels..."
                  className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6] placeholder:text-[#c8a99a]"
                />
              </div>

              {/* Starter selection */}
              <div>
                <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-3">
                  Which starter are you using?
                </label>
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-[74px] bg-[#f0e4db] rounded-xl animate-pulse" />
                    <div className="h-[74px] bg-[#f0e4db] rounded-xl animate-pulse opacity-60" />
                  </div>
                ) : (
                <div className="space-y-3">
                  {starters.map(starter => {
                    const feeding = latestFeedings[starter.id]
                    const isSelected = selectedStarterId === starter.id
                    return (
                      <button
                        key={starter.id}
                        onClick={() => handleStarterSelect(starter.id)}
                        className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[#c9956c] bg-[#f9ede5]'
                            : 'border-[#e8d5c8] hover:border-[#c9956c] hover:bg-[#fdf6f0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-playfair font-bold text-[#3d2b1f] flex items-center gap-2 flex-wrap">
                              🫙 {starter.name}
                              {starter.nickname && (
                                <span className="font-lora font-normal italic text-sm text-[#9a7060]">
                                  "{starter.nickname}"
                                </span>
                              )}
                            </div>
                            <div className="font-lora text-xs text-[#9a7060] mt-1 capitalize">
                              {starter.flour_type} · {starter.hydration_percent}% hydration
                            </div>
                            {feeding ? (
                              <div className="font-lora text-xs text-[#b07d62] mt-1">
                                Last fed{' '}
                                {new Date(feeding.fed_at).toLocaleDateString('en-US', {
                                  weekday: 'long', month: 'long', day: 'numeric',
                                  hour: 'numeric', minute: '2-digit',
                                })}
                                {feeding.rise_percent != null ? ` · ${feeding.rise_percent}% rise` : ''}
                              </div>
                            ) : (
                              <div className="font-lora text-xs text-[#9a7060] italic mt-1">
                                No feedings logged yet
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#c9956c] flex items-center justify-center flex-shrink-0 ml-3">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                )}
              </div>

              {/* Rise % confirmation */}
              {selectedStarter && (
                <div>
                  <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
                    Current rise activity (%)
                  </label>
                  <p className="font-lora text-xs italic text-[#9a7060] mb-3">
                    {selectedFeeding?.rise_percent != null
                      ? `"Last logged at ${selectedFeeding.rise_percent}% — still accurate, sugar? Adjust if needed."`
                      : `"No rise logged yet — give me your best guess, darlin'. 75% is a good middle of the road."`}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <input
                      type="number"
                      value={adjustedRise}
                      onChange={e => setAdjustedRise(e.target.value)}
                      placeholder="75"
                      min="0"
                      max="300"
                      className="w-28 border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {[25, 50, 75, 100, 150].map(pct => (
                        <button
                          key={pct}
                          onClick={() => setAdjustedRise(pct.toString())}
                          className={`font-lora text-xs px-3 py-1.5 rounded-full border transition-all ${
                            adjustedRise === pct.toString()
                              ? 'border-[#c9956c] bg-[#f9ede5] text-[#b07d62]'
                              : 'border-[#e8d5c8] text-[#9a7060] hover:border-[#c9956c] hover:text-[#b07d62]'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Date & time */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
                    Date I want it ready
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    min={minDateStr}
                    onChange={e => { setTargetDate(e.target.value); setSchedule(null) }}
                    className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
                  />
                </div>
                <div>
                  <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
                    Time I want it ready
                  </label>
                  <input
                    type="time"
                    value={targetTime}
                    onChange={e => { setTargetTime(e.target.value); setSchedule(null) }}
                    className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!recipe.trim() || !targetDate || !selectedStarterId || generating}
                className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-4 rounded-xl font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                Build My Bake Schedule →
              </button>
            </div>
          </div>

          {/* Loading */}
          {generating && (
            <div className="bg-white rounded-2xl p-10 shadow-md border border-[#f0e4db] text-center mb-6">
              <div className="text-5xl mb-4 animate-bounce">🍞</div>
              <p className="font-playfair text-xl text-[#3d2b1f] mb-2">
                She's workin' on your schedule, sugar...
              </p>
              <p className="font-lora italic text-sm text-[#9a7060]">
                Miss Loretta Mae is calculatin' every step, right down to the minute.
              </p>
            </div>
          )}

          {/* Error */}
          {error && !generating && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 mb-6">
              <p className="font-lora text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Timeline */}
          {schedule && schedule.length > 0 && !generating && (
            <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f]">Your Bake Timeline</h2>
                  <p className="font-lora italic text-sm text-[#9a7060] mt-1">
                    {recipe}
                    {targetDate && (
                      <> · Ready {new Date(`${targetDate}T${targetTime}`).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                      })} at {new Date(`${targetDate}T${targetTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit',
                      })}</>
                    )}
                  </p>
                </div>
                <span className="text-3xl">🍞</span>
              </div>

              {/* Save this Bake */}
              <div className="mb-6 flex items-center gap-4 flex-wrap">
                <button
                  onClick={handleSave}
                  disabled={saved || saving}
                  className="font-lora text-sm px-5 py-2.5 rounded-full border transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60
                    bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white border-transparent hover:-translate-y-0.5 hover:shadow-md
                    disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                >
                  {saving ? "Savin'..." : saved ? 'Saved ✓' : 'Save this Bake'}
                </button>
                {saved && (
                  <p className="font-lora italic text-sm text-[#b07d62]">
                    She's saved, sugar!
                  </p>
                )}
                {saveError && (
                  <p className="font-lora text-sm text-red-600">{saveError}</p>
                )}
              </div>

              {/* Ingredients */}
              {ingredients && ingredients.length > 0 && (
                <div className="mb-8 bg-[#fdf9f6] rounded-xl border border-[#e8d5c8] p-6">
                  <h3 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-4">What You'll Need, Sugar</h3>
                  <ul className="space-y-2.5">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="flex items-baseline gap-3">
                        <span className="font-lora text-sm font-semibold text-[#b07d62] w-28 flex-shrink-0">{ing.amount}</span>
                        <span className="font-lora text-sm text-[#3d2b1f]">{ing.item}</span>
                        {ing.note && (
                          <span className="font-lora text-xs italic text-[#9a7060]">({ing.note})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#c9956c] to-[#b5838d]" />
                <div className="space-y-6">
                  {schedule.map((step, index) => {
                    const stepDurationSecs = parseDurationSeconds(step.duration)
                    const isRunning = activeTimerIndex === index
                    const isFinished = timerFinished.has(index)
                    const secsLeft = timerSeconds[index]
                    const isPaused = !isRunning && !isFinished && secsLeft !== undefined

                    return (
                      <div key={index} className="flex gap-6 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          index === schedule.length - 1
                            ? 'bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white'
                            : 'bg-white border-2 border-[#c9956c] text-[#c9956c] text-xs font-bold'
                        }`}>
                          {index === schedule.length - 1 ? '🍞' : index + 1}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="font-lora text-xs text-[#b07d62] tracking-wide mb-1">{step.time}</div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <div className="font-playfair font-bold text-[#3d2b1f]">{step.action}</div>
                            <span className="font-lora text-xs text-[#9a7060] bg-[#f9ede5] px-2 py-0.5 rounded-full">
                              {step.duration}
                            </span>
                            {stepDurationSecs !== null && !isFinished && (
                              <button
                                onClick={() => isRunning ? handlePauseTimer() : handleStartTimer(index, step)}
                                className="font-lora text-xs px-2.5 py-0.5 rounded-full border border-[#c9956c] text-[#b07d62] hover:bg-[#f9ede5] transition-colors"
                              >
                                {isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start Timer'}
                              </button>
                            )}
                          </div>
                          {/* Timer display */}
                          {isFinished ? (
                            <p className="font-lora text-sm font-semibold mb-1" style={{ color: '#b5838d' }}>
                              Time's up, darlin'! 🍞
                            </p>
                          ) : (isRunning || isPaused) && secsLeft !== undefined ? (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-lg font-bold text-[#c9956c]">
                                {formatCountdown(secsLeft)}
                              </span>
                              {isPaused && (
                                <span className="font-lora text-xs text-[#9a7060] italic">paused</span>
                              )}
                            </div>
                          ) : null}
                          <p className="font-lora italic text-sm text-[#7a4f3a]">"{step.note}"</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-8 bg-[#f9ede5] rounded-xl p-5 text-center">
                <p className="font-lora italic text-sm text-[#7a4f3a]">
                  "Save this schedule somewhere you can see it, sugar. Your bread is counting on you."
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <button
                  onClick={handleSave}
                  disabled={saved || saving}
                  className="font-lora text-sm px-5 py-2.5 rounded-full border transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60
                    bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white border-transparent hover:-translate-y-0.5 hover:shadow-md
                    disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                >
                  {saving ? "Savin'..." : saved ? 'Saved ✓' : 'Save this Bake'}
                </button>
                {saved && (
                  <p className="font-lora italic text-sm text-[#b07d62]">
                    She's saved, sugar!
                  </p>
                )}
                {saveError && (
                  <p className="font-lora text-sm text-red-600">{saveError}</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
