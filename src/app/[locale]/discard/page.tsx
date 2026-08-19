import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import DiscardCatalog from '@/components/recipes/DiscardCatalog'
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
  return { alternates: buildAlternates('/discard', isSupportedLocale(locale) ? locale : 'en') }
}

export default async function DiscardVaultPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Tools')

  // See src/app/[locale]/recipes/page.tsx — same anon-client + client-side subscriber
  // refinement pattern, filtered to the discard category.
  const supabase = createPublicClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, slug, description, category, is_premium, difficulty, prep_time_minutes, bake_time_minutes')
    .eq('published', true)
    .eq('category', 'discard')
    .order('is_premium', { ascending: true })
    .order('title', { ascending: true })

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">{t('discardVault.eyebrow')}</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            {t('discardVault.title')}
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            {t('discardVault.quote')}
          </p>
        </div>

        {/* What is discard explainer */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <div className="flex gap-5 items-start">
            <span className="text-4xl flex-shrink-0">🫙</span>
            <div>
              <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-2">{t('discardVault.explainerTitle')}</h2>
              <p className="font-lora text-sm text-[#6b4c3b] leading-relaxed">
                {t('discardVault.explainerBody')}
              </p>
            </div>
          </div>
        </div>

        <DiscardCatalog recipes={recipes ?? []} />
      </div>

      <PublicFooter />
    </div>
  )
}
