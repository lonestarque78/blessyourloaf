import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, type Locale } from './locale'

import enCommon from '../../messages/en/common.json'
import enMarketing from '../../messages/en/marketing.json'
import enAuth from '../../messages/en/auth.json'
import enDashboard from '../../messages/en/dashboard.json'
import enStarters from '../../messages/en/starters.json'
import enBake from '../../messages/en/bake.json'
import enRecipes from '../../messages/en/recipes.json'
import enMyRecipes from '../../messages/en/my-recipes.json'
import enTroubleshooter from '../../messages/en/troubleshooter.json'
import enTools from '../../messages/en/tools.json'
import enPricing from '../../messages/en/pricing.json'
import enAccount from '../../messages/en/account.json'
import enCheckout from '../../messages/en/checkout.json'

import esCommon from '../../messages/es/common.json'
import esMarketing from '../../messages/es/marketing.json'
import esAuth from '../../messages/es/auth.json'
import esDashboard from '../../messages/es/dashboard.json'
import esStarters from '../../messages/es/starters.json'
import esBake from '../../messages/es/bake.json'
import esRecipes from '../../messages/es/recipes.json'
import esMyRecipes from '../../messages/es/my-recipes.json'
import esTroubleshooter from '../../messages/es/troubleshooter.json'
import esTools from '../../messages/es/tools.json'
import esPricing from '../../messages/es/pricing.json'
import esAccount from '../../messages/es/account.json'
import esCheckout from '../../messages/es/checkout.json'

const MESSAGES = {
  en: {
    Common: enCommon,
    Marketing: enMarketing,
    Auth: enAuth,
    Dashboard: enDashboard,
    Starters: enStarters,
    Bake: enBake,
    Recipes: enRecipes,
    MyRecipes: enMyRecipes,
    Troubleshooter: enTroubleshooter,
    Tools: enTools,
    Pricing: enPricing,
    Account: enAccount,
    Checkout: enCheckout,
  },
  es: {
    Common: esCommon,
    Marketing: esMarketing,
    Auth: esAuth,
    Dashboard: esDashboard,
    Starters: esStarters,
    Bake: esBake,
    Recipes: esRecipes,
    MyRecipes: esMyRecipes,
    Troubleshooter: esTroubleshooter,
    Tools: esTools,
    Pricing: esPricing,
    Account: esAccount,
    Checkout: esCheckout,
  },
} satisfies Record<Locale, Record<string, unknown>>

// Cookie-based locale, used by every route OUTSIDE the src/app/[locale] segment
// (dashboard, auth, checkout) — these stay dynamic already (per-user Supabase session
// data), so reading a cookie here costs nothing extra. Chosen via the language switcher,
// which sets this cookie, so those routes stay at their existing unprefixed URLs.
export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  if (isSupportedLocale(cookieLocale)) return cookieLocale

  // No cookie yet (first visit) — fall back to the browser's Accept-Language rather than
  // always defaulting to English.
  const acceptLanguage = (await headers()).get('accept-language') ?? ''
  if (acceptLanguage.toLowerCase().startsWith('es')) return 'es'

  return DEFAULT_LOCALE
}

// Public marketing/guide/recipe pages live under src/app/[locale]/ and are routed by
// next-intl's middleware (src/i18n/routing.ts + src/proxy.ts) — `requestLocale` there
// resolves from the URL segment, never touching cookies(), which is what makes those
// routes static-generation-eligible. Everything else renders outside that segment, so
// `requestLocale` resolves to undefined and we fall back to the cookie above — same
// behavior as before this change, for exactly the routes that still need it.
export default getRequestConfig(async ({ requestLocale }) => {
  const segmentLocale = await requestLocale
  const locale = isSupportedLocale(segmentLocale) ? segmentLocale : await resolveLocale()
  return { locale, messages: MESSAGES[locale] }
})
