'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleReset = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📬</div>
        <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-4">Check your inbox, sugar!</h1>
        <p className="font-lora italic text-[#9a7060] leading-relaxed mb-6">
          We sent a password reset link to <strong>{email}</strong>. Should be there faster than a proofed loaf rises.
        </p>
        <Link href="/login" className="font-lora text-sm text-[#b07d62] hover:underline">
          Back to Log In
        </Link>
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

      <div className="mb-6">
        <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
        />
      </div>

      <button onClick={handleReset} disabled={loading}
        className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <p className="text-center mt-5 font-lora text-xs text-[#9a7060]">
        Remembered it?{' '}
        <Link href="/login" className="text-[#b07d62] hover:underline">Back to Log In</Link>
      </p>
    </div>
  )
}
