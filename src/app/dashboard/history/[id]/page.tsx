import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { BAKE_PHASE_ICONS, normalizeBakePhase } from '@/lib/bake-timer'
import { getTranslations, getLocale } from 'next-intl/server'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const t = await getTranslations('Bake.historyDetail')
  const tPhases = await getTranslations('Bake.phases')
  const locale = (await getLocale()) as Locale

  const { data: schedule } = await supabase
    .from('bake_schedules')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!schedule) notFound()

  const steps = schedule.steps as Array<{ time: string; action: string; duration: string; note: string; phase?: string }>

  async function markComplete() {
    'use server'
    const supabase = await createClient()
    await supabase
      .from('bake_schedules')
      .update({ completed: true })
      .eq('id', id)
    redirect(`/dashboard/history/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/dashboard/history" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        {t('backToHistory')}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-1">
              {schedule.recipe_name || t('defaultRecipeName')}
            </h1>
            <div className="font-lora text-xs text-[#9a7060]">
              {t('savedOn', {
                date: new Date(schedule.created_at).toLocaleDateString(INTL_LOCALE[locale], {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                }),
              })}
            </div>
          </div>
          <span className={`font-lora text-xs px-3 py-1.5 rounded-full ${
            schedule.completed
              ? 'bg-green-50 text-green-700'
              : 'bg-[#f9ede5] text-[#b07d62]'
          }`}>
            {schedule.completed ? t('completed') : t('inProgress')}
          </span>
        </div>

        {schedule.target_ready_at && (
          <div className="mt-5 flex items-center gap-2">
            <span className="font-lora text-xs uppercase tracking-widest text-[#b8896e]">{t('targetReady')}</span>
            <span className="font-lora text-sm text-[#3d2b1f]">
              {new Date(schedule.target_ready_at).toLocaleDateString(INTL_LOCALE[locale], {
                weekday: 'long', month: 'long', day: 'numeric',
                hour: 'numeric', minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {!schedule.completed && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/dashboard/bake/${id}`}
              className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
              {t('startCoach')}
            </Link>
            <form action={markComplete}>
              <button type="submit"
                className="border border-[#c9956c] text-[#b07d62] px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform">
                {t('markCompleted')}
              </button>
            </form>
          </div>
        )}

        <div className="mt-3">
          <Link
            href={`/dashboard/my-recipes/new?title=${encodeURIComponent(schedule.recipe_name || t('defaultRecipeName'))}`}
            className="inline-block border border-[#c9956c] text-[#b07d62] px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform">
            {t('saveToMyRecipes')}
          </Link>
        </div>

        {schedule.completed && (
          <div className="mt-6 bg-green-50 rounded-xl p-4 font-lora italic text-sm text-green-700">
            {t('completedBanner')}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
        <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-6">{t('timelineTitle')}</h2>

        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#c9956c] to-[#b5838d]" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  index === steps.length - 1
                    ? 'bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white text-sm'
                    : 'bg-white border-2 border-[#c9956c] text-[#c9956c] text-xs font-bold'
                }`}>
                  {index === steps.length - 1 ? '🍞' : index + 1}
                </div>
                <div className="flex-1 pb-2">
                  <div className="font-lora text-xs text-[#b07d62] tracking-wide mb-1">{step.time}</div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <div className="font-playfair font-bold text-[#3d2b1f]">{step.action}</div>
                    <span className="font-lora text-xs uppercase tracking-wide text-[#b07d62] bg-[#f9ede5] px-2 py-0.5 rounded-full">
                      {BAKE_PHASE_ICONS[normalizeBakePhase(step.phase)]} {tPhases(normalizeBakePhase(step.phase))}
                    </span>
                    <span className="font-lora text-xs text-[#9a7060] bg-[#f9ede5] px-2 py-0.5 rounded-full">
                      {step.duration}
                    </span>
                  </div>
                  <p className="font-lora italic text-sm text-[#7a4f3a]">&quot;{step.note}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
