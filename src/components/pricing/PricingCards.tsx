'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Props {
  // Server-rendered defaults. The pricing page is statically rendered (see
  // src/app/[locale]/pricing/page.tsx), so these are always the logged-out view — correct
  // for the vast majority of pricing-page traffic. The effect below refines them
  // client-side for the rare already-logged-in/subscribed visitor.
  isSubscriber: boolean
  isLoggedIn: boolean
  monthlyPriceId: string
  annualPriceId: string
}

export default function PricingCards({ isSubscriber: initialIsSubscriber, isLoggedIn: initialIsLoggedIn, monthlyPriceId, annualPriceId }: Props) {
  const t = useTranslations('Pricing.cards')
  const router = useRouter()
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn)
  const [isSubscriber, setIsSubscriber] = useState(initialIsSubscriber)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active || !user) return
      setIsLoggedIn(true)
      const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
      if (!active) return
      if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') setIsSubscriber(true)
    })
    return () => {
      active = false
    }
  }, [])

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
        setError(t('genericError'))
        setLoading(null)
      }
    } catch {
      setError(t('genericError'))
      setLoading(null)
    }
  }

  if (isSubscriber) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-[#f0e4db]">
        <div className="text-5xl mb-4">🍞</div>
        <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-2">
          {t('alreadySubscribed')}
        </h2>
        <p className="font-lora italic text-[#9a7060] mb-6">
          {t('alreadySubscribedBody')}
        </p>
        <Link href="/dashboard"
          className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          {t('goToDashboard')}
        </Link>
      </div>
    )
  }

  const freeFeatures = t.raw('free.features') as string[]
  const monthlyFeatures = t.raw('monthly.features') as string[]
  const annualFeatures = t.raw('annual.features') as string[]

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
          <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('free.badge')}</div>
          <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">{t('free.price')}</div>
          <p className="font-lora italic text-[#9a7060] text-sm mb-8">{t('free.subtitle')}</p>
          {freeFeatures.map(f => (
            <div key={f} className="flex gap-3 items-center mb-3">
              <span className="text-[#c9956c]">✓</span>
              <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
            </div>
          ))}
          <Link href={isLoggedIn ? '/dashboard' : '/signup'}
            className="block text-center border border-[#c9956c] text-[#7a4f3a] px-6 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all mt-8">
            {isLoggedIn ? t('free.ctaLoggedIn') : t('free.ctaLoggedOut')}
          </Link>
        </div>

        {/* Monthly */}
        <div className="rounded-3xl p-9 flex-1 max-w-sm w-full md:scale-105 shadow-2xl"
          style={{ background: 'linear-gradient(160deg, #3d2b1f, #5c3d2e)', border: '1.5px solid #c9956c' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="font-lora text-xs uppercase tracking-widest text-[#e8b4a0]">{t('monthly.badge')}</div>
            <span className="bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white text-xs font-lora px-3 py-1 rounded-full">
              {t('monthly.mostPopular')}
            </span>
          </div>
          <div className="font-playfair text-5xl font-black text-white mb-1">
            {t('monthly.price')}<span className="text-xl font-normal">{t('monthly.period')}</span>
          </div>
          <p className="font-lora italic text-[#c9a090] text-sm mb-8">{t('monthly.subtitle')}</p>
          {monthlyFeatures.map(f => (
            <div key={f} className="flex gap-3 items-center mb-3">
              <span className="text-[#c9956c]">✓</span>
              <span className="font-lora text-sm text-[#e8d5c8]">{f}</span>
            </div>
          ))}
          <button
            onClick={() => handleCheckout(monthlyPriceId, 'monthly')}
            disabled={loading !== null}
            className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading === 'monthly' ? t('monthly.loading') : t('monthly.cta')}
          </button>
        </div>

        {/* Annual */}
        <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm w-full">
          <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">{t('annual.badge')}</div>
          <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">
            {t('annual.price')}<span className="text-xl font-normal">{t('annual.period')}</span>
          </div>
          <div className="inline-block bg-gradient-to-r from-[#e8b4a0] to-[#c9956c] text-white text-xs font-lora px-3 py-1 rounded-full mb-6">
            {t('annual.saveBadge')}
          </div>
          {annualFeatures.map(f => (
            <div key={f} className="flex gap-3 items-center mb-3">
              <span className="text-[#c9956c]">✓</span>
              <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
            </div>
          ))}
          <button
            onClick={() => handleCheckout(annualPriceId, 'annual')}
            disabled={loading !== null}
            className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading === 'annual' ? t('annual.loading') : t('annual.cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
