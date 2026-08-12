import type { Metadata } from 'next'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from './locale'

// Mirrors src/i18n/routing.ts's 'as-needed' localePrefix: English stays unprefixed,
// Spanish lives under /es. `path` is locale-agnostic, e.g. '/' or '/starter-guide'.
export function localizedPathFor(path: string, locale: Locale): string {
  const clean = path === '/' ? '' : path
  return locale === DEFAULT_LOCALE ? clean || '/' : `/es${clean}`
}

// Builds the canonical + hreflang alternate tags for a page under src/app/[locale]/.
// Without these, /starter-guide and /es/starter-guide read as duplicate content to
// Google rather than translations of each other — see BACKLOG.md, Aug 2026.
export function buildAlternates(path: string, locale: Locale): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const l of SUPPORTED_LOCALES) {
    languages[l] = localizedPathFor(path, l)
  }
  languages['x-default'] = localizedPathFor(path, DEFAULT_LOCALE)

  return {
    canonical: localizedPathFor(path, locale),
    languages,
  }
}
