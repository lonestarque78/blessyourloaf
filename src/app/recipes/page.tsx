import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const categoryLabels: Record<string, string> = {
  loaf: 'Loaves',
  discard: 'Discard',
  rolls: 'Rolls',
  focaccia: 'Flatbreads',
  other: 'Other',
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
}

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single() : { data: null }

  const isSubscriber = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, slug, description, category, is_premium, difficulty, prep_time_minutes, bake_time_minutes, tags')
    .eq('published', true)
    .order('is_premium', { ascending: true })
    .order('title', { ascending: true })

  const categories = ['loaf', 'discard', 'rolls', 'focaccia', 'other']

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ The Recipe Library ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            Every recipe mama never wrote down.
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            "These are the real ones, sugar. Tested in a Southern kitchen until they were just right."
          </p>
        </div>

        {categories.map(category => {
          const categoryRecipes = recipes?.filter(r => r.category === category) || []
          if (categoryRecipes.length === 0) return null

          return (
            <div key={category} className="mb-16">
              <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-6">
                {categoryLabels[category] || category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryRecipes.map(recipe => {
                  const locked = recipe.is_premium && !isSubscriber

                  return (
                    <div key={recipe.id} className={`bg-white rounded-2xl p-6 shadow-md border border-[#f0e4db] relative ${locked ? 'opacity-90' : 'hover:-translate-y-1 transition-transform'}`}>
                      {recipe.is_premium && (
                        <span className="absolute top-4 right-4 font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white px-2.5 py-1 rounded-full">
                          Premium
                        </span>
                      )}

                      <div className="mb-4">
                        <div className="font-playfair text-lg font-bold text-[#3d2b1f] mb-2 pr-16">{recipe.title}</div>
                        <p className="font-lora italic text-sm text-[#9a7060] leading-relaxed line-clamp-2">{recipe.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className={`font-lora text-xs px-2.5 py-1 rounded-full capitalize ${difficultyColors[recipe.difficulty] || 'bg-gray-50 text-gray-600'}`}>
                          {recipe.difficulty}
                        </span>
                        {recipe.prep_time_minutes && (
                          <span className="font-lora text-xs px-2.5 py-1 rounded-full bg-[#f9ede5] text-[#b07d62]">
                            ⏱ {recipe.prep_time_minutes + (recipe.bake_time_minutes || 0)} min total
                          </span>
                        )}
                      </div>

                      {locked ? (
                        <div className="flex items-center justify-between">
                          <span className="font-lora text-xs text-[#9a7060] italic">Subscribe to unlock</span>
                          <Link href="/pricing"
                            className="font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-4 py-1.5 rounded-full hover:-translate-y-0.5 transition-transform">
                            Unlock →
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/recipes/${recipe.slug}`}
                          className="font-lora text-sm text-[#b07d62] hover:underline">
                          View recipe →
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Footer />
    </div>
  )
}