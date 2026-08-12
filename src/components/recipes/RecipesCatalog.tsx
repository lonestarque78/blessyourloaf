'use client'

import { useTranslations } from 'next-intl'
import RecipeCard from './RecipeCard'
import { useSubscriberRecipes, type RecipeCardData } from '@/lib/hooks/useSubscriberRecipes'

const categories = ['loaf', 'discard', 'rolls', 'focaccia', 'other']

export default function RecipesCatalog({ recipes: initialRecipes }: { recipes: RecipeCardData[] }) {
  const t = useTranslations('Recipes')
  const { recipes, isSubscriber } = useSubscriberRecipes(initialRecipes)

  return (
    <>
      {categories.map(category => {
        const categoryRecipes = recipes.filter(r => r.category === category)
        if (categoryRecipes.length === 0) return null

        return (
          <div key={category} className="mb-16">
            <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-6">
              {t.has(`categoryLabels.${category}`) ? t(`categoryLabels.${category}`) : category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} isSubscriber={isSubscriber} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
