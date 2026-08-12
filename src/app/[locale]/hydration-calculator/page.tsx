import type { Metadata } from 'next'
import Link from 'next/link'
import HydrationCalculatorTool from '@/components/tools/HydrationCalculatorTool'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import { isSupportedLocale } from '@/i18n/locale'
import { buildAlternates } from '@/i18n/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: buildAlternates('/hydration-calculator', isSupportedLocale(locale) ? locale : 'en') }
}

export default async function HydrationCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Tools')

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('hydration.title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('hydration.quote')}
          </p>
        </div>

        <div className="mb-12">
          <HydrationCalculatorTool />
        </div>

        {/* What is hydration */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-4">{t('hydration.explainerTitle')}</h2>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            {t('hydration.explainerBody')}
          </p>
          <p className="font-lora italic text-[#7a4f3a]">
            {t('hydration.explainerQuote')}
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <h2 className="font-playfair text-2xl font-bold text-white mb-3">
            {t('hydration.ctaTitle')}
          </h2>
          <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
            {t('hydration.ctaBody')}
          </p>
          <Link href="/signup"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
            {t('startFreeToday')}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
