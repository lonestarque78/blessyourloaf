import Link from 'next/link'
import IngredientsList from '@/components/recipes/IngredientsList'
import type { getTranslations } from 'next-intl/server'
import { buildRecipeJsonLd } from '@/lib/recipe-schema'

interface Recipe {
  category: string
  title: string
  description: string | null
  is_premium: boolean
  difficulty: string
  prep_time_minutes: number
  bake_time_minutes: number
  ingredients: unknown
  steps: unknown
  tags: string[] | null
  image_url?: string | null
  created_at?: string | null
}

// Shared presentational body for src/app/[locale]/recipes/[slug]/page.tsx's two render
// paths (static free-recipe path and dynamic premium-recipe path) — kept as one component
// so the two paths can't silently drift apart. That includes the Recipe JSON-LD below: both
// paths get it automatically because it's rendered from here, not duplicated per-path in
// page.tsx.
export default function RecipeDetailView({
  recipe,
  t,
  showCta,
  canonicalUrl,
}: {
  recipe: Recipe
  t: Awaited<ReturnType<typeof getTranslations<'Recipes'>>>
  showCta: boolean
  canonicalUrl: string
}) {
  const ingredients = recipe.ingredients as Array<{ item: string; amount: string; note?: string }>
  const steps = recipe.steps as Array<{ title: string; description: string; duration_minutes?: number }>
  // </script>-safe: a recipe title/description/step could in principle contain the literal
  // substring "</script>" (nothing currently prevents it at the data layer), which would
  // otherwise break out of this script tag and inject arbitrary HTML into the page.
  const jsonLd = JSON.stringify(buildRecipeJsonLd(recipe, canonicalUrl)).replace(/</g, '\\u003c')

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Link href="/recipes" className="font-lora text-sm text-[#b07d62] hover:underline mb-8 block">
        {t('detail.backToRecipes')}
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          {recipe.is_premium && (
            <span className="font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white px-3 py-1 rounded-full">
              {t('detail.premium')}
            </span>
          )}
          <span className="font-lora text-xs text-[#b8896e] uppercase tracking-widest capitalize">
            {t.has(`categoryLabels.${recipe.category}`) ? t(`categoryLabels.${recipe.category}`) : recipe.category}
          </span>
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3d2b1f] mb-4">{recipe.title}</h1>
        <p className="font-lora italic text-lg text-[#9a7060] leading-relaxed">{recipe.description}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.prep')}</div>
            <div className="font-playfair font-bold text-[#3d2b1f]">{t('detail.minutesShort', { count: recipe.prep_time_minutes })}</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.bake')}</div>
            <div className="font-playfair font-bold text-[#3d2b1f]">{t('detail.minutesShort', { count: recipe.bake_time_minutes })}</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.difficulty')}</div>
            <div className="font-playfair font-bold text-[#3d2b1f] capitalize">
              {t.has(`difficultyLabels.${recipe.difficulty}`) ? t(`difficultyLabels.${recipe.difficulty}`) : recipe.difficulty}
            </div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.total')}</div>
            <div className="font-playfair font-bold text-[#3d2b1f]">{t('detail.minutesShort', { count: recipe.prep_time_minutes + recipe.bake_time_minutes })}</div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-8">
        <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-5">{t('detail.whatYoullNeed')}</h2>
        <IngredientsList ingredients={ingredients} />
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-8">
        <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-6">{t('detail.letsGetBaking')}</h2>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white flex items-center justify-center font-playfair font-bold text-sm flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-playfair font-bold text-[#3d2b1f]">{step.title}</h3>
                  {step.duration_minutes && (
                    <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2.5 py-1 rounded-full">
                      {t('detail.minutesShort', { count: step.duration_minutes })}
                    </span>
                  )}
                </div>
                <p className="font-lora text-sm text-[#6b4c3b] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag: string) => (
            <span key={tag} className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-3 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA for non subscribers */}
      {showCta && (
        <div className="mt-10 rounded-2xl p-7 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <p className="font-playfair text-xl font-bold text-white mb-2">
            {t('detail.ctaTitle')}
          </p>
          <p className="font-lora italic text-[#c9a090] text-sm mb-5">
            {t('detail.ctaBody')}
          </p>
          <Link href="/signup"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
            {t('detail.ctaButton')}
          </Link>
        </div>
      )}
    </div>
  )
}
