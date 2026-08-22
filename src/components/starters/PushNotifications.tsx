'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, useTranslations } from 'next-intl'

// Web Push requires the VAPID public key as a Uint8Array, but env vars only give us the
// base64url string web-push's generator prints — this is the standard conversion.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// The service worker registers asynchronously (and is disabled entirely outside production
// builds — see SerwistProvider in src/app/layout.tsx), so `navigator.serviceWorker.ready`
// can hang forever in dev. Bound the wait so "Enable" fails with a message instead of
// spinning forever.
function getReadyRegistration(timeoutMs = 8000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('service worker not ready')), timeoutMs)),
  ])
}

type Support = 'checking' | 'supported' | 'unsupported'

export default function PushNotifications() {
  const t = useTranslations('Starters.notifications')
  const locale = useLocale()
  const supabase = createClient()

  const [support, setSupport] = useState<Support>('checking')
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [testResult, setTestResult] = useState('')

  useEffect(() => {
    let cancelled = false

    async function checkStatus() {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        if (!cancelled) setSupport('unsupported')
        return
      }

      if (!cancelled) {
        setSupport('supported')
        setPermission(Notification.permission)
      }

      try {
        // getRegistration() resolves immediately even if no service worker is registered
        // yet (unlike `.ready`, which would hang) — safe to call on every page load.
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        if (!cancelled) setSubscribed(!!subscription)
      } catch {
        if (!cancelled) setSubscribed(false)
      }
    }

    checkStatus()
    return () => { cancelled = true }
  }, [])

  const handleEnable = async () => {
    setError('')
    setTestResult('')
    setEnabling(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') {
        setEnabling(false)
        return
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) throw new Error('missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')

      const registration = await getReadyRegistration()
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not signed in')

      const json = subscription.toJSON()
      const { error: upsertError } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: json.keys?.p256dh ?? '',
          auth_key: json.keys?.auth ?? '',
          user_agent: navigator.userAgent,
          // Captured now because reminders are sent from a cron job with no request/cookie
          // context to resolve a locale from — see src/lib/feeding-reminder-copy.ts.
          locale,
          // Same reasoning as locale: the cron job needs this to know whether it's currently
          // quiet hours (21:00-07:00) for this subscription — see
          // claim_due_feeding_reminders() in supabase/migrations.
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        { onConflict: 'endpoint' }
      )
      if (upsertError) throw upsertError

      setSubscribed(true)
    } catch (err) {
      console.error('[push] enable failed', err)
      setError(t('subscribeError'))
    } finally {
      setEnabling(false)
    }
  }

  const handleDisable = async () => {
    setError('')
    setTestResult('')
    setDisabling(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
        await subscription.unsubscribe()
      }
      setSubscribed(false)
    } catch (err) {
      console.error('[push] disable failed', err)
      setError(t('subscribeError'))
    } finally {
      setDisabling(false)
    }
  }

  const handleTest = async () => {
    setError('')
    setTestResult('')
    setTesting(true)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'failed to send test notification')
      setTestResult(t('testSent'))
    } catch (err) {
      console.error('[push] test send failed', err)
      setError(t('testFailed'))
    } finally {
      setTesting(false)
    }
  }

  const statusMessage =
    support === 'unsupported' ? t('unsupported')
    : permission === 'denied' ? t('permissionDenied')
    : subscribed ? t('enabledStatus')
    : t('description')

  return (
    <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f9ede5] flex items-center justify-center text-xl">🔔</div>
          <div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{t('title')}</div>
            <p className="font-lora text-sm text-[#9a7060]">{statusMessage}</p>
          </div>
        </div>

        {support === 'supported' && permission !== 'denied' && (
          <div className="flex items-center gap-4">
            {!subscribed ? (
              <button
                onClick={handleEnable}
                disabled={enabling}
                className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
                {enabling ? t('enabling') : t('enableButton')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
                  {testing ? t('sending') : t('testButton')}
                </button>
                <button
                  onClick={handleDisable}
                  disabled={disabling}
                  className="font-lora text-sm text-[#9a7060] hover:underline disabled:opacity-50">
                  {disabling ? t('disabling') : t('disableButton')}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mt-5 font-lora text-sm">
          {error}
        </div>
      )}
      {testResult && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mt-5 font-lora text-sm">
          {testResult}
        </div>
      )}
    </div>
  )
}
