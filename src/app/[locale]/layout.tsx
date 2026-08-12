import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { SUPPORTED_LOCALES, isSupportedLocale } from '@/i18n/locale'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) notFound()

  // Tells next-intl which locale this (possibly statically-generated) render is for,
  // without reading a cookie — see src/i18n/request.ts for how this is picked up. Must run
  // before getMessages() below, in this same component: the root layout (the parent)
  // renders/resolves first, so if it called getLocale()/getMessages() itself — as it used
  // to — it would always see requestLocale as unset and fall through to the cookie,
  // forcing this whole static tier dynamic again. That's why the provider lives here
  // instead of in src/app/layout.tsx.
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
