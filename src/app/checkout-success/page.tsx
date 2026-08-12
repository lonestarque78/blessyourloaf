import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import CookieLocaleProvider from '@/components/providers/CookieLocaleProvider'

export default async function CheckoutSuccessPage() {
  const t = await getTranslations('Checkout.success')

  return (
    <CookieLocaleProvider>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #f5e6d8 50%, #ede0d4 100%)' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🍞</div>
          <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-4">
            {t('title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] leading-relaxed mb-8">
            {t('body')}
          </p>
          <Link href="/dashboard"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-4 rounded-full font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-lg">
            {t('cta')}
          </Link>
        </div>
      </div>
      <Footer />
    </CookieLocaleProvider>
  )
}
