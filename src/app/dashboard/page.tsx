import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: starters } = await supabase
    .from('starters')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const firstName = profile?.full_name?.split(' ')[0] || 'sugar'
  const hasStarter = starters && starters.length > 0
  const primaryStarter = starters?.[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good mornin' : hour < 17 ? 'Good afternoon' : "Good evenin'"

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">
          {greeting}, {firstName}!
        </h1>
        <p className="font-lora italic text-[#9a7060] mt-2">
          {hasStarter
            ? `${primaryStarter.name} is waitin' on you, darlin'.`
            : "Let's get your kitchen started, sugar."}
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Starter Journal */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f9ede5] flex items-center justify-center text-xl">🫙</div>
              <div className="font-playfair text-lg font-bold text-[#3d2b1f]">Starter Journal</div>
            </div>
            {hasStarter && (
              <span className="font-lora text-xs text-[#b07d62] bg-[#f9ede5] px-3 py-1 rounded-full">
                {starters!.length} active
              </span>
            )}
          </div>

          {hasStarter ? (
            <div>
              {starters!.slice(0, 2).map(starter => (
                <div key={starter.id} className="flex items-center justify-between py-3 border-b border-[#f0e4db] last:border-0">
                  <div>
                    <div className="font-playfair font-bold text-[#3d2b1f]">{starter.name}</div>
                    <div className="font-lora text-xs text-[#9a7060]">
                      Born {new Date(starter.born_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <Link href={`/dashboard/starters/${starter.id}`}
                    className="font-lora text-xs text-[#b07d62] hover:underline">
                    View →
                  </Link>
                </div>
              ))}
              <Link href="/dashboard/starters"
                className="block text-center mt-4 font-lora text-sm text-[#b07d62] hover:underline">
                Manage all starters
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-lora italic text-[#9a7060] mb-4">
                "Every great loaf starts with a starter. Let's name yours, honey."
              </p>
              <Link href="/dashboard/starters/new"
                className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
                Create My First Starter
              </Link>
            </div>
          )}
        </div>

        {/* Bake Scheduler */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#f0e8f0] flex items-center justify-center text-xl">📅</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">Bake Scheduler</div>
          </div>
          <div className="text-center py-6">
            <p className="font-lora italic text-[#9a7060] mb-4">
              "Tell me when you want fresh bread and I'll work it all out for you, darlin'."
            </p>
            <Link href="/dashboard/scheduler"
              className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
              Schedule a Bake
            </Link>
          </div>
        </div>

        {/* Recipes */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#fde8e8] flex items-center justify-center text-xl">📖</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">Recipe Library</div>
          </div>
          <p className="font-lora italic text-[#9a7060] text-sm mb-5">
            Loaves, rolls, focaccia, and more — all tested in a real Southern kitchen.
          </p>
          <Link href="/recipes"
            className="font-lora text-sm text-[#b07d62] hover:underline">
            Browse recipes →
          </Link>
        </div>

        {/* Discard Vault */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#fef3e2] flex items-center justify-center text-xl">🗄️</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">Discard Vault</div>
          </div>
          <p className="font-lora italic text-[#9a7060] text-sm mb-5">
            Don't you dare throw that away. We've got recipes for every bit of discard.
          </p>
          <Link href="/discard"
            className="font-lora text-sm text-[#b07d62] hover:underline">
            Explore discard recipes →
          </Link>
        </div>
      </div>

      {/* Subscription banner for free users */}
      {profile?.subscription_status !== 'active' && profile?.subscription_status !== 'trialing' && (
        <div className="rounded-2xl p-7 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <p className="font-playfair text-xl font-bold text-white mb-2">
            Unlock the full kitchen, darlin' 🍞
          </p>
          <p className="font-lora italic text-[#c9a090] text-sm mb-5">
            Get the full Starter Journal, Bake Scheduler, Discard Vault, and more for $5.99/month.
          </p>
          <Link href="/pricing"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
            Start 7-Day Free Trial →
          </Link>
        </div>
      )}
    </div>
  )
}