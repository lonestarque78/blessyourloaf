'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmation !== 'delete my account') {
      setError('Please type the confirmation phrase exactly, sugar.')
      return
    }

    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        setDeleting(false)
        return
      }

      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=true')
    } catch {
      setError('Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/dashboard/account" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to Account Settings
      </Link>

      <div className="bg-white rounded-2xl p-8 shadow-md border border-red-100">
        <h1 className="font-playfair text-3xl font-bold text-red-700 mb-3">Delete Account</h1>
        <p className="font-lora text-[#6b4c3b] leading-relaxed mb-6">
          This is permanent and cannot be undone, honey. Everything will be deleted — your starters, feedings, bake schedules, personal recipes, and subscription. There is no coming back from this.
        </p>

        <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
          <p className="font-lora text-sm text-red-700">
            Your subscription will be cancelled immediately. You will not receive a refund for any remaining time in your billing period.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 font-lora text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">
            Type <strong>delete my account</strong> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={e => setConfirmation(e.target.value)}
            placeholder="delete my account"
            className="w-full border border-red-200 rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-red-400 bg-[#fdf9f6]"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            disabled={deleting || confirmation !== 'delete my account'}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-lora text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {deleting ? 'Deleting everything...' : 'Permanently Delete My Account'}
          </button>
          <Link href="/dashboard/account"
            className="px-6 border border-[#e8d5c8] text-[#7a4f3a] py-3 rounded-xl font-lora text-sm hover:bg-[#f9ede5] transition-colors text-center">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}