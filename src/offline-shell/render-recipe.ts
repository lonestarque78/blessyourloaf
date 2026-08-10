import type { CachedRecipe } from '../lib/recipe-cache'
import type { OfflineRecipeStrings } from './strings'

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

function metaCard(label: string, value: string): string {
  return `<div class="meta-card"><div class="meta-label">${escapeHtml(label)}</div><div class="meta-value">${escapeHtml(value)}</div></div>`
}

export function renderNotCachedHtml(strings: OfflineRecipeStrings): string {
  return `
    <div class="offline-empty">
      <div class="offline-empty-emoji">📖</div>
      <h1>${escapeHtml(strings.notCachedTitle)}</h1>
      <p>${escapeHtml(strings.notCachedBody)}</p>
    </div>
  `
}

// Renders the cached recipe as an HTML string rather than building DOM nodes directly —
// keeps this function pure and unit-testable without a DOM, matching how step-timer.ts's
// pure logic is tested separately from StepTimer.tsx's rendering. The `data-step-timer`
// placeholders are wired up to live timers by mountStepTimers() (timer.ts) after this
// markup is inserted into the page.
export function renderRecipeHtml(recipe: CachedRecipe, strings: OfflineRecipeStrings): string {
  const categoryLabel = recipe.category ? strings.categoryLabels[recipe.category] ?? recipe.category : null
  const difficultyLabel = recipe.difficulty ? strings.difficultyLabels[recipe.difficulty] ?? recipe.difficulty : null

  const meta = [
    categoryLabel ? metaCard(strings.category, categoryLabel) : '',
    difficultyLabel ? metaCard(strings.difficulty, difficultyLabel) : '',
    recipe.prep_time_minutes ? metaCard(strings.prep, strings.minutesShort(recipe.prep_time_minutes)) : '',
    recipe.bake_time_minutes ? metaCard(strings.bake, strings.minutesShort(recipe.bake_time_minutes)) : '',
  ].join('')

  const ingredients = recipe.ingredients
    .map(
      (ing) => `
        <li>
          <span class="item">${escapeHtml(ing.item)}</span>
          <span class="amount">${escapeHtml(ing.amount)}</span>
          ${ing.note ? `<span class="note">${escapeHtml(ing.note)}</span>` : ''}
        </li>
      `
    )
    .join('')

  const steps = recipe.steps
    .map(
      (step, i) => `
        <li class="step">
          <div class="step-number">${i + 1}</div>
          <div class="step-body">
            <div class="step-heading">
              ${step.title ? `<h3>${escapeHtml(step.title)}</h3>` : ''}
              ${
                step.duration_minutes
                  ? `<span class="step-timer" data-step-timer data-step-index="${i}" data-duration-minutes="${step.duration_minutes}"></span>`
                  : ''
              }
            </div>
            <p>${escapeHtml(step.description)}</p>
          </div>
        </li>
      `
    )
    .join('')

  return `
    <span class="offline-badge">${escapeHtml(strings.offlineBadge)}</span>
    <h1>${escapeHtml(recipe.title)}</h1>
    ${recipe.description ? `<p class="description">${escapeHtml(recipe.description)}</p>` : ''}
    ${meta ? `<div class="meta">${meta}</div>` : ''}
    ${recipe.ingredients.length ? `<h2>${escapeHtml(strings.whatYoullNeed)}</h2><ul class="ingredients">${ingredients}</ul>` : ''}
    ${recipe.steps.length ? `<h2>${escapeHtml(strings.letsGetBaking)}</h2><ol class="steps">${steps}</ol>` : ''}
    ${recipe.notes ? `<h2>${escapeHtml(strings.myNotes)}</h2><p class="notes">${escapeHtml(recipe.notes)}</p>` : ''}
  `
}
