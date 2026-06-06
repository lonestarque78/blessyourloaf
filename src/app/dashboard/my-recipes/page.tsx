import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyRecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipes } = await supabase
    .from('user_recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const categoryLabels: Record<string, string> = {
    loaf: 'Loaf',
    discard: 'Discard',
    rolls: 'Rolls',
    focaccia: 'Flatbread',
    other: 'Other',
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-50 text-green-700',
    intermediate: 'bg-amber-50 text-amber-700',
    advanced: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/dashboard" className="font-lora text-sm text-[#b07d62] hover:underline mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">My Recipes</h1>
          <p className="font-lora italic text-[#9a7060] mt-1">
            Your personal recipe box, sugar.
          </p>
        </div>
        <Link href="/dashboard/my-recipes/new"
          className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          + Add Recipe
        </Link>
      </div>

      {recipes && recipes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {recipes.map(recipe => (
            <Link key={recipe.id} href={`/dashboard/my-recipes/${recipe.id}`}
              className="bg-white rounded-2xl p-5 shadow-md border border-[#f0e4db] hover:-translate-y-1 transition-transform block">
              <div className="flex items-start justify-between mb-2">
                <div className="font-playfair text-lg font-bold text-[#3d2b1f] pr-4">{recipe.title}</div>
                {recipe.source_recipe_id && (
                  <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2 py-0.5 rounded-full flex-shrink-0">
                    Adapted
                  </span>
                )}
              </div>

              {recipe.description && (
                <p className="font-lora italic text-xs text-[#9a7060] leading-relaxed line-clamp-2 mb-3">
                  {recipe.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {recipe.category && (
                  <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2.5 py-1 rounded-full">
                    {categoryLabels[recipe.category] || recipe.category}
                  </span>
                )}
                {recipe.difficulty && (
                  <span className={`font-lora text-xs px-2.5 py-1 rounded-full capitalize ${difficultyColors[recipe.difficulty] || ''}`}>
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.prep_time_minutes && recipe.bake_time_minutes && (
                  <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-2.5 py-1 rounded-full">
                    ⏱ {recipe.prep_time_minutes + recipe.bake_time_minutes} min
                  </span>
                )}
              </div>

              <div className="font-lora text-xs text-[#b8896e]">
                Added {new Date(recipe.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📖</div>
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-3">No recipes yet, darlin'</h2>
          <p className="font-lora italic text-[#9a7060] mb-8 max-w-sm mx-auto">
            "Every great baker has their secrets. Start savin' yours."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/my-recipes/new"
              className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora hover:-translate-y-0.5 transition-transform shadow-md">
              Create My First Recipe
            </Link>
            <Link href="/recipes"
              className="inline-block border border-[#c9956c] text-[#7a4f3a] px-8 py-3 rounded-full font-lora hover:bg-[#c9956c] hover:text-white transition-all">
              Browse the Library
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}