'use client'

import { useState } from 'react'

const days = [
  { day: 1, status: "Just born, bless her heart", rise: 10, emoji: "🌱" },
  { day: 2, status: "Gettin' a little bubbly, sugar", rise: 25, emoji: "✨" },
  { day: 3, status: "She's alive, honey!", rise: 55, emoji: "🎉" },
  { day: 4, status: "Doubled up overnight!", rise: 80, emoji: "🔥" },
  { day: 5, status: "Ready to bake, darlin'", rise: 100, emoji: "🍞" },
]

const schedule = [
  { time: "Thursday 7pm", action: "Feed your starter, darlin'" },
  { time: "Friday 8am", action: "Mix your dough & autolyse" },
  { time: "Friday 10am", action: "Add starter + salt, stretch & fold" },
  { time: "Friday 4pm", action: "Shape & into the fridge she goes" },
  { time: "Saturday 7:30am", action: "Preheat your Dutch oven, honey" },
]

export default function StarterJournal() {
  const [activeDay, setActiveDay] = useState(3)
  const current = days.find(d => d.day === activeDay)!

  return (
    <section className="py-24 px-6 bg-[#fdf6f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ The Starter Journal ✦</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">Name her. Feed her. Love her.</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
          <p className="font-lora italic text-[#6b4c3b] max-w-md mx-auto">
            Every starter needs a name and a mama who pays attention. Track her feedings and watch her grow day by day.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Starter card */}
          <div className="flex-1 bg-white rounded-2xl p-7 shadow-md hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-playfair text-2xl font-bold text-[#3d2b1f]">Sweet Magnolia</div>
                <div className="font-lora text-sm text-[#9a7060]">Born May 27th · Day {activeDay}</div>
              </div>
              <span className="text-4xl">🫙</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {days.map(d => (
                <button key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={`px-4 py-1.5 rounded-full font-lora text-sm border transition-all ${
                    activeDay === d.day
                      ? 'bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white border-transparent'
                      : 'border-[#e8d5c8] text-[#7a4f3a] bg-white'
                  }`}>
                  Day {d.day}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{current.emoji}</span>
              <span className="font-lora italic text-[#6b4c3b]">{current.status}</span>
            </div>

            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">Rise Activity</div>
            <div className="h-2.5 bg-[#f0e4db] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#c9956c] to-[#e8a87c] transition-all duration-500"
                style={{ width: `${current.rise}%` }} />
            </div>
            <div className="text-right font-lora text-xs text-[#b07d62] mt-1">{current.rise}%</div>

            <div className="mt-5 bg-[#f9ede5] rounded-xl p-4 font-lora italic text-sm text-[#7a4f3a]">
              💬 "Feed her equal parts flour and water, sugar. She's hungry!"
            </div>
          </div>

          {/* Bake scheduler */}
          <div className="flex-1 bg-white rounded-2xl p-7 shadow-md hover:-translate-y-1 transition-transform">
            <div className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-1">Bake Scheduler</div>
            <p className="font-lora italic text-[#9a7060] text-sm mb-6">
              "Tell me when you want fresh bread, and I'll tell you when to get started, hon."
            </p>

            <div className="mb-5">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">I want my loaf ready on...</div>
              <div className="bg-[#f9ede5] border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f]">
                Saturday morning · 8:00 AM
              </div>
            </div>

            <div className="space-y-3">
              {schedule.map(({ time, action }) => (
                <div key={time} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #c9956c, #b5838d)' }} />
                  <div>
                    <div className="font-lora text-xs text-[#b07d62] tracking-wide">{time}</div>
                    <div className="font-lora text-sm text-[#3d2b1f]">{action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}