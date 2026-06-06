'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const flourTypes = ['all-purpose', 'bread flour', 'whole wheat', 'rye', 'spelt', 'einkorn', 'gluten-free blend']

export default function EditStarterPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    born_at: '',
    flour_type: 'all-purpose',
    hydration_percent: 100,
    notes: '',
    is_active: true,
  })

  useEffect(() => {
    async function loadStarter() {
      const { data } = await supabase
        .from('starters')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setForm({
          name: data.name || '',
          nickname: data.nickname || '',
          born_at: data.born_at || '',
          flour_type: data.flour_type || 'all-purpose',
          hydration_percent: data.hydration_percent || 100,
          notes: data.notes || '',
          is_active: data.is_active ?? true,
        })
      }
      setLoading(false)
    }
    loadStarter()
  }, [id])

  const handleSave = async () => {
    if (!form.name.trim()) { setError('She needs a name, sugar!'); return }
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('starters')
      .update({
        name: form.name,
        nickname: form.nickname || null,
        born_at: form.born_at,
        flour_type: form.flour_type,
        hydration_percent: form.hydration_percent,
        notes: form.notes || null,
        is_active: form.is_active,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push(`/dashboard/starters/${id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="font-lora italic text-[#9a7060]">Loading her details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href={`/dashboard/starters/${id}`} className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to {form.name || 'Starter'}
      </Link>

      <div className="text-center mb-10">
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-2">Edit {form.name}</h1>
        <p className="font-lora italic text-[#9a7060]">
          "Keep her details up to date, sugar."
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
              Starter Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              Nickname <span className="font-lora normal-case tracking-normal text-[#b8896e]">(optional)</span>
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={e => setForm({ ...form, nickname: e.target.value })}
              placeholder="The drama queen, My reliable girl..."
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Birthday</label>
            <input
              type="date"
              value={form.born_at}
              onChange={e => setForm({ ...form, born_at: e.target.value })}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Flour Type</label>
            <select
              value={form.flour_type}
              onChange={e => setForm({ ...form, flour_type: e.target.value })}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]">
              {flourTypes.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              Hydration: {form.hydration_percent}%
            </label>
            <input
              type="range"
              min={50} max={150} step={5}
              value={form.hydration_percent}
              onChange={e => setForm({ ...form, hydration_percent: parseInt(e.target.value) })}
              className="w-full accent-[#c9956c]"
            />
            <div className="flex justify-between font-lora text-xs text-[#b8896e] mt-1">
              <span>50% (stiff)</span>
              <span>100% (equal parts)</span>
              <span>150% (loose)</span>
            </div>
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Status</label>
            <div className="flex gap-4">
              <button
                onClick={() => setForm({ ...form, is_active: true })}
                className={`flex-1 py-3 rounded-xl font-lora text-sm border transition-all ${
                  form.is_active
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'border-[#e8d5c8] text-[#9a7060] hover:border-[#c9956c]'
                }`}>
                Active
              </button>
              <button
                onClick={() => setForm({ ...form, is_active: false })}
                className={`flex-1 py-3 rounded-xl font-lora text-sm border transition-all ${
                  !form.is_active
                    ? 'bg-gray-50 border-gray-300 text-gray-600'
                    : 'border-[#e8d5c8] text-[#9a7060] hover:border-[#c9956c]'
                }`}>
                Resting
              </button>
            </div>
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Where she came from, what makes her special..."
              rows={3}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6] resize-none"
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-4 rounded-xl font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}