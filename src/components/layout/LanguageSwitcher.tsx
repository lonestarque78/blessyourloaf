'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { setLocaleAction } from '@/i18n/actions'
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/locale'

export default function LanguageSwitcher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const locale = useLocale() as Locale
  const t = useTranslations('Common.language')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(next: Locale) {
    if (next === locale || isPending) return
    startTransition(async () => {
      await setLocaleAction(next)
      router.refresh()
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
