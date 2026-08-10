import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import TemperaturePredictorTool from '@/components/tools/TemperaturePredictorTool'
import { getTranslations } from 'next-intl/server'

export default async function TemperatureGuidePage() {
  const t = await getTranslations('Tools')

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('temperature.title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('temperature.quote')}
          </p>
        </div>

        <div className="mb-12">
          <TemperaturePredictorTool />
        </div>

        {/* Why temperature matters */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-4">{t('temperature.explainerTitle')}</h2>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            {t('temperature.explainerBody1')}
          </p>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            {t('temperature.explainerBody2')}
          </p>
          <p className="font-lora italic text-[#7a4f3a]">
            {t('temperature.explainerQuote')}
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <h2 className="font-playfair text-2xl font-bold text-white mb-3">
            {t('temperature.ctaTitle')}
          </h2>
          <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
            {t('temperature.ctaBody')}
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
