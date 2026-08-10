export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'BYL_LOCALE'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
}

// Tag to pass to Intl / Date#toLocaleDateString so dates render in the right language,
// not just the UI strings around them.
export const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
}

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
