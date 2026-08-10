'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const dayKeys = [1, 2, 3] as const
const dayRise: Record<number, number> = { 1: 10, 2: 25, 3: 55 }
const dayEmoji: Record<number, string> = { 1: '🌱', 2: '✨', 3: '🎉' }
const scheduleKeys = ['feed', 'mix', 'add', 'shape', 'preheat'] as const

export default function StarterJournal() {
  const t = useTranslations('Marketing.starterJournal')
  const [activeDay, setActiveDay] = useState(3)

  return (
    <section className="py-24 px-6 bg-[#fdf6f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">{t('title')}</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
          <p className="font-lora italic text-[#6b4c3b] max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Starter card */}
          <div className="flex-1 bg-white rounded-2xl p-7 shadow-md hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-playfair text-2xl font-bold text-[#3d2b1f]">{t('starterName')}</div>
                <div className="font-lora text-sm text-[#9a7060]">{t('bornOn', { day: activeDay })}</div>
              </div>
              <span className="text-4xl">🫙</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {dayKeys.map(day => (
                <button key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-1.5 rounded-full font-lora text-sm border transition-all ${
                    activeDay === day
                      ? 'bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white border-transparent'
                      : 'border-[#e8d5c8] text-[#7a4f3a] bg-white'
                  }`}>
                  {t('feeding', { day })}
                </button>
              ))}
              <div className="relative group">
                <button
                  disabled
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-lora text-sm border border-[#e8d5c8] text-[#c4a899] bg-white cursor-not-allowed opacity-60">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('logFeeding')}
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-[#3d2b1f] text-white font-lora text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {t('signInTooltip')}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#3d2b1f]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{dayEmoji[activeDay]}</span>
              <span className="font-lora italic text-[#6b4c3b]">{t(`dayStatus.${activeDay}`)}</span>
            </div>

            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">{t('riseActivity')}</div>
            <div className="h-2.5 bg-[#f0e4db] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#c9956c] to-[#e8a87c] transition-all duration-500"
                style={{ width: `${dayRise[activeDay]}%` }} />
            </div>
            <div className="text-right font-lora text-xs text-[#b07d62] mt-1">{dayRise[activeDay]}%</div>

            <div className="mt-5 bg-[#f9ede5] rounded-xl p-4 font-lora italic text-sm text-[#7a4f3a]">
              💬 {t('starterQuote')}
            </div>
          </div>

          {/* Bake scheduler */}
          <div className="flex-1 bg-white rounded-2xl p-7 shadow-md hover:-translate-y-1 transition-transform">
            <div className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-1">{t('schedulerTitle')}</div>
            <p className="font-lora italic text-[#9a7060] text-sm mb-6">
              {t('schedulerQuote')}
            </p>

            <div className="mb-5">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('readyOn')}</div>
              <div className="bg-[#f9ede5] border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f]">
                {t('readyOnValue')}
              </div>
            </div>

            <div className="space-y-3">
              {scheduleKeys.map(key => (
                <div key={key} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #c9956c, #b5838d)' }} />
                  <div>
                    <div className="font-lora text-xs text-[#b07d62] tracking-wide">{t(`schedule.${key}.time`)}</div>
                    <div className="font-lora text-sm text-[#3d2b1f]">{t(`schedule.${key}.action`)}</div>
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
