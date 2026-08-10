'use client'

import { useState } from 'react'
import { BASELINE_FERMENTATION_TEMP_F as BASELINE_TEMP_F, calculateAdjustedFermentationHours as adjustedHours, formatHoursMinutes as formatHours } from '@/lib/baker-math'
import { useTranslations } from 'next-intl'

const REFERENCE_TEMPS = [65, 68, 70, 72, 75, 78, 80, 82, 85, 90]

function toNumber(value: string): number | null {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function TemperaturePredictorTool() {
  const t = useTranslations('Tools.temperature')
  const [baselineInput, setBaselineInput] = useState('4')
  const [tempInput, setTempInput] = useState('72')

  const baseline = toNumber(baselineInput)
  const temp = toNumber(tempInput)
  const result = baseline !== null && temp !== null ? adjustedHours(baseline, temp) : null
  const isFaster = result !== null && baseline !== null && result < baseline

  return (
    <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
      <p className="font-lora italic text-sm text-[#9a7060] text-center mb-6">
        {t('toolQuote')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-md mx-auto mb-8">
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
            {t('recipeTimeLabel', { temp: BASELINE_TEMP_F })}
          </label>
          <input
            type="number" inputMode="decimal" min="0" step="0.5" value={baselineInput}
            onChange={e => setBaselineInput(e.target.value)}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
          />
        </div>
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
            {t('kitchenTempLabel')}
          </label>
          <input
            type="number" inputMode="decimal" value={tempInput}
            onChange={e => setTempInput(e.target.value)}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
          />
        </div>
      </div>

      <div className="text-center bg-[#f9ede5] rounded-2xl py-8 mb-4">
        <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('expectLabel')}</div>
        <div className="font-playfair text-5xl font-bold text-[#3d2b1f]">
          {result !== null ? formatHours(result) : '—'}
        </div>
      </div>

      {result !== null && temp !== null && temp !== BASELINE_TEMP_F && (
        <p className="font-lora italic text-sm text-[#7a4f3a] text-center mb-8">
          {isFaster
            ? t('warmerNote', { temp: BASELINE_TEMP_F })
            : t('coolerNote', { temp: BASELINE_TEMP_F })}
        </p>
      )}

      {/* Quick reference table */}
      <div className="border-t border-[#f0e4db] pt-6">
        <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3 text-center">
          {t('referenceTableLabel')}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                {REFERENCE_TEMPS.map(temp => (
                  <th key={temp} className={`font-lora text-xs px-2 py-2 ${temp === BASELINE_TEMP_F ? 'text-[#b07d62] font-bold' : 'text-[#9a7060]'}`}>
                    {temp}°F
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {REFERENCE_TEMPS.map(temp => (
                  <td key={temp} className={`font-lora text-sm px-2 py-2 rounded-lg ${temp === BASELINE_TEMP_F ? 'bg-[#f9ede5] font-bold text-[#3d2b1f]' : 'text-[#6b4c3b]'}`}>
                    {baseline !== null ? formatHours(adjustedHours(baseline, temp)) : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
