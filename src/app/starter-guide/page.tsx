import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

const supplyKeys = ['jar', 'scale', 'flour', 'water', 'band', 'spot'] as const
const stepKeys = ['day1', 'days23', 'days47', 'week2'] as const
const faqKeys = ['howLong', 'whatFlour', 'smellsBad', 'liquidOnTop', 'storeLongTerm', 'unfedMonths'] as const

export default async function StarterGuidePage() {
  const t = await getTranslations('Tools')

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('starterGuide.eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('starterGuide.title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('starterGuide.quote')}
          </p>
        </div>

        {/* What is a starter */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-4">{t('starterGuide.whatIsTitle')}</h2>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            {t('starterGuide.whatIsBody1')}
          </p>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            {t('starterGuide.whatIsBody2')}
          </p>
          <p className="font-lora italic text-[#7a4f3a]">
            {t('starterGuide.whatIsQuote')}
          </p>
        </div>

        {/* What you need */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-5">{t('starterGuide.whatYoullNeedTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplyKeys.map(key => (
              <div key={key} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#c9956c] mt-2 flex-shrink-0" />
                <div>
                  <div className="font-lora font-medium text-[#3d2b1f]">{t(`starterGuide.supplies.${key}.item`)}</div>
                  <div className="font-lora text-xs italic text-[#9a7060]">{t(`starterGuide.supplies.${key}.note`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day by day guide */}
        <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-8">{t('starterGuide.dayByDayTitle')}</h2>
        <div className="space-y-6 mb-16">
          {stepKeys.map(key => (
            <div key={key} className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-4 py-1.5 rounded-full font-lora text-sm">
                  {t(`starterGuide.steps.${key}.day`)}
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#3d2b1f]">{t(`starterGuide.steps.${key}.title`)}</h3>
              </div>
              <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">{t(`starterGuide.steps.${key}.description`)}</p>
              <div className="bg-[#f9ede5] rounded-xl p-4 mb-4">
                <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">{t('starterGuide.bakersNoteLabel')}</div>
                <p className="font-lora italic text-sm text-[#7a4f3a]">&quot;{t(`starterGuide.steps.${key}.tip`)}&quot;</p>
              </div>
              <div className="bg-[#f0e8f0] rounded-xl p-4">
                <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">{t('starterGuide.whatToExpectLabel')}</div>
                <p className="font-lora text-sm text-[#3d2b1f]">{t(`starterGuide.steps.${key}.whatToExpect`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-8">{t('starterGuide.faqTitle')}</h2>
        <div className="space-y-4 mb-16">
          {faqKeys.map(key => (
            <div key={key} className="bg-white rounded-2xl p-6 shadow-md border border-[#f0e4db]">
              <h3 className="font-playfair font-bold text-[#3d2b1f] mb-2">{t(`starterGuide.faqs.${key}.q`)}</h3>
              <p className="font-lora text-sm text-[#6b4c3b] leading-relaxed">{t(`starterGuide.faqs.${key}.a`)}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <h2 className="font-playfair text-2xl font-bold text-white mb-3">
            {t('starterGuide.ctaTitle')}
          </h2>
          <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
            {t('starterGuide.ctaBody')}
          </p>
          <Link href="/signup"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
            {t('startFreeToday')}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
