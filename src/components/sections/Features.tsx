import { getTranslations } from 'next-intl/server'

const featureKeys = [
  { key: 'starterJournal', icon: '🫙', bg: '#f9ede5' },
  { key: 'bakeScheduler', icon: '📅', bg: '#f0e8f0' },
  { key: 'discardVault', icon: '🗄️', bg: '#fef3e2' },
  { key: 'troubleshooter', icon: '🩺', bg: '#e8f4f0' },
  { key: 'recipeLibrary', icon: '📖', bg: '#fde8e8' },
  { key: 'flourGuide', icon: '🌾', bg: '#f5f0e8' },
] as const

export default async function Features() {
  const t = await getTranslations('Marketing.features')

  return (
    <section className="py-24 px-6 bg-[#fdf6f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">{t('title')}</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map(({ key, icon, bg }) => (
            <div key={key} className="bg-white rounded-2xl p-7 shadow-md hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: bg }}>
                {icon}
              </div>
              <div className="font-playfair text-lg font-bold text-[#3d2b1f] mb-2">{t(`items.${key}.label`)}</div>
              <p className="font-lora italic text-sm text-[#6b4c3b] leading-relaxed">{t(`items.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
