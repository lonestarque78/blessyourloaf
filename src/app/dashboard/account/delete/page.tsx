'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

export default function DeleteAccountPage() {
  const t = useTranslations('Account.delete')
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const confirmPhrase = t('confirmPhrase')

  const handleDelete = async () => {
    if (confirmation !== confirmPhrase) {
      setError(t('confirmError'))
      return
    }

    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t('genericError'))
        setDeleting(false)
        return
      }

      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=true')
    } catch {
      setError(t('genericError'))
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/dashboard/account" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        {t('backToAccount')}
      </Link>

      <div className="bg-white rounded-2xl p-8 shadow-md border border-red-100">
        <h1 className="font-playfair text-3xl font-bold text-red-700 mb-3">{t('title')}</h1>
        <p className="font-lora text-[#6b4c3b] leading-relaxed mb-6">
          {t('body')}
        </p>

        <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
          <p className="font-lora text-sm text-red-700">
            {t('billingNote')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 font-lora text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
            {t.rich('confirmLabel', { b: (chunks) => <strong>{chunks}</strong> })}
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={e => setConfirmation(e.target.value)}
            placeholder={t('confirmPlaceholder')}
            className="w-full border border-red-200 rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-red-400 bg-[#fdf9f6]"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            disabled={deleting || confirmation !== confirmPhrase}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-lora text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {deleting ? t('deleting') : t('deleteButton')}
          </button>
          <Link href="/dashboard/account"
            className="px-6 border border-[#e8d5c8] text-[#7a4f3a] py-3 rounded-xl font-lora text-sm hover:bg-[#f9ede5] transition-colors text-center">
            {t('cancel')}
          </Link>
        </div>
      </div>
    </div>
  )
}
