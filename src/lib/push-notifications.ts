import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) {
    throw new Error('VAPID keys are not configured — set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT')
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export interface PushSendSummary {
  sent: number
  removed: number
  failed: number
}

export interface PushSubscriptionRow {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
}

// Sends `payload` to a specific set of subscriptions. This is the primitive both
// sendPushToUser (part 1 — the "send a test notification" button) and the feeding-reminder
// cron job (part 2) build on; the cron job needs it directly because it groups a user's
// subscriptions by locale and sends different payload text to each group.
//
// A subscription the push service reports as gone (404/410 — the browser unsubscribed, or
// the endpoint expired) is deleted so it isn't retried forever; any other failure is just
// counted, since it may be transient.
export async function sendPushToSubscriptions(
  supabase: SupabaseClient,
  subscriptions: PushSubscriptionRow[],
  payload: PushPayload
): Promise<PushSendSummary> {
  configureVapid()

  const summary: PushSendSummary = { sent: 0, removed: 0, failed: 0 }

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
          },
          JSON.stringify(payload)
        )
        summary.sent += 1
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', subscription.id)
          summary.removed += 1
        } else {
          console.error('[push-notifications] failed to send to subscription', subscription.id, err)
          summary.failed += 1
        }
      }
    })
  )

  return summary
}

// Sends `payload` to every push subscription on file for `userId`, regardless of locale.
export async function sendPushToUser(
  supabase: SupabaseClient,
  userId: string,
  payload: PushPayload
): Promise<PushSendSummary> {
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth_key')
    .eq('user_id', userId)

  if (error) throw error

  return sendPushToSubscriptions(supabase, subscriptions ?? [], payload)
}
