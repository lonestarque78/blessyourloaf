import type { MetadataRoute } from 'next'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/locale'
import { localizedPathFor } from '@/i18n/seo'
import { createPublicClient } from '@/lib/supabase/public'

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
