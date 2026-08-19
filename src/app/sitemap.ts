import type { MetadataRoute } from 'next'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/locale'
import { localizedPathFor } from '@/i18n/seo'
import { createPublicClient } from '@/lib/supabase/public'

// Without this, Next treats sitemap.ts as fully static (no data dependency it can see) and
// bakes in the recipe list from whatever the database looked like at build/deploy time,
// permanently — a recipe added, removed, or changed afterward would silently never show up
// (or never disappear) until the next full redeploy. Verified by reproduction: a stale
// .next/cache entry from before recipes went free served only the 2 originally-free recipes
// here even on a fresh `npm run build`, while a genuinely clean rebuild (rm -rf .next) picked
// up all 20 — this revalidate window is what keeps that from being a redeploy-only fix in
// production. Matches the window on src/app/[locale]/recipes/[slug]/page.tsx.
export const revalidate = 3600

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

// The static, always-present public pages (see src/app/[locale]/) — everything the Aug
// 2026 static-rendering fix covers. Free recipe slugs are appended below at request time.
const STATIC_PATHS = [
  '/',
  '/starter-guide',
  '/flour-guide',
  '/temperature-guide',
  '/hydration-calculator',
  '/discard',
  '/terms',
  '/privacy',
  '/pricing',
  '/recipes',
]

function entry(path: string): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map(locale => [locale, `${APP_URL}${localizedPathFor(path, locale)}`])
  )
  return {
    url: `${APP_URL}${localizedPathFor(path, DEFAULT_LOCALE)}`,
    alternates: { languages },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()
  const { data: recipes } = await supabase.from('recipes').select('slug').eq('published', true).eq('is_premium', false)

  const recipePaths = (recipes ?? []).map(r => `/recipes/${r.slug}`)

  return [...STATIC_PATHS, ...recipePaths].map(entry)
}
