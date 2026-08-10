import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, type Locale } from '../i18n/locale'

// Matches the my-recipes detail route (/dashboard/my-recipes/<id>) and nothing else —
// not the list page (no id segment) and not /dashboard/my-recipes/new, which needs a
// live connection to import/save and has nothing to read from the offline cache.
const RECIPE_DETAIL_PATH = /^\/dashboard\/my-recipes\/([^/]+)\/?$/

export function parseRecipeIdFromPath(pathname: string): string | null {
  const match = RECIPE_DETAIL_PATH.exec(pathname)
  if (!match) return null
  const id = match[1]
  return id === 'new' ? null : id
}

// Mirrors src/i18n/locale.ts's cookie-based locale selection (see also public/offline.html's
// inline script) — this view has no server render to run next-intl through, so it reads the
// same BYL_LOCALE cookie directly instead.
export function pickLocale(cookieString: string): Locale {
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`))
  const value = match?.[1]
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE
}
