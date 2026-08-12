import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import RecipeDetailView from '@/components/recipes/RecipeDetailView'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPublicClient } from '@/lib/supabase/public'
import { isSupportedLocale } from '@/i18n/locale'
import { buildAlternates } from '@/i18n/seo'

// No generateStaticParams here — deliberately. It was tried first (pre-rendering every free
// slug at build time, matching every other page under this [locale] tree) and it does build
// fine, but breaks at *request* time: verified by isolated reproduction (a bare
// `cookies()` call in a route with generateStaticParams, for any param outside that list,
// throws DYNAMIC_SERVER_USAGE under `next start` — reproduced with both Turbopack and
// webpack builds, so it's a Next.js 16.2.7 App Router constraint, not a bundler quirk or a
// mistake in this file). Every premium and nonexistent recipe slug is necessarily outside
// generateStaticParams (see the RLS note below), so that fallback path is exactly what real
// traffic to those slugs would hit.
//
// Instead: revalidate below gives free recipes the same "generate once, then serve instantly
// to everyone" result as SSG, just via ISR (first hit renders, subsequent hits within the
// window are cached) rather than a guarantee baked in at build time — visible as `ƒ` rather
// than `●` in the build output for this one route, unlike the other 10 pages under
// src/app/[locale]/. Premium/nonexistent slugs render fresh every time, as they must.
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
        <RecipeDetailView recipe={freeRecipe} t={t} showCta={true} />
        <PublicFooter />
      </div>
    )
  }

  // Not a free recipe (premium, unpublished, or nonexistent) — renders fresh every time
  // (see the `revalidate` comment above), so it's fine for this branch to touch the real
  // visitor's session for RLS + subscription gating.
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
      <RecipeDetailView recipe={recipe} t={t} showCta={!user} />
      <PublicFooter />
    </div>
  )
}
