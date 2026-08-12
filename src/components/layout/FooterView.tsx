'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterViewProps {
  user: { firstName?: string } | null
  onSignOut: () => void | Promise<void>
}

// Pure presentational footer — shared by Footer.tsx (server-fetched user, used on pages
// that are already dynamic) and PublicFooter.tsx (client-fetched user, used on the static
// marketing/guide tier). Neither wrapper duplicates this markup.
export default function FooterView({ user, onSignOut }: FooterViewProps) {
  const t = useTranslations('Common')

  return (
    <footer className="bg-[#3d2b1f] text-[#c9a090] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍞</span>
              <span className="font-playfair text-xl font-bold text-white">{t('siteName')}</span>
            </div>
            <p className="font-lora italic text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b07d62] mb-4">{t('footer.bakeHeading')}</div>
              <div className="flex flex-col gap-2">
                <Link href="/recipes" className="font-lora text-sm hover:text-white transition-colors">{t('nav.recipes')}</Link>
                <Link href="/discard" className="font-lora text-sm hover:text-white transition-colors">{t('nav.discardVault')}</Link>
                <Link href="/starter-guide" className="font-lora text-sm hover:text-white transition-colors">{t('nav.starterGuide')}</Link>
                <Link href="/hydration-calculator" className="font-lora text-sm hover:text-white transition-colors">{t('footer.hydrationCalculator')}</Link>
                <Link href="/temperature-guide" className="font-lora text-sm hover:text-white transition-colors">{t('footer.temperatureGuide')}</Link>
              </div>
            </div>
            <div>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b07d62] mb-4">{t('footer.accountHeading')}</div>
              <div className="flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className="font-lora text-sm hover:text-white transition-colors">{t('nav.dashboard')}</Link>
                    <button type="button" onClick={() => onSignOut()} className="font-lora text-sm hover:text-white transition-colors text-left text-[#c9a090]">
                      {t('footer.signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signup" className="font-lora text-sm hover:text-white transition-colors">{t('footer.signUp')}</Link>
                    <Link href="/login" className="font-lora text-sm hover:text-white transition-colors">{t('nav.logIn')}</Link>
                  </>
                )}
                <Link href="/pricing" className="font-lora text-sm hover:text-white transition-colors">{t('nav.pricing')}</Link>
              </div>
            </div>
            <div>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b07d62] mb-4">{t('footer.legalHeading')}</div>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="font-lora text-sm hover:text-white transition-colors">{t('footer.privacy')}</Link>
                <Link href="/terms" className="font-lora text-sm hover:text-white transition-colors">{t('footer.terms')}</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#5c3d2e] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-lora text-xs">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="font-lora text-xs italic">{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  )
}
