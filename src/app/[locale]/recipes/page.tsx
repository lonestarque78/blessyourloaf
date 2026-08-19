import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import RecipesCatalog from '@/components/recipes/RecipesCatalog'
import { createPublicClient } from '@/lib/supabase/public'
import { isSupportedLocale } from '@/i18n/locale'
import { buildAlternates } from '@/i18n/seo'

// See src/app/[locale]/recipes/[slug]/page.tsx's generateStaticParams comment: without this,
// a page whose only data dependency is a live database query (recipe.is_premium/published)
// gets frozen at build/deploy time and never reflects a later DB change — reproduced for
// real against sitemap.ts in the same pass that added this.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: buildAlternates('/recipes', isSupportedLocale(locale) ? locale : 'en') }
}

export default async function RecipesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Recipes')

  // Anon (cookie-free) client — RLS restricts this to published, non-premium recipes, so
  // this is exactly what an anonymous visitor can see. Logged-in subscribers get the full
  // catalog client-side (see RecipesCatalog / useSubscriberRecipes).
  const supabase = createPublicClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, slug, description, category, is_premium, difficulty, prep_time_minutes, bake_time_minutes')
    .eq('published', true)
    .order('is_premium', { ascending: true })
    .order('title', { ascending: true })

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('list.eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('list.title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('list.quote')}
          </p>
        </div>

        <RecipesCatalog recipes={recipes ?? []} />
      </div>

      <PublicFooter />
    </div>
  )
}
