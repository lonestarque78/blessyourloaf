'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { RecipeCardData } from '@/lib/hooks/useSubscriberRecipes'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
}

// Shared by RecipesCatalog and DiscardCatalog — used to be duplicated markup in each page.
export default function RecipeCard({ recipe, isSubscriber }: { recipe: RecipeCardData; isSubscriber: boolean }) {
  const t = useTranslations('Recipes')
  const locked = recipe.is_premium && !isSubscriber

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-md border border-[#f0e4db] relative ${locked ? 'opacity-90' : 'hover:-translate-y-1 transition-transform'}`}>
      {recipe.is_premium && (
        <span className="absolute top-3 right-3 font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white px-2.5 py-1 rounded-full">
          {t('list.premium')}
        </span>
      )}

      <div className="mb-2">
        <div className="font-playfair text-lg font-bold text-[#3d2b1f] mb-1 pr-16">{recipe.title}</div>
        <p className="font-lora italic text-xs text-[#9a7060] leading-relaxed line-clamp-2">{recipe.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`font-lora text-xs px-2.5 py-1 rounded-full capitalize ${difficultyColors[recipe.difficulty] || 'bg-gray-50 text-gray-600'}`}>
          {t.has(`difficultyLabels.${recipe.difficulty}`) ? t(`difficultyLabels.${recipe.difficulty}`) : recipe.difficulty}
        </span>
        {recipe.prep_time_minutes && (
          <span className="font-lora text-xs px-2.5 py-1 rounded-full bg-[#f9ede5] text-[#b07d62]">
            ⏱ {t('list.minTotal', { minutes: recipe.prep_time_minutes + (recipe.bake_time_minutes || 0) })}
          </span>
        )}
      </div>

      {locked ? (
        <div className="flex items-center justify-between">
          <span className="font-lora text-xs text-[#9a7060] italic">{t('list.subscribeToUnlock')}</span>
          <Link href="/pricing"
            className="font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-4 py-1.5 rounded-full hover:-translate-y-0.5 transition-transform">
            {t('list.unlock')}
          </Link>
        </div>
      ) : (
        <Link href={`/recipes/${recipe.slug}`}
          className="font-lora text-sm text-[#b07d62] hover:underline">
          {t('list.viewRecipe')}
        </Link>
      )}
    </div>
  )
}
