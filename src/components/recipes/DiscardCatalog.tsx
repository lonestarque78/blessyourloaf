'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import RecipeCard from './RecipeCard'
import { useSubscriberRecipes, type RecipeCardData } from '@/lib/hooks/useSubscriberRecipes'

export default function DiscardCatalog({ recipes: initialRecipes }: { recipes: RecipeCardData[] }) {
  const t = useTranslations('Tools')
  const { recipes, isSubscriber } = useSubscriberRecipes(initialRecipes, 'discard')

  return (
    <>
      {recipes.length > 0 ? (
        <>
          <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-6">
            {t('discardVault.recipesTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} isSubscriber={isSubscriber} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🫙</div>
          <p className="font-lora italic text-[#9a7060]">{t('discardVault.noRecipes')}</p>
        </div>
      )}

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
    </>
  )
}
