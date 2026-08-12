import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

// Cookie-based locale provider for everything OUTSIDE src/app/[locale]/ (dashboard, auth,
// checkout) — these pages were already dynamic (per-user Supabase session data), so
// resolving locale from a cookie here costs nothing extra. Used in place of the
// NextIntlClientProvider that used to live in the root layout — see src/app/layout.tsx and
// src/app/[locale]/layout.tsx for the URL-based equivalent used by the static tier.
export default async function CookieLocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
