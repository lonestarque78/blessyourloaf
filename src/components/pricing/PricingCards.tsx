'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  isSubscriber: boolean
  isLoggedIn: boolean
  monthlyPriceId: string
  annualPriceId: string
}

export default function PricingCards({ isSubscriber, isLoggedIn, monthlyPriceId, annualPriceId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError] = useState('')

  const handleCheckout = async (priceId: string, plan: 'monthly' | 'annual') => {
    if (!isLoggedIn) {
      router.push('/signup?next=/pricing')
      return
    }

    setLoading(plan)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong, sugar. Try again in a moment.')
        setLoading(null)
      }
    } catch {
      setError('Something went wrong, sugar. Try again in a moment.')
      setLoading(null)
    }
  }

  if (isSubscriber) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-[#f0e4db]">
        <div className="text-5xl mb-4">🍞</div>
        <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-2">
          You're already in the kitchen, darlin'!
        </h2>
        <p className="font-lora italic text-[#9a7060] mb-6">
          You have full access to everything Bless Your Loaf has to offer.
        </p>
        <Link href="/dashboard"
          className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          Go to Dashboard →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-8 font-lora text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch">
        {/* Free */}
        <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm w-full">
          <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Free Forever</div>
          <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">$0</div>
          <p className="font-lora italic text-[#9a7060] text-sm mb-8">Dip your toe in the dough</p>
          {['Starter Journal', 'Feeding Log', '2 free recipes', 'Flour Guide'].map(f => (
            <div key={f} className="flex gap-3 items-center mb-3">
              <span className="text-[#c9956c]">✓</span>
              <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
            </div>
          ))}
          <Link href={isLoggedIn ? '/dashboard' : '/signup'}
            className="block text-center border border-[#c9956c] text-[#7a4f3a] px-6 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all mt-8">
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
        </div>

        {/* Monthly */}
        <div className="rounded-3xl p-9 flex-1 max-w-sm w-full md:scale-105 shadow-2xl"
          style={{ background: 'linear-gradient(160deg, #3d2b1f, #5c3d2e)', border: '1.5px solid #c9956c' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="font-lora text-xs uppercase tracking-widest text-[#e8b4a0]">Monthly</div>
            <span className="bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white text-xs font-lora px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <div className="font-playfair text-5xl font-black text-white mb-1">
            $5.99<span className="text-xl font-normal">/mo</span>
          </div>
          <p className="font-lora italic text-[#c9a090] text-sm mb-8">Full run of the kitchen</p>
          {['Full recipe library (20+)', 'Starter Journal + feeding log', 'AI Bake Scheduler', 'Full Discard Vault', 'Starter Troubleshooter', 'Personal Recipe Box', 'New recipes regularly'].map(f => (
            <div key={f} className="flex gap-3 items-center mb-3">
              <span className="text-[#c9956c]">✓</span>
              <span className="font-lora text-sm text-[#e8d5c8]">{f}</span>
            </div>
          ))}
          <button
            onClick={() => handleCheckout(monthlyPriceId, 'monthly')}
            disabled={loading !== null}
            className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading === 'monthly' ? 'Loading...' : 'Start 7-Day Free Trial →'}
          </button>
        </div>

        {/* Annual */}
        <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm w-full">
          <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Annual</div>
          <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">
            $55.99<span className="text-xl font-normal">/yr</span>
          </div>
          <div className="inline-block bg-gradient-to-r from-[#e8b4a0] to-[#c9956c] text-white text-xs font-lora px-3 py-1 rounded-full mb-6">
            Save 20% · Best Value
          </div>
          {['Everything in Monthly', 'Priority support', 'Early recipe access', 'Annual baking planner'].map(f => (
            <div key={f} className="flex gap-3 items-center mb-3">
              <span className="text-[#c9956c]">✓</span>
              <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
            </div>
          ))}
          <button
            onClick={() => handleCheckout(annualPriceId, 'annual')}
            disabled={loading !== null}
            className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading === 'annual' ? 'Loading...' : 'Start 7-Day Free Trial →'}
          </button>
        </div>
      </div>
    </div>
  )
}