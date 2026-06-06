'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now in password recovery mode — form is ready
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (!password) { setError('Enter a new password, sugar.'); return }
    if (password.length < 8) { setError('Password needs to be at least 8 characters, honey.'); return }
    if (password !== confirm) { setError("Those passwords don't match, darlin'."); return }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  if (success) {
    return (
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🍞</div>
        <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-4">You're all set, sugar!</h1>
        <p className="font-lora italic text-[#9a7060] leading-relaxed">
          Your password has been updated. Taking you to your dashboard now...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#f0e4db]">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 font-lora text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
          />
        </div>
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Same thing again, darlin'"
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
          />
        </div>
      </div>

      <button onClick={handleReset} disabled={loading}
        className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Updating...' : 'Update My Password'}
      </button>

      <p className="text-center mt-5 font-lora text-xs text-[#9a7060]">
        <Link href="/login" className="text-[#b07d62] hover:underline">Back to Log In</Link>
      </p>
    </div>
  )
}
