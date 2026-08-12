import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import { SerwistProvider } from '@serwist/next/react'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: 'Bless Your Loaf — Sourdough Baking Made Simple',
  description: 'Grow your starter, bake real bread, and never waste a drop of discard. Simple ingredients, no additives — sourdough done right.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bless Your Loaf',
  },
}

export const viewport: Viewport = {
  themeColor: '#c9956c',
}

// Deliberately locale-agnostic: this used to call getLocale()/getMessages() (cookie-based)
// unconditionally here, which forced every route in the app dynamic, including the public
// marketing/guide/recipe pages under src/app/[locale]/ that this file wraps too — see
// BACKLOG.md, Aug 2026. NextIntlClientProvider now lives one level down in each tier
// instead: src/app/[locale]/layout.tsx (URL-based, static-friendly) and
// src/components/providers/CookieLocaleProvider.tsx (cookie-based, used by the dashboard/
// auth/checkout pages that were already dynamic and still are).
//
// One accepted tradeoff: <html lang> can only be set once, here, so it can't reflect the
// per-request resolved locale. Left as the default locale — Google relies on hreflang tags
// (see src/i18n/seo.ts) for language targeting, not this attribute.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <body className="antialiased">
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== 'production'}>
          {children}
        </SerwistProvider>
      </body>
    </html>
  )
}