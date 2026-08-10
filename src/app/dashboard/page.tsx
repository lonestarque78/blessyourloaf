import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('Dashboard')
  const locale = (await getLocale()) as Locale

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-3">{t('signInPrompt.title')}</h1>
        <p className="font-lora text-[#9a7060] mb-6">{t('signInPrompt.subtitle')}</p>
        <Link href="/login" className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm">
          {t('signInPrompt.cta')}
        </Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const { data: starters } = await supabase
    .from('starters')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const firstName = profile?.full_name?.split(' ')[0] || t('greeting.bakerFallback')
  const activeStarters = starters ?? []
  const hasStarter = activeStarters.length > 0
  const primaryStarter = activeStarters[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greeting.morning') : hour < 17 ? t('greeting.afternoon') : t('greeting.evening')

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">
          {t('greeting.greetingName', { greeting, name: firstName })}
        </h1>
        <p className="font-lora italic text-[#9a7060] mt-2">
          {hasStarter
            ? t('greeting.waitingOnYou', { name: primaryStarter.name })
            : t('greeting.getStarted')}
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Starter Journal */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f9ede5] flex items-center justify-center text-xl">🫙</div>
              <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{t('starterJournal.title')}</div>
            </div>
            {hasStarter && (
              <span className="font-lora text-xs text-[#b07d62] bg-[#f9ede5] px-3 py-1 rounded-full">
                {t('starterJournal.activeCount', { count: activeStarters.length })}
              </span>
            )}
          </div>

          {hasStarter ? (
            <div>
              {activeStarters.slice(0, 2).map(starter => (
                <div key={starter.id} className="flex items-center justify-between py-3 border-b border-[#f0e4db] last:border-0">
                  <div>
                    <div className="font-playfair font-bold text-[#3d2b1f]">{starter.name}</div>
                    <div className="font-lora text-xs text-[#9a7060]">
                      {t('starterJournal.born', {
                        date: new Date(starter.born_at).toLocaleDateString(INTL_LOCALE[locale], { month: 'long', day: 'numeric' }),
                      })}
                    </div>
                  </div>
                  <Link href={`/dashboard/starters/${starter.id}`}
                    className="font-lora text-xs text-[#b07d62] hover:underline">
                    {t('starterJournal.view')}
                  </Link>
                </div>
              ))}
              <Link href="/dashboard/starters"
                className="block text-center mt-4 font-lora text-sm text-[#b07d62] hover:underline">
                {t('starterJournal.manageAll')}
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-lora italic text-[#9a7060] mb-4">
                {t('starterJournal.emptyQuote')}
              </p>
              <Link href="/dashboard/starters/new"
                className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
                {t('starterJournal.createFirst')}
              </Link>
            </div>
          )}
        </div>

        {/* Bake Scheduler */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#f0e8f0] flex items-center justify-center text-xl">📅</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{t('scheduler.title')}</div>
          </div>
          <div className="text-center py-6">
            <p className="font-lora italic text-[#9a7060] mb-4">
              {t('scheduler.quote')}
            </p>
            <Link href="/dashboard/scheduler"
              className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
              {t('scheduler.cta')}
            </Link>
          </div>
        </div>

        {/* Recipes */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#fde8e8] flex items-center justify-center text-xl">📖</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{t('recipes.title')}</div>
          </div>
          <p className="font-lora italic text-[#9a7060] text-sm mb-5">
            {t('recipes.desc')}
          </p>
          <Link href="/recipes"
            className="font-lora text-sm text-[#b07d62] hover:underline">
            {t('recipes.cta')}
          </Link>
        </div>

        {/* Discard Vault */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#fef3e2] flex items-center justify-center text-xl">🗄️</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{t('discard.title')}</div>
          </div>
          <p className="font-lora italic text-[#9a7060] text-sm mb-5">
            {t('discard.desc')}
          </p>
          <Link href="/discard"
            className="font-lora text-sm text-[#b07d62] hover:underline">
            {t('discard.cta')}
          </Link>
        </div>
      </div>

      {/* Subscription banner for free users */}
      {profile?.subscription_status !== 'active' && profile?.subscription_status !== 'trialing' && (
        <div className="rounded-2xl p-7 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <p className="font-playfair text-xl font-bold text-white mb-2">
            {t('subscriptionBanner.title')}
          </p>
          <p className="font-lora italic text-[#c9a090] text-sm mb-5">
            {t('subscriptionBanner.desc')}
          </p>
          <Link href="/pricing"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
            {t('subscriptionBanner.cta')}
          </Link>
        </div>
      )}
    </div>
  )
}
