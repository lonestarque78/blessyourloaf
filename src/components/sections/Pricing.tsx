import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Pricing() {
  const t = await getTranslations('Marketing.pricing')
  const freeFeatures = t.raw('free.features') as string[]
  const proFeatures = t.raw('pro.features') as string[]
  const annualFeatures = t.raw('annual.features') as string[]

  return (
    <section className="py-24 px-6 bg-[#fdf6f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">{t('title')}</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch">
          {/* Free */}
          <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('free.badge')}</div>
            <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">{t('free.price')}</div>
            <p className="font-lora italic text-[#9a7060] text-sm mb-8">{t('free.subtitle')}</p>
            {freeFeatures.map(f => (
              <div key={f} className="flex gap-3 items-center mb-3">
                <span className="text-[#c9956c]">✓</span>
                <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
              </div>
            ))}
            <Link href="/signup" className="block text-center border border-[#c9956c] text-[#7a4f3a] px-6 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all mt-8">
              {t('free.cta')}
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-3xl p-9 flex-1 max-w-sm md:scale-105 shadow-2xl"
            style={{ background: 'linear-gradient(160deg, #3d2b1f, #5c3d2e)', border: '1.5px solid #c9956c' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="font-lora text-xs uppercase tracking-widest text-[#e8b4a0]">{t('pro.badge')}</div>
              <span className="bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white text-xs font-lora px-3 py-1 rounded-full">{t('pro.mostPopular')}</span>
            </div>
            <div className="font-playfair text-5xl font-black text-white mb-1">{t('pro.price')}<span className="text-xl font-normal">{t('pro.period')}</span></div>
            <p className="font-lora italic text-[#c9a090] text-sm mb-8">{t('pro.subtitle')}</p>
            {proFeatures.map(f => (
              <div key={f} className="flex gap-3 items-center mb-3">
                <span className="text-[#c9956c]">✓</span>
                <span className="font-lora text-sm text-[#e8d5c8]">{f}</span>
              </div>
            ))}
            <Link href="/signup?plan=monthly" className="block text-center bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg mt-8 whitespace-nowrap">
              {t('pro.cta')}
            </Link>
          </div>

          {/* Annual */}
          <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('annual.badge')}</div>
            <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">{t('annual.price')}<span className="text-xl font-normal">{t('annual.period')}</span></div>
            <span className="inline-block bg-gradient-to-r from-[#e8b4a0] to-[#c9956c] text-white text-xs font-lora px-3 py-1 rounded-full mb-6">{t('annual.saveBadge')}</span>
            {annualFeatures.map(f => (
              <div key={f} className="flex gap-3 items-center mb-3">
                <span className="text-[#c9956c]">✓</span>
                <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
              </div>
            ))}
            <Link href="/signup?plan=annual" className="block text-center bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg mt-8">
              {t('annual.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
