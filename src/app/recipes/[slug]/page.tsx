import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!recipe) notFound()

  if (recipe.is_premium) {
    if (!user) redirect('/login?next=/recipes/' + slug)

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const isSubscriber = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
    if (!isSubscriber) redirect('/pricing')
  }

  const ingredients = recipe.ingredients as Array<{ item: string; amount: string; note?: string }>
  const steps = recipe.steps as Array<{ title: string; description: string; duration_minutes?: number }>

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <Link href="/recipes" className="font-lora text-sm text-[#b07d62] hover:underline mb-8 block">
          ← Back to Recipes
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            {recipe.is_premium && (
              <span className="font-lora text-xs bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white px-3 py-1 rounded-full">
                Premium
              </span>
            )}
            <span className="font-lora text-xs text-[#b8896e] uppercase tracking-widest capitalize">
              {recipe.category}
            </span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3d2b1f] mb-4">{recipe.title}</h1>
          <p className="font-lora italic text-lg text-[#9a7060] leading-relaxed">{recipe.description}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Prep</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{recipe.prep_time_minutes} min</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Bake</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{recipe.bake_time_minutes} min</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Difficulty</div>
              <div className="font-playfair font-bold text-[#3d2b1f] capitalize">{recipe.difficulty}</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#f0e4db]">
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">Total</div>
              <div className="font-playfair font-bold text-[#3d2b1f]">{recipe.prep_time_minutes + recipe.bake_time_minutes} min</div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
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

        {/* Steps */}
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
                    <h3 className="font-playfair font-bold text-[#3d2b1f]">{step.title}</h3>
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
        {!user && (
          <div className="mt-10 rounded-2xl p-7 text-center"
            style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
            <p className="font-playfair text-xl font-bold text-white mb-2">
              Want all 20 recipes, darlin'? 🍞
            </p>
            <p className="font-lora italic text-[#c9a090] text-sm mb-5">
              Join Bless Your Loaf and get the full library plus the Starter Journal, Bake Scheduler, and more.
            </p>
            <Link href="/signup"
              className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
              Start Free Today →
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}