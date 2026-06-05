'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const flourTypes = ['all-purpose', 'bread flour', 'whole wheat', 'rye', 'spelt', 'einkorn', 'gluten-free blend']

export default function NewStarterPage() {
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
    notes: '',
  })

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('She needs a name, sugar!')
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
        ← Back to Starters
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🫙</div>
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-2">Name your starter, honey.</h1>
        <p className="font-lora italic text-[#9a7060]">
          "She's gonna be with you a long time. Make it a good one."
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
              placeholder="Sweet Magnolia, Biscuit, Rosie..."
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
            />
          </div>

          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              Nickname or Personality <span className="font-lora normal-case text-[#b8896e] tracking-normal">(optional)</span>
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
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              Birthday
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
              Flour Type
            </label>
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
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
              Notes <span className="font-lora normal-case text-[#b8896e] tracking-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Where she came from, what makes her special..."
              rows={3}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6] resize-none"
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-4 rounded-xl font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Creatin' her now..." : 'Welcome Her to the World 🫙'}
        </button>
      </div>
    </div>
  )
}