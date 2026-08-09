'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ImportedIngredient, ImportedRecipe, ImportedStep } from '@/lib/recipe-import'

const categories = ['loaf', 'discard', 'rolls', 'focaccia', 'other']
const difficulties = ['beginner', 'intermediate', 'advanced']

interface Ingredient {
  item: string
  amount: string
  note: string
}

interface Step {
  title: string
  description: string
  duration_minutes: string
}

function NewMyRecipePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  const [form, setForm] = useState({
    title: searchParams.get('title') || '',
    description: '',
    category: 'loaf',
    difficulty: 'beginner',
    prep_time_minutes: '',
    bake_time_minutes: '',
    notes: '',
    tags: '',
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: '', amount: '', note: '' }
  ])

  const [steps, setSteps] = useState<Step[]>([
    { title: '', description: '', duration_minutes: '' }
  ])

  const applyImportedRecipe = (payload: Partial<ImportedRecipe>) => {
    if (!payload?.title) return

    setForm(prev => ({
      ...prev,
      title: payload.title || prev.title,
      description: payload.description || prev.description,
      category: payload.category || prev.category,
      difficulty: payload.difficulty || prev.difficulty,
      prep_time_minutes: payload.prep_time_minutes ? String(payload.prep_time_minutes) : prev.prep_time_minutes,
      bake_time_minutes: payload.bake_time_minutes ? String(payload.bake_time_minutes) : prev.bake_time_minutes,
      notes: payload.notes ? `${prev.notes ? `${prev.notes}\n` : ''}${payload.notes}` : prev.notes,
    }))

    const normalizedIngredients = Array.isArray(payload.ingredients) && payload.ingredients.length > 0
      ? payload.ingredients.map((ingredient: Partial<ImportedIngredient>) => ({
          item: ingredient.item || '',
          amount: ingredient.amount || '',
          note: ingredient.note || '',
        }))
      : [{ item: '', amount: '', note: '' }]

    const normalizedSteps = Array.isArray(payload.steps) && payload.steps.length > 0
      ? payload.steps.map((step: Partial<ImportedStep>) => ({
          title: step.title || '',
          description: step.description || '',
          duration_minutes: step.duration_minutes ? String(step.duration_minutes) : '',
        }))
      : [{ title: '', description: '', duration_minutes: '' }]

    setIngredients(normalizedIngredients)
    setSteps(normalizedSteps)
    setImportMessage('Recipe imported. Review the details and save when you are ready.')
  }

  const handleImport = async () => {
    if (!importUrl.trim()) {
      setError('Paste a recipe URL first.')
      return
    }

    setImporting(true)
    setError('')
    setImportMessage('')

    try {
      const res = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Import failed')
      }

      applyImportedRecipe(data.recipe)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const addIngredient = () => setIngredients([...ingredients, { item: '', amount: '', note: '' }])
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i))
  const updateIngredient = (i: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients]
    updated[i][field] = value
    setIngredients(updated)
  }

  const addStep = () => setSteps([...steps, { title: '', description: '', duration_minutes: '' }])
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i: number, field: keyof Step, value: string) => {
    const updated = [...steps]
    updated[i][field] = value
    setSteps(updated)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Give your recipe a name!'); return }
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const cleanIngredients = ingredients.filter(i => i.item.trim())
    const cleanSteps = steps.filter(s => s.description.trim()).map(s => ({
      ...s,
      duration_minutes: s.duration_minutes ? parseInt(s.duration_minutes) : null
    }))

    const { data, error } = await supabase
      .from('user_recipes')
      .insert({
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        difficulty: form.difficulty,
        prep_time_minutes: form.prep_time_minutes ? parseInt(form.prep_time_minutes) : null,
        bake_time_minutes: form.bake_time_minutes ? parseInt(form.bake_time_minutes) : null,
        notes: form.notes || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        ingredients: cleanIngredients,
        steps: cleanSteps,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push(`/dashboard/my-recipes/${data.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/dashboard/my-recipes" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to My Recipes
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-2">Add a Recipe</h1>
        <p className="font-lora italic text-[#9a7060]">
          &quot;Your secret&apos;s safe with us.&quot;
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 font-lora text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-6">
        <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-2">Import from a Recipe URL</h2>
        <p className="font-lora text-sm text-[#9a7060] mb-4">
          Paste a recipe page and we&apos;ll pull out the ingredients, timings, and steps into a clean draft.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            placeholder="https://example.com/recipe"
            className="flex-1 border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
          />
          <button
            onClick={handleImport}
            disabled={importing}
            className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-3 rounded-xl font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Recipe'}
          </button>
        </div>
        {importMessage && (
          <p className="font-lora text-sm text-[#7a4f3a] mt-3">{importMessage}</p>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-5">The Basics</h2>
          <div className="space-y-4">
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Recipe Name *</label>
              <input type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Jalapeño Cheddar Loaf..."
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
            </div>
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Description</label>
              <textarea value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What makes this one special..."
                rows={3}
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]">
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]">
                  {difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Prep Time (min)</label>
                <input type="number" value={form.prep_time_minutes}
                  onChange={e => setForm({ ...form, prep_time_minutes: e.target.value })}
                  placeholder="30"
                  className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
              </div>
              <div>
                <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Bake Time (min)</label>
                <input type="number" value={form.bake_time_minutes}
                  onChange={e => setForm({ ...form, bake_time_minutes: e.target.value })}
                  placeholder="45"
                  className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
              </div>
            </div>
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Tags (comma separated)</label>
              <input type="text" value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="spicy, cheddar, easy..."
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-playfair text-xl font-bold text-[#3d2b1f]">Ingredients</h2>
            <button onClick={addIngredient}
              className="font-lora text-sm text-[#b07d62] hover:underline">+ Add</button>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)}
                    placeholder="2 cups"
                    className="border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
                  <input value={ing.item} onChange={e => updateIngredient(i, 'item', e.target.value)}
                    placeholder="bread flour"
                    className="border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
                  <input value={ing.note} onChange={e => updateIngredient(i, 'note', e.target.value)}
                    placeholder="room temp (optional)"
                    className="border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
                </div>
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="text-[#b8896e] hover:text-red-400 mt-2 text-lg">×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-playfair text-xl font-bold text-[#3d2b1f]">Steps</h2>
            <button onClick={addStep} className="font-lora text-sm text-[#b07d62] hover:underline">+ Add</button>
          </div>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white flex items-center justify-center font-playfair font-bold text-xs flex-shrink-0 mt-2">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)}
                      placeholder="Step title"
                      className="col-span-2 border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
                    <input value={step.duration_minutes} onChange={e => updateStep(i, 'duration_minutes', e.target.value)}
                      placeholder="Minutes"
                      type="number"
                      className="border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]" />
                  </div>
                  <textarea value={step.description} onChange={e => updateStep(i, 'description', e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="w-full border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6] resize-none" />
                </div>
                {steps.length > 1 && (
                  <button onClick={() => removeStep(i)} className="text-[#b8896e] hover:text-red-400 mt-2 text-lg">×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
          <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-4">Personal Notes</h2>
          <textarea value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Your tweaks, tips, or memories about this recipe..."
            rows={4}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6] resize-none" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-4 rounded-xl font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
          {saving ? 'Saving your recipe...' : 'Save My Recipe 📖'}
        </button>
      </div>
    </div>
  )
}

export default function NewMyRecipePage() {
  return (
    <Suspense>
      <NewMyRecipePageContent />
    </Suspense>
  )
}