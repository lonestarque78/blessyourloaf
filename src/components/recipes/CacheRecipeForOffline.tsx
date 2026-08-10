'use client'

import { useEffect } from 'react'
import { cacheRecipe, type CachedRecipe } from '@/lib/recipe-cache'

// Renders nothing — just mirrors the recipe it's given into IndexedDB so the offline
// viewer (public/offline-recipe.html) has something to read if this recipe is opened
// again while offline. Mounted wherever a recipe is viewed or saved.
export default function CacheRecipeForOffline({ recipe }: { recipe: Omit<CachedRecipe, 'cached_at'> }) {
  useEffect(() => {
    cacheRecipe(recipe)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.id, recipe.updated_at])

  return null
}
