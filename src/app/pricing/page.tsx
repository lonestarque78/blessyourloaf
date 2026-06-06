import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PricingCards from '@/components/pricing/PricingCards'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('subscription_status, subscription_tier')
    .eq('id', user.id)
    .single() : { data: null }

  const isSubscriber = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Join the Kitchen ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            Good bread don't cost much, sugar.
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            "Start free and bake your first loaf. Upgrade when you're ready for the full kitchen."
          </p>
        </div>

        <PricingCards
          isSubscriber={isSubscriber}
          isLoggedIn={!!user}
          monthlyPriceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!}
          annualPriceId={process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!}
        />

        {/* Feature comparison */}
        <div className="mt-20 bg-white rounded-2xl shadow-md border border-[#f0e4db] overflow-hidden">
          <div className="p-6 border-b border-[#f0e4db]">
            <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f]">What's included</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9ede5]">
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-6 py-4">Feature</th>
                  <th className="text-center font-lora text-xs uppercase tracking-widest text-[#b8896e] px-6 py-4">Free</th>
                  <th className="text-center font-lora text-xs uppercase tracking-widest text-[#b8896e] px-6 py-4">Subscriber</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Starter Journal', free: true, paid: true },
                  { feature: 'Feeding Log', free: true, paid: true },
                  { feature: 'Free Recipes (2)', free: true, paid: true },
                  { feature: 'Flour Guide', free: true, paid: true },
                  { feature: 'Full Recipe Library (20+)', free: false, paid: true },
                  { feature: 'Discard Vault', free: false, paid: true },
                  { feature: 'Bake Scheduler (AI-powered)', free: false, paid: true },
                  { feature: 'Starter Troubleshooter (AI)', free: false, paid: true },
                  { feature: 'Bake History', free: false, paid: true },
                  { feature: 'Personal Recipe Box', free: false, paid: true },
                  { feature: 'New recipes added regularly', free: false, paid: true },
                ].map(({ feature, free, paid }, i) => (
                  <tr key={feature} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdf6f0]'}>
                    <td className="font-lora text-sm text-[#3d2b1f] px-6 py-3">{feature}</td>
                    <td className="text-center px-6 py-3">
                      {free
                        ? <span className="text-green-600 font-bold">✓</span>
                        : <span className="text-[#d4b8a8]">—</span>}
                    </td>
                    <td className="text-center px-6 py-3">
                      {paid
                        ? <span className="text-green-600 font-bold">✓</span>
                        : <span className="text-[#d4b8a8]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="font-lora italic text-sm text-[#9a7060]">
            Cancel anytime. No contracts. No funny business, honey.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}