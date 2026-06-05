'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Feeding {
  id: string
  fed_at: string
  flour_grams: number | null
  water_grams: number | null
  starter_grams: number | null
  rise_percent: number | null
  peak_hours: number | null
  smell: string | null
  notes: string | null
}

interface Props {
  starterId: string
  starterName: string
  initialFeedings: Feeding[]
}

const smellOptions = ['Yeasty & sweet', 'Tangy & sour', 'Mild & fresh', 'Cheesy', 'Acetone/nail polish', 'Alcoholic', 'Funky but fine', 'Something ain\'t right']

export default function FeedingLog({ starterId, starterName, initialFeedings }: Props) {
  const supabase = createClient()
  const [feedings, setFeedings] = useState<Feeding[]>(initialFeedings)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fed_at: new Date().toISOString().slice(0, 16),
    flour_grams: '',
    water_grams: '',
    starter_grams: '',
    rise_percent: '',
    peak_hours: '',
    smell: '',
    notes: '',
  })

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('feedings')
      .insert({
        starter_id: starterId,
        user_id: user.id,
        fed_at: form.fed_at,
        flour_grams: form.flour_grams ? parseInt(form.flour_grams) : null,
        water_grams: form.water_grams ? parseInt(form.water_grams) : null,
        starter_grams: form.starter_grams ? parseInt(form.starter_grams) : null,
        rise_percent: form.rise_percent ? parseInt(form.rise_percent) : null,
        peak_hours: form.peak_hours ? parseFloat(form.peak_hours) : null,
        smell: form.smell || null,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setFeedings([data, ...feedings])
      setShowForm(false)
      setForm({
        fed_at: new Date().toISOString().slice(0, 16),
        flour_grams: '',
        water_grams: '',
        starter_grams: '',
        rise_percent: '',
        peak_hours: '',
        smell: '',
        notes: '',
      })
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f]">Feeding Log</h2>
          <p className="font-lora italic text-sm text-[#9a7060]">
            {feedings.length > 0
              ? `${feedings.length} feeding${feedings.length !== 1 ? 's' : ''} logged for ${starterName}`
              : `No feedings yet — let's feed ${starterName}, sugar!`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
          + Log a Feeding
        </button>
      </div>

      {/* Feeding form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-6">
          <h3 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-5">
            Log a Feeding for {starterName}
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 font-lora text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Date & Time Fed</label>
              <input
                type="datetime-local"
                value={form.fed_at}
                onChange={e => setForm({ ...form, fed_at: e.target.value })}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>

            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Flour (grams)</label>
              <input
                type="number"
                value={form.flour_grams}
                onChange={e => setForm({ ...form, flour_grams: e.target.value })}
                placeholder="50"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>

            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Water (grams)</label>
              <input
                type="number"
                value={form.water_grams}
                onChange={e => setForm({ ...form, water_grams: e.target.value })}
                placeholder="50"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>

            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Starter Used (grams)</label>
              <input
                type="number"
                value={form.starter_grams}
                onChange={e => setForm({ ...form, starter_grams: e.target.value })}
                placeholder="25"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>

            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Rise Activity (%)</label>
              <input
                type="number"
                value={form.rise_percent}
                onChange={e => setForm({ ...form, rise_percent: e.target.value })}
                placeholder="100"
                min="0" max="300"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>

            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Hours to Peak</label>
              <input
                type="number"
                value={form.peak_hours}
                onChange={e => setForm({ ...form, peak_hours: e.target.value })}
                placeholder="4.5"
                step="0.5"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
              />
            </div>

            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">How's she smell?</label>
              <select
                value={form.smell}
                onChange={e => setForm({ ...form, smell: e.target.value })}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]">
                <option value="">Select one...</option>
                {smellOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything worth rememberin' about this feeding..."
                rows={3}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Feeding'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 border border-[#e8d5c8] text-[#7a4f3a] py-3 rounded-xl font-lora hover:bg-[#f9ede5] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feeding history */}
      {feedings.length > 0 ? (
        <div className="space-y-4">
          {feedings.map((feeding, index) => (
            <div key={feeding.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0e4db]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-playfair font-bold text-[#3d2b1f]">
                    Feeding #{feedings.length - index}
                  </div>
                  <div className="font-lora text-xs text-[#9a7060]">
                    {new Date(feeding.fed_at).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </div>
                </div>
                {feeding.rise_percent && (
                  <div className="text-right">
                    <div className="font-playfair text-2xl font-bold text-[#b07d62]">{feeding.rise_percent}%</div>
                    <div className="font-lora text-xs text-[#9a7060]">rise</div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-3">
                {feeding.flour_grams && (
                  <div className="bg-[#f9ede5] rounded-lg px-3 py-1.5">
                    <span className="font-lora text-xs text-[#b8896e]">Flour </span>
                    <span className="font-lora text-sm text-[#3d2b1f]">{feeding.flour_grams}g</span>
                  </div>
                )}
                {feeding.water_grams && (
                  <div className="bg-[#f9ede5] rounded-lg px-3 py-1.5">
                    <span className="font-lora text-xs text-[#b8896e]">Water </span>
                    <span className="font-lora text-sm text-[#3d2b1f]">{feeding.water_grams}g</span>
                  </div>
                )}
                {feeding.starter_grams && (
                  <div className="bg-[#f9ede5] rounded-lg px-3 py-1.5">
                    <span className="font-lora text-xs text-[#b8896e]">Starter </span>
                    <span className="font-lora text-sm text-[#3d2b1f]">{feeding.starter_grams}g</span>
                  </div>
                )}
                {feeding.peak_hours && (
                  <div className="bg-[#f9ede5] rounded-lg px-3 py-1.5">
                    <span className="font-lora text-xs text-[#b8896e]">Peak </span>
                    <span className="font-lora text-sm text-[#3d2b1f]">{feeding.peak_hours}hrs</span>
                  </div>
                )}
                {feeding.smell && (
                  <div className="bg-[#f9ede5] rounded-lg px-3 py-1.5">
                    <span className="font-lora text-xs text-[#b8896e]">Smell </span>
                    <span className="font-lora text-sm text-[#3d2b1f]">{feeding.smell}</span>
                  </div>
                )}
              </div>

              {feeding.notes && (
                <div className="font-lora italic text-sm text-[#7a4f3a] bg-[#f9ede5] rounded-xl px-4 py-3">
                  💬 {feeding.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#f0e4db]">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-lora italic text-[#9a7060]">No feedings logged yet. Hit that button up there, sugar!</p>
        </div>
      )}
    </div>
  )
}