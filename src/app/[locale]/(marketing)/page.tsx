import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Hero from '@/components/sections/Hero'
import StarterJournal from '@/components/sections/StarterJournal'
import DiscardVault from '@/components/sections/DiscardVault'
import Features from '@/components/sections/Features'
import Pricing from '@/components/sections/Pricing'
import FooterCTA from '@/components/sections/FooterCTA'
import PublicFooter from '@/components/layout/PublicFooter'
import { isSupportedLocale } from '@/i18n/locale'
import { buildAlternates } from '@/i18n/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: buildAlternates('/', isSupportedLocale(locale) ? locale : 'en') }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main>
      <PublicNavbar />
      <Hero />
      <StarterJournal />
      <DiscardVault />
      <Features />
      <Pricing />
      <FooterCTA />
      <PublicFooter />
    </main>
  )
}
