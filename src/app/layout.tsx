import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${playfair.variable} ${lora.variable}`}>
      <body className="antialiased">
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== 'production'}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </SerwistProvider>
      </body>
    </html>
  )
}