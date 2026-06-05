'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #f5e6d8 50%, #ede0d4 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🍞</span>
            <span className="font-playfair text-2xl font-bold text-[#3d2b1f]">Bless Your Loaf</span>
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-2">Welcome back, sugar.</h1>
          <p className="font-lora italic text-[#9a7060]">Your starter missed you.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#f0e4db]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 font-lora text-sm">
              {error}
            </div>
          )}

          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-[#e8d5c8] rounded-xl py-3 font-lora text-sm text-[#3d2b1f] hover:bg-[#f9ede5] transition-colors mb-6">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.14z"/>
              <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 0 0 1.83 5.43L4.5 7.5c.67-2 2.54-3.92 4.48-3.92z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#e8d5c8]" />
            <span className="font-lora text-xs text-[#b8896e]">or</span>
            <div className="flex-1 h-px bg-[#e8d5c8]" />
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
              />
            </div>
            <div>
              <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
              />
            </div>
          </div>

          <button onClick={handleEmailLogin} disabled={loading}
            className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Signin in...' : 'Log In'}
          </button>

          <div className="flex justify-between mt-5">
            <Link href="/forgot-password" className="font-lora text-xs text-[#b07d62] hover:underline">
              Forgot your password?
            </Link>
            <Link href="/signup" className="font-lora text-xs text-[#b07d62] hover:underline">
              No account? Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}