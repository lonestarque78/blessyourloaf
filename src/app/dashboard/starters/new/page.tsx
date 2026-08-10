'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

const flourTypeValues = ['all-purpose', 'bread flour', 'whole wheat', 'rye', 'spelt', 'einkorn', 'gluten-free blend']
const feedingIntervalValues = [12, 24, 48, 72, 168]

export default function NewStarterPage() {
  const t = useTranslations('Starters')
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    born_at: new Date().toISOString().split('T')[0],
    flour_type: 'all-purpose',
    hydration_percent: 100,
    feeding_interval_hours: 24,
    notes: '',
  })

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError(t('new.errorNoName'))
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('starters')
      .insert({ ...form, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/starters/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/dashboard/starters" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        {t('new.backToStarters')}
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🫙</div>
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-2">{t('new.title')}</h1>
        <p className="font-lora italic text-[#9a7060]">
          {t('new.quote')}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-md border border-[#f0e4db]">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 font-lora text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.nameLabel')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t('new.namePlaceholder')}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.nicknameLabel')} <span className="font-lora normal-case text-[#b8896e] tracking-normal">{t('new.optional')}</span>
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={e => setForm({ ...form, nickname: e.target.value })}
              placeholder={t('new.nicknamePlaceholder')}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.birthdayLabel')}
            </label>
            <input
              type="date"
              value={form.born_at}
              onChange={e => setForm({ ...form, born_at: e.target.value })}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.flourTypeLabel')}
            </label>
            <select
              value={form.flour_type}
              onChange={e => setForm({ ...form, flour_type: e.target.value })}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]">
              {flourTypeValues.map(f => (
                <option key={f} value={f}>{t(`flourTypeLabels.${f}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.hydrationLabel', { percent: form.hydration_percent })}
            </label>
            <input
              type="range"
              min={50} max={150} step={5}
              value={form.hydration_percent}
              onChange={e => setForm({ ...form, hydration_percent: parseInt(e.target.value) })}
              className="w-full accent-[#c9956c]"
            />
            <div className="flex justify-between font-lora text-xs text-[#b8896e] mt-1">
              <span>{t('new.hydrationStiff')}</span>
              <span>{t('new.hydrationEqual')}</span>
              <span>{t('new.hydrationLoose')}</span>
            </div>
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.feedingIntervalLabel')}
            </label>
            <select
              value={form.feeding_interval_hours}
              onChange={e => setForm({ ...form, feeding_interval_hours: parseInt(e.target.value) })}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]">
              {feedingIntervalValues.map(hours => (
                <option key={hours} value={hours}>{t(`feedingIntervalLabels.${hours}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              {t('new.notesLabel')} <span className="font-lora normal-case text-[#b8896e] tracking-normal">{t('new.optional')}</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder={t('new.notesPlaceholder')}
              rows={3}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6] resize-none"
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-4 rounded-xl font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? t('new.creating') : t('new.submit')}
        </button>
      </div>
    </div>
  )
}
