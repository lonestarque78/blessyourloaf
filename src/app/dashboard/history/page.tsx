import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const t = await getTranslations('Bake.history')
  const locale = (await getLocale()) as Locale

  const { data: schedules } = await supabase
    .from('bake_schedules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/dashboard" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        {t('backToDashboard')}
      </Link>

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">{t('title')}</h1>
          <p className="font-lora italic text-[#9a7060] mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/dashboard/scheduler"
          className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          {t('newBake')}
        </Link>
      </div>

      {schedules && schedules.length > 0 ? (
        <div className="space-y-5">
          {schedules.map(schedule => {
            const steps = schedule.steps as Array<{ time: string; action: string; duration: string; note: string }>
            const firstStep = steps?.[0]
            const lastStep = steps?.[steps.length - 1]

            return (
              <div key={schedule.id} className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-playfair text-xl font-bold text-[#3d2b1f]">
                      {schedule.recipe_name || t('defaultRecipeName')}
                    </div>
                    <div className="font-lora text-xs text-[#9a7060] mt-1">
                      {t('savedOn', {
                        date: new Date(schedule.created_at).toLocaleDateString(INTL_LOCALE[locale], {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                        }),
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-lora text-xs px-3 py-1 rounded-full ${
                      schedule.completed
                        ? 'bg-green-50 text-green-700'
                        : 'bg-[#f9ede5] text-[#b07d62]'
                    }`}>
                      {schedule.completed ? t('completed') : t('inProgress')}
                    </span>
                  </div>
                </div>

                {schedule.target_ready_at && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('target')}</span>
                    <span className="font-lora text-sm text-[#3d2b1f]">
                      {new Date(schedule.target_ready_at).toLocaleDateString(INTL_LOCALE[locale], {
                        weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {steps && steps.length > 0 && (
                  <div className="bg-[#f9ede5] rounded-xl p-4 mb-4">
                    <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">
                      {t('stepsCount', { count: steps.length })}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="font-lora text-sm text-[#3d2b1f]">
                        <span className="text-[#b07d62]">{t('start')}</span> {firstStep?.action}
                      </div>
                      <div className="font-lora text-sm text-[#3d2b1f]">
                        <span className="text-[#b07d62]">{t('finish')}</span> {lastStep?.action}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/history/${schedule.id}`}
                    className="font-lora text-sm text-[#b07d62] hover:underline">
                    {t('viewFullSchedule')}
                  </Link>
                  {!schedule.completed && (
                    <>
                      <span className="text-[#e8d5c8]">·</span>
                      <Link href={`/dashboard/bake/${schedule.id}`}
                        className="font-lora text-sm text-[#b07d62] hover:underline">
                        {t('startCoach')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-3">{t('emptyTitle')}</h2>
          <p className="font-lora italic text-[#9a7060] mb-8 max-w-sm mx-auto">
            {t('emptyQuote')}
          </p>
          <Link href="/dashboard/scheduler"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora hover:-translate-y-0.5 transition-transform shadow-md">
            {t('scheduleFirst')}
          </Link>
        </div>
      )}
    </div>
  )
}
