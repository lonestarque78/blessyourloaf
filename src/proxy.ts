import { type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Roots of the public marketing/guide/recipe pages that live under src/app/[locale]/ (see
// CLAUDE.md/BACKLOG.md, Aug 2026 static-rendering fix) — everything else (dashboard, auth,
// checkout, api) keeps the original cookie-based locale and Supabase-only middleware below,
// completely untouched. '' matches the homepage itself.
const LOCALE_ROUTED_ROOTS = new Set([
  '',
  'starter-guide',
  'flour-guide',
  'temperature-guide',
  'hydration-calculator',
  'discard',
  'terms',
  'privacy',
  'pricing',
  'recipes',
])

function isLocaleRoutedPath(pathname: string): boolean {
  const withoutTrailingSlash = pathname.replace(/\/$/, '')
  const withoutLocalePrefix = withoutTrailingSlash.replace(/^\/es(?=\/|$)/, '')
  const segments = withoutLocalePrefix.split('/').filter(Boolean)
  if (segments.length === 0) return true // homepage
  if (segments.length > 2) return false
  return LOCALE_ROUTED_ROOTS.has(segments[0])
}

export async function proxy(request: NextRequest) {
  if (isLocaleRoutedPath(request.nextUrl.pathname)) {
    return intlMiddleware(request)
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}