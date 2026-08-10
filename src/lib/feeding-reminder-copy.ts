import { createTranslator } from 'next-intl'
import type { Locale } from '@/i18n/locale'
import enStarters from '../../messages/en/starters.json'
import esStarters from '../../messages/es/starters.json'

// The cron job has no request/cookie context to resolve a locale from (that's how the web
// app normally does it — see src/i18n/request.ts), so it uses createTranslator directly
// against the same message files rather than next-intl's request-scoped APIs.
const MESSAGES: Record<Locale, { Starters: typeof enStarters }> = {
  en: { Starters: enStarters },
  es: { Starters: esStarters },
}

export function feedingReminderCopy(locale: Locale, starterName: string): { title: string; body: string } {
  const t = createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: 'Starters.notifications.reminder',
  })
  return { title: t('title'), body: t('body', { name: starterName }) }
}
