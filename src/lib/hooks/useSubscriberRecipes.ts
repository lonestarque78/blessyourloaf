'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface RecipeCardData {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  is_premium: boolean
  difficulty: string
  prep_time_minutes: number | null
  bake_time_minutes: number | null
}

// The static-tier recipe/discard listing pages fetch with an anon (cookie-free) client, so
// RLS (see supabase/migrations/202606010006_baseline_recipes.sql) only ever returns free
// recipes — anonymous visitors can't see premium rows at all. That's the correct default
// for the ~everyone who's not already a paying subscriber, but a logged-in subscriber
// browsing here (e.g. via the dashboard's "Library" link) should see the full catalog they
// actually have access to. This re-fetches with their real session once confirmed.
export function useSubscriberRecipes(initialRecipes: RecipeCardData[], categoryFilter?: string) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [isSubscriber, setIsSubscriber] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active || !user) return
      const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
      if (!active) return
      const subscriber = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
      if (!subscriber) return
      setIsSubscriber(true)

      let query = supabase
        .from('recipes')
        .select('id, title, slug, description, category, is_premium, difficulty, prep_time_minutes, bake_time_minutes')
        .eq('published', true)
        .order('is_premium', { ascending: true })
        .order('title', { ascending: true })
      if (categoryFilter) query = query.eq('category', categoryFilter)

      const { data: fullRecipes } = await query
      if (active && fullRecipes) setRecipes(fullRecipes)
    })

    return () => {
      active = false
    }
  }, [categoryFilter])

  return { recipes, isSubscriber }
}
