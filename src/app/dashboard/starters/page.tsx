import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'
import PushNotifications from '@/components/starters/PushNotifications'

export default async function StartersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const t = await getTranslations('Starters')
  const locale = (await getLocale()) as Locale

  const { data: starters } = await supabase
    .from('starters')
    .select('*, feedings(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/dashboard" className="font-lora text-sm text-[#b07d62] hover:underline mb-2 block">
            {t('list.backToDashboard')}
          </Link>
          <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">{t('list.title')}</h1>
          <p className="font-lora italic text-[#9a7060] mt-1">{t('list.subtitle')}</p>
        </div>
        <Link href="/dashboard/starters/new"
          className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          {t('list.newStarter')}
        </Link>
      </div>

      <PushNotifications />

      {starters && starters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {starters.map(starter => (
            <Link key={starter.id} href={`/dashboard/starters/${starter.id}`}
              className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] hover:-translate-y-1 transition-transform block">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-playfair text-2xl font-bold text-[#3d2b1f]">{starter.name}</div>
                  {starter.nickname && (
                    <div className="font-lora italic text-sm text-[#9a7060]">&quot;{starter.nickname}&quot;</div>
                  )}
                </div>
                <span className="text-3xl">🫙</span>
              </div>
              <div className="flex gap-4 mb-4">
                <div>
                  <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('list.born')}</div>
                  <div className="font-lora text-sm text-[#3d2b1f]">
                    {new Date(starter.born_at).toLocaleDateString(INTL_LOCALE[locale], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('list.flour')}</div>
                  <div className="font-lora text-sm text-[#3d2b1f]">
                    {t.has(`flourTypeLabels.${starter.flour_type}`) ? t(`flourTypeLabels.${starter.flour_type}`) : starter.flour_type}
                  </div>
                </div>
                <div>
                  <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('list.hydration')}</div>
                  <div className="font-lora text-sm text-[#3d2b1f]">{starter.hydration_percent}%</div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-lora text-xs ${
                starter.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${starter.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                {starter.is_active ? t('list.active') : t('list.resting')}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🫙</div>
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-3">{t('list.emptyTitle')}</h2>
          <p className="font-lora italic text-[#9a7060] mb-8 max-w-sm mx-auto">
            {t('list.emptyQuote')}
          </p>
          <Link href="/dashboard/starters/new"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora hover:-translate-y-0.5 transition-transform shadow-md">
            {t('list.createFirst')}
          </Link>
        </div>
      )}
    </div>
  )
}
