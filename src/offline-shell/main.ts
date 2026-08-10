import { getCachedRecipe } from '../lib/recipe-cache'
import { parseRecipeIdFromPath, pickLocale } from './url'
import { OFFLINE_STRINGS } from './strings'
import { renderNotCachedHtml, renderRecipeHtml } from './render-recipe'
import { mountStepTimers } from './timer'

async function main(): Promise<void> {
  const root = document.getElementById('offline-recipe-root')
  if (!root) return

  const locale = pickLocale(document.cookie)
  document.documentElement.lang = locale
  const strings = OFFLINE_STRINGS[locale]

  const recipeId = parseRecipeIdFromPath(location.pathname)
  if (!recipeId) return

  const recipe = await getCachedRecipe(recipeId)

  if (!recipe) {
    root.innerHTML = renderNotCachedHtml(strings)
    return
  }

  root.innerHTML = renderRecipeHtml(recipe, strings)
  mountStepTimers(root, recipe.id, strings)
}

main()
