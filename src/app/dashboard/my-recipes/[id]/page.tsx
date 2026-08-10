import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'
import StepTimer from '@/components/recipes/StepTimer'
import CacheRecipeForOffline from '@/components/recipes/CacheRecipeForOffline'
import IngredientsList from '@/components/recipes/IngredientsList'

export default async function MyRecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const t = await getTranslations('MyRecipes')
  const locale = (await getLocale()) as Locale

  const { data: recipe } = await supabase
    .from('user_recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) notFound()

  const ingredients = recipe.ingredients as Array<{ item: string; amount: string; note?: string }> || []
  const steps = recipe.steps as Array<{ title: string; description: string; duration_minutes?: number }> || []

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-50 text-green-700',
    intermediate: 'bg-amber-50 text-amber-700',
    advanced: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <CacheRecipeForOffline
        recipe={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          difficulty: recipe.difficulty,
          prep_time_minutes: recipe.prep_time_minutes,
          bake_time_minutes: recipe.bake_time_minutes,
          tags: recipe.tags || [],
          notes: recipe.notes,
          ingredients,
          steps,
          created_at: recipe.created_at,
          updated_at: recipe.updated_at,
        }}
      />
      <Link href="/dashboard/my-recipes" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        {t('detail.backToMyRecipes')}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] pr-4">{recipe.title}</h1>
          <Link href={`/dashboard/my-recipes/${id}/edit`}
            className="font-lora text-sm text-[#b07d62] hover:underline flex-shrink-0">
            {t('detail.edit')}
          </Link>
        </div>

        {recipe.description && (
          <p className="font-lora italic text-[#9a7060] mb-5 leading-relaxed">{recipe.description}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {recipe.category && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.category')}</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">
                {t.has(`categoryLabels.${recipe.category}`) ? t(`categoryLabels.${recipe.category}`) : recipe.category}
              </div>
            </div>
          )}
          {recipe.difficulty && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.difficulty')}</div>
              <div className={`font-playfair font-bold capitalize ${difficultyColors[recipe.difficulty]?.split(' ')[1] || 'text-[#3d2b1f]'}`}>
                {t.has(`difficultyLabels.${recipe.difficulty}`) ? t(`difficultyLabels.${recipe.difficulty}`) : recipe.difficulty}
              </div>
            </div>
          )}
          {recipe.prep_time_minutes && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.prep')}</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{t('detail.minutesShort', { count: recipe.prep_time_minutes })}</div>
            </div>
          )}
          {recipe.bake_time_minutes && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('detail.bake')}</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{t('detail.minutesShort', { count: recipe.bake_time_minutes })}</div>
            </div>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.tags.map((tag: string) => (
              <span key={tag} className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-8">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-5">{t('detail.whatYoullNeed')}</h2>
          <IngredientsList ingredients={ingredients} />
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
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
                    {step.title && <h3 className="font-playfair font-bold text-[#3d2b1f]">{step.title}</h3>}
                    {step.duration_minutes && (
                      <StepTimer recipeId={id} stepIndex={i} durationMinutes={step.duration_minutes} />
                    )}
                  </div>
                  <p className="font-lora text-sm text-[#6b4c3b] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {recipe.notes && (
        <div className="bg-[#f9ede5] rounded-2xl p-7 mb-8">
          <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-3">{t('detail.myNotes')}</h2>
          <p className="font-lora italic text-sm text-[#7a4f3a] leading-relaxed">{recipe.notes}</p>
        </div>
      )}

      <div className="font-lora text-xs text-[#b8896e] text-center">
        {t('detail.addedOn', { date: new Date(recipe.created_at).toLocaleDateString(INTL_LOCALE[locale], { month: 'long', day: 'numeric', year: 'numeric' }) })}
        {recipe.updated_at !== recipe.created_at && (
          t('detail.updatedOn', { date: new Date(recipe.updated_at).toLocaleDateString(INTL_LOCALE[locale], { month: 'long', day: 'numeric', year: 'numeric' }) })
        )}
      </div>
    </div>
  )
}
