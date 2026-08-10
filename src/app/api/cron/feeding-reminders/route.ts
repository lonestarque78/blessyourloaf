import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushToSubscriptions, type PushSubscriptionRow } from '@/lib/push-notifications'
import { feedingReminderCopy } from '@/lib/feeding-reminder-copy'
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/i18n/locale'

// Vercel Cron (see vercel.json) hits this route on a schedule and sends
// `Authorization: Bearer $CRON_SECRET` — that's the only caller this should ever accept.
// Read directly from process.env rather than src/lib/env.ts's zod schema, matching how
// VAPID_* is handled in push-notifications.ts: this route is the only thing that needs it,
// so it shouldn't be a hard requirement for every other build/test in CI.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

interface DueStarter {
  starter_id: string
  user_id: string
  starter_name: string
}

type SubscriptionWithLocale = PushSubscriptionRow & { locale: string }

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Atomically finds starters overdue for feeding AND marks them reminded, in one
  // statement (see the migration for why this is what makes a doubled/overlapping job run
  // safe) — so nothing below this line needs its own dedupe logic.
  const { data: due, error } = await supabase.rpc('claim_due_feeding_reminders')

  if (error) {
    console.error('[cron/feeding-reminders] failed to claim due reminders', error)
    return NextResponse.json({ error: 'Failed to query due reminders' }, { status: 500 })
  }

  const dueStarters = (due ?? []) as DueStarter[]
  const subscriptionsByUser = new Map<string, SubscriptionWithLocale[]>()

  let notified = 0
  let sent = 0
  let failed = 0

  for (const starter of dueStarters) {
    let subscriptions = subscriptionsByUser.get(starter.user_id)
    if (!subscriptions) {
      const { data, error: subError } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth_key, locale')
        .eq('user_id', starter.user_id)

      if (subError) {
        console.error('[cron/feeding-reminders] failed to load subscriptions for user', starter.user_id, subError)
        continue
      }
      subscriptions = data ?? []
      subscriptionsByUser.set(starter.user_id, subscriptions)
    }

    if (subscriptions.length === 0) continue
    notified += 1

    const byLocale = new Map<Locale, PushSubscriptionRow[]>()
    for (const sub of subscriptions) {
      const locale = isSupportedLocale(sub.locale) ? sub.locale : DEFAULT_LOCALE
      const group = byLocale.get(locale) ?? []
      group.push({ id: sub.id, endpoint: sub.endpoint, p256dh: sub.p256dh, auth_key: sub.auth_key })
      byLocale.set(locale, group)
    }

    for (const [locale, subs] of byLocale) {
      const { title, body } = feedingReminderCopy(locale, starter.starter_name)
      const summary = await sendPushToSubscriptions(supabase, subs, {
        title,
        body,
        url: `/dashboard/starters/${starter.starter_id}`,
      })
      sent += summary.sent
      failed += summary.failed
    }
  }

  return NextResponse.json({
    success: true,
    dueCount: dueStarters.length,
    notified,
    sent,
    failed,
  })
}
