import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MyRecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipe } = await supabase
    .from('user_recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) notFound()

  const ingredients = recipe.ingredients as Array<{ item: string; amount: string; note?: string }> || []
  const steps = recipe.steps as Array<{ title: string; description: string; duration_minutes?: number }> || []

  const categoryLabels: Record<string, string> = {
    loaf: 'Loaf', discard: 'Discard', rolls: 'Rolls', focaccia: 'Flatbread', other: 'Other',
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-50 text-green-700',
    intermediate: 'bg-amber-50 text-amber-700',
    advanced: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/dashboard/my-recipes" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to My Recipes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] pr-4">{recipe.title}</h1>
          <Link href={`/dashboard/my-recipes/${id}/edit`}
            className="font-lora text-sm text-[#b07d62] hover:underline flex-shrink-0">
            Edit
          </Link>
        </div>

        {recipe.description && (
          <p className="font-lora italic text-[#9a7060] mb-5 leading-relaxed">{recipe.description}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {recipe.category && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Category</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{categoryLabels[recipe.category] || recipe.category}</div>
            </div>
          )}
          {recipe.difficulty && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Difficulty</div>
              <div className={`font-playfair font-bold capitalize ${difficultyColors[recipe.difficulty]?.split(' ')[1] || 'text-[#3d2b1f]'}`}>
                {recipe.difficulty}
              </div>
            </div>
          )}
          {recipe.prep_time_minutes && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Prep</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{recipe.prep_time_minutes} min</div>
            </div>
          )}
          {recipe.bake_time_minutes && (
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Bake</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{recipe.bake_time_minutes} min</div>
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
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-5">What You'll Need, Sugar</h2>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-4 py-2 border-b border-[#f9ede5] last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#c9956c] mt-2 flex-shrink-0" />
                <div className="flex-1 flex items-baseline justify-between gap-4">
                  <span className="font-lora text-[#3d2b1f]">{ing.item}</span>
                  <span className="font-lora text-sm text-[#b07d62] flex-shrink-0">{ing.amount}</span>
                </div>
                {ing.note && (
                  <span className="font-lora text-xs italic text-[#9a7060]">{ing.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-8">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-6">Let's Get Bakin', Darlin'</h2>
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
                      <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2.5 py-1 rounded-full">
                        {step.duration_minutes} min
                      </span>
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
          <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-3">My Notes</h2>
          <p className="font-lora italic text-sm text-[#7a4f3a] leading-relaxed">{recipe.notes}</p>
        </div>
      )}

      <div className="font-lora text-xs text-[#b8896e] text-center">
        Added {new Date(recipe.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        {recipe.updated_at !== recipe.created_at && (
          <> · Updated {new Date(recipe.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
        )}
      </div>
    </div>
  )
}