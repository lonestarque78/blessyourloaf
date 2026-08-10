import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
}

export default async function DiscardVaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('Tools')
  const tRecipes = await getTranslations('Recipes')

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single() : { data: null }

  const isSubscriber = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, slug, description, category, is_premium, difficulty, prep_time_minutes, bake_time_minutes, tags')
    .eq('published', true)
    .eq('category', 'discard')
    .order('is_premium', { ascending: true })
    .order('title', { ascending: true })

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

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

        {/* Recipe grid */}
        {recipes && recipes.length > 0 ? (
          <>
            <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-6">
              {t('discardVault.recipesTitle')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {recipes.map(recipe => {
                const locked = recipe.is_premium && !isSubscriber

                return (
                  <div key={recipe.id} className={`bg-white rounded-2xl p-4 shadow-md border border-[#f0e4db] relative ${!locked ? 'hover:-translate-y-1 transition-transform' : ''}`}>
                    {recipe.is_premium && (
                      <span className="absolute top-3 right-3 font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white px-2.5 py-1 rounded-full">
                        {tRecipes('list.premium')}
                      </span>
                    )}

                    <div className="mb-2">
                      <div className="font-playfair text-lg font-bold text-[#3d2b1f] mb-1 pr-16">{recipe.title}</div>
                      <p className="font-lora italic text-xs text-[#9a7060] leading-relaxed line-clamp-2">{recipe.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`font-lora text-xs px-2.5 py-1 rounded-full capitalize ${difficultyColors[recipe.difficulty] || 'bg-gray-50 text-gray-600'}`}>
                        {tRecipes.has(`difficultyLabels.${recipe.difficulty}`) ? tRecipes(`difficultyLabels.${recipe.difficulty}`) : recipe.difficulty}
                      </span>
                      {recipe.prep_time_minutes && (
                        <span className="font-lora text-xs px-2.5 py-1 rounded-full bg-[#f9ede5] text-[#b07d62]">
                          ⏱ {tRecipes('list.minTotal', { minutes: recipe.prep_time_minutes + (recipe.bake_time_minutes || 0) })}
                        </span>
                      )}
                    </div>

                    {locked ? (
                      <div className="flex items-center justify-between">
                        <span className="font-lora text-xs text-[#9a7060] italic">{tRecipes('list.subscribeToUnlock')}</span>
                        <Link href="/pricing"
                          className="font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-4 py-1.5 rounded-full hover:-translate-y-0.5 transition-transform">
                          {tRecipes('list.unlock')}
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/recipes/${recipe.slug}`}
                        className="font-lora text-sm text-[#b07d62] hover:underline">
                        {tRecipes('list.viewRecipe')}
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🫙</div>
            <p className="font-lora italic text-[#9a7060]">{t('discardVault.noRecipes')}</p>
          </div>
        )}

        {/* CTA for non subscribers */}
        {!isSubscriber && (
          <div className="mt-16 rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
            <p className="font-playfair text-2xl font-bold text-white mb-3">
              {t('discardVault.ctaTitle')}
            </p>
            <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
              {t('discardVault.ctaBody')}
            </p>
            <Link href="/signup"
              className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
              {t('discardVault.subscribeNow')}
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
