'use server'

import { cookies } from 'next/headers'
import { LOCALE_COOKIE, isSupportedLocale } from './locale'

export async function setLocaleAction(locale: string) {
  if (!isSupportedLocale(locale)) return
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
