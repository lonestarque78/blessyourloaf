import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import RecipeDetailView from '@/components/recipes/RecipeDetailView'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPublicClient } from '@/lib/supabase/public'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSupportedLocale } from '@/i18n/locale'
import { buildAlternates, localizedPathFor } from '@/i18n/seo'

// generateStaticParams was tried here originally, before every recipe was made free (see
// BACKLOG.md / the Aug 2026 pricing rework). It built fine but broke at *request* time: a
// bare `cookies()` call in a route with generateStaticParams, for any param outside that
// list, threw DYNAMIC_SERVER_USAGE under `next start` — verified by isolated reproduction
// with both Turbopack and webpack, so a Next.js 16.2.7 App Router constraint, not a bundler
// quirk. Back then every premium recipe slug was necessarily outside generateStaticParams
// (free-only, see the RLS note below) and still had to hit `createClient()`/cookies() to
// check the visitor's subscription, so that failure path was live traffic, not a theoretical
// edge case.
//
// That's no longer true: every published recipe is now free, so the branch below that calls
// `createClient()` only runs for a slug that doesn't exist at all — and it calls `notFound()`
// before ever reaching `createClient()`, so cookies() is never touched on that path either.
// Re-verified by the same method as the original finding: built, ran `next start`, and curled
// both a real slug and a nonexistent one — no DYNAMIC_SERVER_USAGE, both routes shown as `●`
// (SSG) in the build output like the other pages under src/app/[locale]/. If a future recipe
// is ever marked premium again, this comment's reasoning breaks and ISR (revalidate, no
// generateStaticParams) is the safer default again — don't restore generateStaticParams
// blindly if that happens.
export async function generateStaticParams() {
  const supabase = createPublicClient()
  const { data: recipes } = await supabase.from('recipes').select('slug').eq('published', true).eq('is_premium', false)

  return (recipes ?? []).flatMap(r => SUPPORTED_LOCALES.map(locale => ({ locale, slug: r.slug })))
}

// Kept alongside generateStaticParams as a revalidation window (not the ISR-without-SSG
// fallback it used to be) so a recipe edited directly in the database shows up within an
// hour without needing a full redeploy.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params

  // Public-client-only: a premium recipe's real title/description isn't something a
  // non-subscriber or a crawler should see in metadata anyway, so there's no need to reach
  // for the authenticated client here.
  const supabase = createPublicClient()
  const { data: recipe } = await supabase.from('recipes').select('title, description').eq('slug', slug).eq('published', true).eq('is_premium', false).maybeSingle()

  return {
    title: recipe?.title,
    description: recipe?.description ?? undefined,
    alternates: buildAlternates(`/recipes/${slug}`, isSupportedLocale(locale) ? locale : 'en'),
  }
}

export default async function RecipePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Recipes')
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}${localizedPathFor(`/recipes/${slug}`, isSupportedLocale(locale) ? locale : DEFAULT_LOCALE)}`

  const publicSupabase = createPublicClient()
  const { data: freeRecipe } = await publicSupabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .eq('is_premium', false)
    .maybeSingle()

  if (freeRecipe) {
    return (
      <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
        <PublicNavbar />
        <RecipeDetailView recipe={freeRecipe} t={t} showCta={true} canonicalUrl={canonicalUrl} />
        <PublicFooter />
      </div>
    )
  }

  // Not a free recipe — in practice, given every published recipe is free now, this means
  // "doesn't exist" (typo'd or stale URL), and notFound() below returns before this branch
  // ever reaches createClient()/cookies() (see the generateStaticParams comment above). It's
  // still fine for this branch to touch the visitor's session if it ever does get further,
  // since it's not part of the pre-rendered static set either way.
  //
  // A real, pre-existing bug surfaced by actually testing this path end-to-end (not
  // introduced by this change — the query below is what the original code always ran):
  // RLS (see supabase/migrations/202606010006_baseline_recipes.sql) hides is_premium=true
  // rows from anyone who isn't an active subscriber, including the "does this slug even
  // exist" check. Querying with the visitor's own session made a real premium recipe
  // indistinguishable from a nonexistent one — anonymous and free-tier visitors got a bare
  // 404 instead of a redirect to log in or subscribe. The admin client here bypasses RLS
  // only to answer "does this slug exist, and is it premium" (is_premium is not sensitive);
  // the actual recipe *content* below is still fetched through the visitor's own
  // authenticated client, so RLS still governs who can read it.
  const admin = createAdminClient()
  const { data: recipeMeta } = await admin.from('recipes').select('is_premium').eq('slug', slug).eq('published', true).maybeSingle()
  if (!recipeMeta) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (recipeMeta.is_premium) {
    if (!user) redirect('/login?next=/recipes/' + slug)

    const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
    const isSubscriber = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
    if (!isSubscriber) redirect('/pricing')
  }

  const { data: recipe } = await supabase.from('recipes').select('*').eq('slug', slug).eq('published', true).single()
  if (!recipe) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <PublicNavbar />
      <RecipeDetailView recipe={recipe} t={t} showCta={!user} canonicalUrl={canonicalUrl} />
      <PublicFooter />
    </div>
  )
}
