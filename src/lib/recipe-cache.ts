import Dexie, { type EntityTable } from 'dexie'

export interface CachedIngredient {
  item: string
  amount: string
  note?: string
}

export interface CachedStep {
  title?: string
  description: string
  duration_minutes?: number
}

// Mirrors exactly the `user_recipes` columns the detail page renders (see
// src/app/dashboard/my-recipes/[id]/page.tsx) — this is a read-only offline copy, not a
// second source of truth, so it only needs what the offline view displays.
export interface CachedRecipe {
  id: string
  title: string
  description: string | null
  category: string | null
  difficulty: string | null
  prep_time_minutes: number | null
  bake_time_minutes: number | null
  tags: string[]
  notes: string | null
  ingredients: CachedIngredient[]
  steps: CachedStep[]
  created_at: string
  updated_at: string
  cached_at: number // epoch ms — when this copy was written, for future staleness handling
}

type RecipeCacheDB = Dexie & {
  recipes: EntityTable<CachedRecipe, 'id'>
}

let db: RecipeCacheDB | null = null

// Lazily constructed: importing Dexie is safe on the server (it no-ops without indexedDB),
// but opening a database is not something we want to attempt outside a browser tab.
function getDB(): RecipeCacheDB {
  if (!db) {
    db = new Dexie('byl-offline') as RecipeCacheDB
    db.version(1).stores({ recipes: 'id' })
  }
  return db
}

function canUseIndexedDB(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined'
}

// Reads/writes are wrapped in try/catch, same posture as step-timer.ts's localStorage
// wrapper — private browsing and storage-quota errors shouldn't break the page that's
// trying to cache a recipe for later.
export async function cacheRecipe(recipe: Omit<CachedRecipe, 'cached_at'>): Promise<void> {
  if (!canUseIndexedDB()) return
  try {
    await getDB().recipes.put({ ...recipe, cached_at: Date.now() })
  } catch {
    // ignore — the page the user is looking at still works without offline caching
  }
}

export async function getCachedRecipe(id: string): Promise<CachedRecipe | undefined> {
  if (!canUseIndexedDB()) return undefined
  try {
    return await getDB().recipes.get(id)
  } catch {
    return undefined
  }
}
