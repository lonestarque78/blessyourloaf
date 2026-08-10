import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'

const flourKeys = ['allPurpose', 'bread', 'wholeWheat', 'rye', 'spelt', 'einkorn', 'glutenFree'] as const

const difficultyByFlour: Record<typeof flourKeys[number], 'Beginner' | 'Intermediate' | 'Advanced'> = {
  allPurpose: 'Beginner',
  bread: 'Beginner',
  wholeWheat: 'Intermediate',
  rye: 'Intermediate',
  spelt: 'Intermediate',
  einkorn: 'Advanced',
  glutenFree: 'Advanced',
}

// Protein/hydration ranges aren't translated content — numeric/unit data, not prose.
const PROTEIN_BY_FLOUR: Record<typeof flourKeys[number], string> = {
  allPurpose: '10–12%',
  bread: '12–14%',
  wholeWheat: '13–14%',
  rye: '8–9%',
  spelt: '12–15%',
  einkorn: '18%',
  glutenFree: 'Varies',
}

const hydrationByFlour: Record<typeof flourKeys[number], string> = {
  allPurpose: '65–75%',
  bread: '70–80%',
  wholeWheat: '75–85%',
  rye: '80–90%',
  spelt: '65–75%',
  einkorn: '55–65%',
  glutenFree: 'Varies',
}

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-rose-50 text-rose-700',
}

export default async function FlourGuidePage() {
  const t = await getTranslations('Tools')

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('flourGuide.eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('flourGuide.title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('flourGuide.quote')}
          </p>
        </div>

        {/* Quick comparison table */}
        <div className="bg-white rounded-2xl shadow-md border border-[#f0e4db] mb-16 overflow-hidden">
          <div className="p-6 border-b border-[#f0e4db]">
            <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f]">{t('flourGuide.comparisonTitle')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9ede5]">
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">{t('flourGuide.colFlour')}</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">{t('flourGuide.colProtein')}</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">{t('flourGuide.colHydration')}</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">{t('flourGuide.colFermentation')}</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">{t('flourGuide.colLevel')}</th>
                </tr>
              </thead>
              <tbody>
                {flourKeys.map((key, i) => {
                  const fermentation = t(`flourGuide.flours.${key}.fermentation`)
                  return (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdf6f0]'}>
                      <td className="font-playfair font-bold text-[#3d2b1f] px-5 py-3">{t(`flourGuide.flours.${key}.name`)}</td>
                      <td className="font-lora text-sm text-[#6b4c3b] px-5 py-3">{PROTEIN_BY_FLOUR[key]}</td>
                      <td className="font-lora text-sm text-[#6b4c3b] px-5 py-3">{hydrationByFlour[key]}</td>
                      <td className="font-lora text-sm text-[#6b4c3b] px-5 py-3">{fermentation.split('—')[0].trim()}</td>
                      <td className="px-5 py-3">
                        <span className={`font-lora text-xs px-2.5 py-1 rounded-full ${difficultyColors[difficultyByFlour[key]]}`}>
                          {t(`flourGuide.difficulty.${difficultyByFlour[key]}`)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual flour cards */}
        <div className="space-y-8">
          {flourKeys.map(key => {
            const characteristics = t.raw(`flourGuide.flours.${key}.characteristics`) as string[]
            const difficulty = difficultyByFlour[key]
            return (
              <div key={key} className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f]">{t(`flourGuide.flours.${key}.name`)}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-3 py-1 rounded-full">
                        {t('flourGuide.colProtein')}: {PROTEIN_BY_FLOUR[key]}
                      </span>
                      <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-3 py-1 rounded-full">
                        {t('flourGuide.colHydration')}: {hydrationByFlour[key]}
                      </span>
                      <span className={`font-lora text-xs px-3 py-1 rounded-full ${difficultyColors[difficulty]}`}>
                        {t(`flourGuide.difficulty.${difficulty}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="font-lora italic text-[#6b4c3b] leading-relaxed mb-5">{t(`flourGuide.flours.${key}.description`)}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                  <div>
                    <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('flourGuide.characteristicsLabel')}</div>
                    <ul className="space-y-2">
                      {characteristics.map((c, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c9956c] mt-1.5 flex-shrink-0" />
                          <span className="font-lora text-sm text-[#3d2b1f]">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('flourGuide.bestForLabel')}</div>
                      <p className="font-lora text-sm text-[#3d2b1f]">{t(`flourGuide.flours.${key}.bestFor`)}</p>
                    </div>
                    <div>
                      <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('flourGuide.fermentationLabel')}</div>
                      <p className="font-lora text-sm text-[#3d2b1f]">{t(`flourGuide.flours.${key}.fermentation`)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f9ede5] rounded-xl p-4">
                  <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">{t('flourGuide.bakersNoteLabel')}</div>
                  <p className="font-lora italic text-sm text-[#7a4f3a]">&quot;{t(`flourGuide.flours.${key}.tips`)}&quot;</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}
