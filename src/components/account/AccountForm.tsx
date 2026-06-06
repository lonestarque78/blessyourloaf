'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  full_name: string | null
  email: string | null
}

interface Props {
  profile: Profile | null
  userEmail: string
}

export default function AccountForm({ profile, userEmail }: Props) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword) { setPasswordError('Enter a new password, sugar.'); return }
    if (newPassword.length < 8) { setPasswordError('Password needs at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError("Those passwords don't match, darlin'."); return }

    setSavingPassword(true)
    setPasswordError('')
    setPasswordSaved(false)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    }
    setSavingPassword(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
        <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-5">Profile</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 font-lora text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 font-lora text-sm">
            Profile updated, sugar!
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
            />
          </div>
          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Email</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#9a7060] bg-[#f9f5f2] cursor-not-allowed"
            />
            <p className="font-lora text-xs text-[#b8896e] mt-1">Email cannot be changed, honey.</p>
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={saving}
          className="mt-6 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db]">
        <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-5">Change Password</h2>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 font-lora text-sm">
            {passwordError}
          </div>
        )}

        {passwordSaved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 font-lora text-sm">
            Password updated, darlin'!
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
            />
          </div>
          <div>
            <label className="font-lora text-xs uppercase tracking-widest text-[#b8896e] block mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Same thing again"
              className="w-full border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]"
            />
          </div>
        </div>

        <button onClick={handleChangePassword} disabled={savingPassword}
          className="mt-6 bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-50">
          {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}