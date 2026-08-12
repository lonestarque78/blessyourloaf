'use client'

import { useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { setLocaleAction } from '@/i18n/actions'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/locale'

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark'
  // True on the static marketing/guide tier (src/app/[locale]/...), where locale lives in
  // the URL (as-needed prefix: English unprefixed, Spanish under /es) rather than the
  // cookie alone — a refresh wouldn't change a statically-rendered page's content, so this
  // navigates to the equivalent path in the target locale instead. The cookie is set
  // either way, so a visitor who switches language on the marketing site sees the same
  // language after logging into the (cookie-based) dashboard, rather than reverting to
  // whatever the cookie was set to previously.
  localeRouting?: boolean
}

// Strips any existing /es prefix, then re-adds it if switching to a non-default locale —
// mirrors src/i18n/routing.ts's 'as-needed' localePrefix convention.
function localizedPath(pathname: string, target: Locale): string {
  const stripped = pathname.replace(/^\/es(?=\/|$)/, '') || '/'
  if (target === DEFAULT_LOCALE) return stripped
  return stripped === '/' ? '/es' : `/es${stripped}`
}

export default function LanguageSwitcher({ variant = 'light', localeRouting = false }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('Common.language')
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleChange(next: Locale) {
    if (next === locale || isPending) return
    startTransition(async () => {
      await setLocaleAction(next)
      if (localeRouting) {
        router.push(localizedPath(pathname, next))
      } else {
        router.refresh()
      }
    })
  }

  const inactiveClass = variant === 'dark' ? 'text-[#c9a090] hover:text-white' : 'text-[#7a4f3a] hover:text-[#b07d62]'

  return (
    <div className="flex items-center gap-1 font-lora text-xs" role="group" aria-label={t('label')}>
      {SUPPORTED_LOCALES.map(code => (
        <button
          key={code}
          type="button"
          onClick={() => handleChange(code)}
          disabled={isPending}
          aria-pressed={locale === code}
          className={`px-2 py-1 rounded-full transition-colors disabled:opacity-60 ${
            locale === code ? 'bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white' : inactiveClass
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
