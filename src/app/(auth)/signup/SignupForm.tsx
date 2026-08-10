'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function SignupForm() {
  const t = useTranslations('Auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleAppleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleFacebookSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🍞</div>
        <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-4">{t('signup.checkEmailTitle')}</h1>
        <p className="font-lora italic text-[#9a7060] leading-relaxed">
          {t.rich('signup.checkEmailBody', { email, b: (chunks) => <strong>{chunks}</strong> })}
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

      <button onClick={handleGoogleSignup}
        className="w-full flex items-center justify-center gap-3 border border-[#e8d5c8] rounded-xl py-3 font-lora text-sm text-[#3d2b1f] hover:bg-[#f9ede5] transition-colors mb-6">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
          <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.14z"/>
          <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 0 0 1.83 5.43L4.5 7.5c.67-2 2.54-3.92 4.48-3.92z"/>
        </svg>
        {t('form.continueWithGoogle')}
      </button>

      <button onClick={handleAppleSignup}
        className="w-full flex items-center justify-center gap-3 border border-[#e8d5c8] rounded-xl py-3 font-lora text-sm text-[#3d2b1f] hover:bg-[#f9ede5] transition-colors mb-6">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#000000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.31-3.014c.83-1.012 1.389-2.428 1.24-3.83-1.19.045-2.635.79-3.49 1.802-.767.89-1.44 2.323-1.26 3.688 1.334.104 2.678-.68 3.51-1.66z"/>
        </svg>
        {t('form.continueWithApple')}
      </button>

      <button onClick={handleFacebookSignup}
        className="w-full flex items-center justify-center gap-3 border border-[#e8d5c8] rounded-xl py-3 font-lora text-sm text-[#3d2b1f] hover:bg-[#f9ede5] transition-colors mb-6">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {t('form.continueWithFacebook')}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#e8d5c8]" />
        <span className="font-lora text-xs text-[#b8896e]">{t('form.or')}</span>
        <div className="flex-1 h-px bg-[#e8d5c8]" />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('form.yourName')}</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder={t('form.namePlaceholder')}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
          />
        </div>
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('form.email')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('form.emailPlaceholder')}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
          />
        </div>
        <div>
          <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">{t('form.password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('form.passwordPlaceholder')}
            className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] transition-colors bg-[#fdf9f6]"
          />
        </div>
      </div>

      <button onClick={handleEmailSignup} disabled={loading}
        className="w-full bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white py-3 rounded-xl font-lora hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? t('form.creatingAccount') : t('form.createAccount')}
      </button>

      <p className="text-center mt-5 font-lora text-xs text-[#9a7060]">
        {t('form.alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-[#b07d62] hover:underline">{t('form.logInHere')}</Link>
      </p>
    </div>
  )
}
