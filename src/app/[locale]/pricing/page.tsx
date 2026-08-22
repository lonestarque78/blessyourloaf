import type { Metadata } from 'next'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import PricingCards from '@/components/pricing/PricingCards'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { isSupportedLocale } from '@/i18n/locale'
import { buildAlternates } from '@/i18n/seo'

const featureRows = [
  { key: 'starterJournal', free: true, paid: true },
  { key: 'feedingLog', free: true, paid: true },
  { key: 'fullLibrary', free: true, paid: true },
  { key: 'flourGuide', free: true, paid: true },
  { key: 'bakeHistory', free: true, paid: true },
  { key: 'personalRecipeBox', free: true, paid: true },
  // These four all draw from one shared daily total (see the note below the table) rather
  // than each having its own separate allowance, so the cell text carries the actual number
  // instead of a checkmark — a plain checkmark here would wrongly imply free gets zero and
  // paid gets infinite access to each one independently.
  { key: 'aiTroubleshooter', free: 'quota', paid: 'quota' },
  { key: 'aiSubstitution', free: 'quota', paid: 'quota' },
  { key: 'aiRecipeGeneration', free: 'quota', paid: 'quota' },
  { key: 'aiScheduler', free: 'quota', paid: 'quota' },
] as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: buildAlternates('/pricing', isSupportedLocale(locale) ? locale : 'en') }
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Pricing')

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <PublicNavbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('quote')}
          </p>
        </div>

        <PricingCards
          isSubscriber={false}
          isLoggedIn={false}
          monthlyPriceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!}
          annualPriceId={process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!}
        />

        {/* Feature comparison */}
        <div className="mt-20 bg-white rounded-2xl shadow-md border border-[#f0e4db] overflow-hidden">
          <div className="p-6 border-b border-[#f0e4db]">
            <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f]">{t('whatsIncluded')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9ede5]">
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-6 py-4">{t('colFeature')}</th>
                  <th className="text-center font-lora text-xs uppercase tracking-widest text-[#b8896e] px-6 py-4">{t('colFree')}</th>
                  <th className="text-center font-lora text-xs uppercase tracking-widest text-[#b8896e] px-6 py-4">{t('colSubscriber')}</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map(({ key, free, paid }, i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdf6f0]'}>
                    <td className="font-lora text-sm text-[#3d2b1f] px-6 py-3">{t(`features.${key}`)}</td>
                    <td className="text-center px-6 py-3">
                      {free === 'quota'
                        ? <span className="font-lora text-sm text-[#3d2b1f]">{t('quotaFree')}</span>
                        : free
                          ? <span className="text-green-600 font-bold">✓</span>
                          : <span className="text-[#d4b8a8]">—</span>}
                    </td>
                    <td className="text-center px-6 py-3">
                      {paid === 'quota'
                        ? <span className="font-lora text-sm text-[#3d2b1f]">{t('quotaPaid')}</span>
                        : paid
                          ? <span className="text-green-600 font-bold">✓</span>
                          : <span className="text-[#d4b8a8]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[#f0e4db]">
            <p className="font-lora text-sm text-[#9a7060]">
              {t('quotaNote')}
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="font-lora italic text-sm text-[#9a7060]">
            {t('footerNote')}
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
