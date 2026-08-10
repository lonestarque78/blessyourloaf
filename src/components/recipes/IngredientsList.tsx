'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { calculateBakersPercentages, type BakersPercentageIngredient } from '@/lib/baker-math'

interface Props {
  ingredients: BakersPercentageIngredient[]
}

export default function IngredientsList({ ingredients }: Props) {
  const t = useTranslations('Common.bakersPercentage')
  const [advanced, setAdvanced] = useState(false)

  const result = calculateBakersPercentages(ingredients)

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex gap-1 bg-[#f9ede5] rounded-full p-1">
          <button
            type="button"
            onClick={() => setAdvanced(false)}
            className={`font-lora text-xs px-3 py-1.5 rounded-full transition-colors ${
              !advanced ? 'bg-white text-[#b07d62] shadow-sm' : 'text-[#9a7060]'
            }`}
          >
            {t('simpleTab')}
          </button>
          <button
            type="button"
            onClick={() => setAdvanced(true)}
            className={`font-lora text-xs px-3 py-1.5 rounded-full transition-colors ${
              advanced ? 'bg-white text-[#b07d62] shadow-sm' : 'text-[#9a7060]'
            }`}
          >
            {t('advancedTab')}
          </button>
        </div>
      </div>

      {advanced && result.totalFlourGrams !== null && (
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="bg-[#f9ede5] rounded-xl px-4 py-2.5">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('totalFlourLabel')}</div>
            <div className="font-playfair font-bold text-[#3d2b1f]">{Math.round(result.totalFlourGrams)}g</div>
          </div>
          <div className="bg-[#f9ede5] rounded-xl px-4 py-2.5">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('trueHydrationLabel')}</div>
            <div className="font-playfair font-bold text-[#3d2b1f]">{result.trueHydrationPercent!.toFixed(1)}%</div>
          </div>
          <p className="font-lora text-xs italic text-[#9a7060] self-center">{t('trueHydrationFootnote')}</p>
        </div>
      )}

      {advanced && result.totalFlourGrams === null && (
        <p className="font-lora text-xs italic text-[#9a7060] mb-5">{t('notEnoughDataNote')}</p>
      )}

      <div className="space-y-3">
        {result.rows.map((ing, i) => (
          <div key={i} className="flex items-start gap-4 py-2 border-b border-[#f9ede5] last:border-0">
            <div className="w-2 h-2 rounded-full bg-[#c9956c] mt-2 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-lora text-[#3d2b1f]">{ing.item}</span>
                <span className="flex items-baseline gap-2 flex-shrink-0">
                  <span className="font-lora text-sm text-[#b07d62]">{ing.amount}</span>
                  {advanced && ing.percentOfFlour !== null && (
                    <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2 py-0.5 rounded-full">
                      {ing.percentOfFlour.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
              {ing.note && (
                <span className="font-lora text-xs italic text-[#9a7060] block mt-0.5">{ing.note}</span>
              )}
              {advanced && ing.starterBreakdown && (
                <span className="font-lora text-xs italic text-[#9a7060] block mt-0.5">
                  {t(ing.starterBreakdown.hydrationStated ? 'starterBreakdownStated' : 'starterBreakdownAssumed', {
                    flour: Math.round(ing.starterBreakdown.flourGrams),
                    water: Math.round(ing.starterBreakdown.waterGrams),
                    hydration: ing.starterBreakdown.hydrationPercent,
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
