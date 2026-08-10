import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import StarterFeedingsSection from '@/components/starters/StarterFeedingsSection'
import { getTranslations, getLocale } from 'next-intl/server'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'

function formatRelativeTime(target: Date, locale: Locale): string {
  const diffHours = (target.getTime() - Date.now()) / (1000 * 60 * 60)
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: 'auto' })
  return Math.abs(diffHours) < 48
    ? rtf.format(Math.round(diffHours), 'hour')
    : rtf.format(Math.round(diffHours / 24), 'day')
}

export default async function StarterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const t = await getTranslations('Starters')
  const locale = (await getLocale()) as Locale

  const { data: starter } = await supabase
    .from('starters')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!starter) notFound()

  const { data: feedings } = await supabase
    .from('feedings')
    .select('*')
    .eq('starter_id', starter.id)
    .order('fed_at', { ascending: false })

  const daysSinceBorn = Math.floor(
    (new Date().getTime() - new Date(starter.born_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Mirrors the "overdue" math in claim_due_feeding_reminders() (supabase/migrations/
  // 202608090003_add_starter_feeding_reminders.sql) purely for display, so a baker can see
  // here why a reminder did or didn't fire without having to check the database.
  const lastFedAt = feedings && feedings.length > 0 ? new Date(feedings[0].fed_at) : new Date(starter.born_at)
  const dueAt = new Date(lastFedAt.getTime() + starter.feeding_interval_hours * 60 * 60 * 1000)
  const isOverdue = new Date().getTime() >= dueAt.getTime()
  const dueRelative = formatRelativeTime(dueAt, locale)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/dashboard/starters" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        {t('detail.backToStarters')}
      </Link>

      {/* Starter header */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">🫙</span>
              <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">{starter.name}</h1>
            </div>
            {starter.nickname && (
              <p className="font-lora italic text-[#9a7060] ml-14">&quot;{starter.nickname}&quot;</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/starters/${id}/edit`}
              className="font-lora text-sm text-[#b07d62] hover:underline">
              {t('detail.edit')}
            </Link>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-lora text-xs ${
              starter.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${starter.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              {starter.is_active ? t('detail.active') : t('detail.resting')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">
          {[
            { label: t('detail.birthday'), value: new Date(starter.born_at).toLocaleDateString(INTL_LOCALE[locale], { month: 'long', day: 'numeric', year: 'numeric' }) },
            { label: t('detail.age'), value: t('detail.ageDays', { days: daysSinceBorn }) },
            { label: t('detail.flour'), value: t.has(`flourTypeLabels.${starter.flour_type}`) ? t(`flourTypeLabels.${starter.flour_type}`) : starter.flour_type },
            { label: t('detail.hydration'), value: `${starter.hydration_percent}%` },
            { label: t('detail.feedsEvery'), value: t.has(`feedingIntervalLabels.${starter.feeding_interval_hours}`) ? t(`feedingIntervalLabels.${starter.feeding_interval_hours}`) : `${starter.feeding_interval_hours}h` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">{label}</div>
              <div className="font-lora text-sm text-[#3d2b1f]">{value}</div>
            </div>
          ))}
        </div>

        {starter.is_active && (
          <div className={`mt-6 rounded-xl p-4 font-lora text-sm ${
            isOverdue ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-[#f9ede5] text-[#7a4f3a]'
          }`}>
            {isOverdue ? `⏰ ${t('detail.feedingOverdue', { when: dueRelative })}` : `🕒 ${t('detail.feedingDueIn', { when: dueRelative })}`}
          </div>
        )}

        {starter.notes && (
          <div className="mt-6 bg-[#f9ede5] rounded-xl p-4 font-lora italic text-sm text-[#7a4f3a]">
            💬 {starter.notes}
          </div>
        )}
      </div>

      {/* Growth tracking + feeding log — share one client-side state so logging a feeding
          updates the chart immediately, without a page reload */}
      <StarterFeedingsSection starterId={starter.id} starterName={starter.name} initialFeedings={feedings || []} />
    </div>
  )
}
