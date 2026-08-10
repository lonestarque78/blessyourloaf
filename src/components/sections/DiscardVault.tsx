import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

const recipeKeys = [
  { key: 'pancakes', color: '#f4a261', icon: '🥞' },
  { key: 'crackers', color: '#b5838d', icon: '🫙' },
  { key: 'pizza', color: '#6d6875', icon: '🍕' },
  { key: 'muffins', color: '#c9a84c', icon: '🧁' },
] as const

export default async function DiscardVault() {
  const t = await getTranslations('Marketing.discardVault')

  return (
    <section className="py-24 px-6" style={{ background: 'linear-gradient(160deg, #f5e6d8, #ede0d4)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">{t('title')}</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
          <p className="font-lora italic text-[#6b4c3b] max-w-md mx-auto">
            {t('quote')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {recipeKeys.map(({ key, color, icon }) => (
            <div key={key} className="bg-white rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: color + '22', border: `1.5px solid ${color}44` }}>
                {icon}
              </div>
              <span className="font-lora text-xs px-3 py-1 rounded-full"
                style={{ background: color + '18', color: color }}>
                {t(`recipes.${key}.tag`)}
              </span>
              <div className="font-playfair font-bold text-[#3d2b1f] mt-3 mb-2">{t(`recipes.${key}.name`)}</div>
              <div className="font-lora text-sm text-[#9a7060]">⏱ {t(`recipes.${key}.time`)}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/discard" className="border border-[#c9956c] text-[#7a4f3a] px-7 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all inline-block">
            {t('explore')}
          </Link>
        </div>
      </div>
    </section>
  )
}
