'use client'

import { useState } from 'react'
import { BASELINE_FERMENTATION_TEMP_F as BASELINE_TEMP_F, calculateAdjustedFermentationHours as adjustedHours, formatHoursMinutes as formatHours } from '@/lib/baker-math'

const REFERENCE_TEMPS = [65, 68, 70, 72, 75, 78, 80, 82, 85, 90]

function toNumber(value: string): number | null {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function TemperaturePredictorTool() {
  const [baselineInput, setBaselineInput] = useState('4')
  const [tempInput, setTempInput] = useState('72')

  const baseline = toNumber(baselineInput)
  const temp = toNumber(tempInput)
  const result = baseline !== null && temp !== null ? adjustedHours(baseline, temp) : null
  const isFaster = result !== null && baseline !== null && result < baseline

  return (
    <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
      <p className="font-lora italic text-sm text-[#9a7060] text-center mb-6">
        &quot;Give me your recipe&apos;s timing and your kitchen&apos;s temperature, and I&apos;ll tell you what to really expect, sugar.&quot;
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-md mx-auto mb-8">
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
            Recipe time at {BASELINE_TEMP_F}°F (hours)
          </label>
          <input
            type="number" inputMode="decimal" min="0" step="0.5" value={baselineInput}
            onChange={e => setBaselineInput(e.target.value)}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
          />
        </div>
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
            Your kitchen&apos;s temperature (°F)
          </label>
          <input
            type="number" inputMode="decimal" value={tempInput}
            onChange={e => setTempInput(e.target.value)}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
          />
        </div>
      </div>

      <div className="text-center bg-[#f9ede5] rounded-2xl py-8 mb-4">
        <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Expect it to take about</div>
        <div className="font-playfair text-5xl font-bold text-[#3d2b1f]">
          {result !== null ? formatHours(result) : '—'}
        </div>
      </div>

      {result !== null && temp !== null && temp !== BASELINE_TEMP_F && (
        <p className="font-lora italic text-sm text-[#7a4f3a] text-center mb-8">
          {isFaster
            ? `Your kitchen's warmer than ${BASELINE_TEMP_F}°F, so she'll move faster than the recipe says — keep an eye on her, don't just watch the clock.`
            : `Your kitchen's cooler than ${BASELINE_TEMP_F}°F, so give her extra time — she's just takin' it slow, not doin' somethin' wrong.`}
        </p>
      )}

      {/* Quick reference table */}
      <div className="border-t border-[#f0e4db] pt-6">
        <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3 text-center">
          Quick reference — every 10°F roughly doubles or halves fermentation speed
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                {REFERENCE_TEMPS.map(t => (
                  <th key={t} className={`font-lora text-xs px-2 py-2 ${t === BASELINE_TEMP_F ? 'text-[#b07d62] font-bold' : 'text-[#9a7060]'}`}>
                    {t}°F
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {REFERENCE_TEMPS.map(t => (
                  <td key={t} className={`font-lora text-sm px-2 py-2 rounded-lg ${t === BASELINE_TEMP_F ? 'bg-[#f9ede5] font-bold text-[#3d2b1f]' : 'text-[#6b4c3b]'}`}>
                    {baseline !== null ? formatHours(adjustedHours(baseline, t)) : '—'}
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
