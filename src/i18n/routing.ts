import { defineRouting } from 'next-intl/routing'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale'

// Governs ONLY the public marketing/guide/recipe pages under src/app/[locale]/ — see
// src/proxy.ts for which paths are routed through this. 'as-needed' keeps the default
// locale (English) at today's unprefixed URLs (/starter-guide) and gives Spanish its own
// real, crawlable URLs (/es/starter-guide) that didn't exist before this change.
export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
})
