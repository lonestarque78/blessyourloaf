'use client'

import { useState } from 'react'
import { calculateFlourWaterFromTarget, calculateHydrationPercent } from '@/lib/baker-math'
import { useTranslations } from 'next-intl'

type Mode = 'from-amounts' | 'from-target'

function toNumber(value: string): number | null {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function HydrationCalculatorTool() {
  const t = useTranslations('Tools.hydration')
  const [mode, setMode] = useState<Mode>('from-amounts')

  // Mode: I know my flour + water, tell me the hydration %
  const [flourInput, setFlourInput] = useState('500')
  const [waterInput, setWaterInput] = useState('375')

  // Mode: I know my target hydration % + total dough weight, tell me flour/water
  const [targetHydration, setTargetHydration] = useState('75')
  const [totalWeight, setTotalWeight] = useState('900')

  const flour = toNumber(flourInput)
  const water = toNumber(waterInput)
  const hydrationResult = flour !== null && water !== null ? calculateHydrationPercent(flour, water) : null

  const hydration = toNumber(targetHydration)
  const total = toNumber(totalWeight)
  const targetResult = hydration !== null && total !== null ? calculateFlourWaterFromTarget(total, hydration) : null
  const flourResult = targetResult?.flour ?? null
  const waterResult = targetResult?.water ?? null

  return (
    <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
      <div className="flex gap-2 mb-8 bg-[#f9ede5] rounded-full p-1 max-w-md mx-auto">
        <button
          onClick={() => setMode('from-amounts')}
          className={`flex-1 font-lora text-sm px-4 py-2 rounded-full transition-colors ${
            mode === 'from-amounts' ? 'bg-white text-[#b07d62] shadow-sm' : 'text-[#9a7060]'
          }`}
        >
          {t('tabAmounts')}
        </button>
        <button
          onClick={() => setMode('from-target')}
          className={`flex-1 font-lora text-sm px-4 py-2 rounded-full transition-colors ${
            mode === 'from-target' ? 'bg-white text-[#b07d62] shadow-sm' : 'text-[#9a7060]'
          }`}
        >
          {t('tabTarget')}
        </button>
      </div>

      {mode === 'from-amounts' ? (
        <div>
          <p className="font-lora italic text-sm text-[#9a7060] text-center mb-6">
            {t('amountsQuote')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-md mx-auto mb-8">
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('flourLabel')}</label>
              <input
                type="number" inputMode="decimal" min="0" value={flourInput}
                onChange={e => setFlourInput(e.target.value)}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('waterLabel')}</label>
              <input
                type="number" inputMode="decimal" min="0" value={waterInput}
                onChange={e => setWaterInput(e.target.value)}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>
          </div>

          <div className="text-center bg-[#f9ede5] rounded-2xl py-8">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('hydrationResultLabel')}</div>
            <div className="font-playfair text-5xl font-bold text-[#3d2b1f]">
              {hydrationResult !== null ? `${hydrationResult.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-lora italic text-sm text-[#9a7060] text-center mb-6">
            {t('targetQuote')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-md mx-auto mb-8">
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('targetHydrationLabel')}</label>
              <input
                type="number" inputMode="decimal" min="0" value={targetHydration}
                onChange={e => setTargetHydration(e.target.value)}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('totalWeightLabel')}</label>
              <input
                type="number" inputMode="decimal" min="0" value={totalWeight}
                onChange={e => setTotalWeight(e.target.value)}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-center bg-[#f9ede5] rounded-2xl py-8">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('flourResultLabel')}</div>
              <div className="font-playfair text-3xl font-bold text-[#3d2b1f]">
                {flourResult !== null ? `${Math.round(flourResult)}g` : '—'}
              </div>
            </div>
            <div className="text-center bg-[#f9ede5] rounded-2xl py-8">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('waterResultLabel')}</div>
              <div className="font-playfair text-3xl font-bold text-[#3d2b1f]">
                {waterResult !== null ? `${Math.round(waterResult)}g` : '—'}
              </div>
            </div>
          </div>
          <p className="font-lora text-xs italic text-[#9a7060] text-center mt-4">
            {t('targetFootnote')}
          </p>
        </div>
      )}
    </div>
  )
}
