import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AccountForm from '@/components/account/AccountForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/dashboard" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to Dashboard
      </Link>

      <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f] mb-2">Account Settings</h1>
      <p className="font-lora italic text-[#9a7060] mb-10">Your kitchen, your rules, sugar.</p>

      {/* Subscription status */}
      <div className="bg-white rounded-2xl p-7 shadow-md border border-[#f0e4db] mb-6">
        <h2 className="font-playfair text-xl font-bold text-[#3d2b1f] mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-lora text-sm text-[#3d2b1f] capitalize">
              {profile?.subscription_tier === 'free' || !profile?.subscription_tier
                ? 'Free Plan'
                : `${profile.subscription_tier} Plan`}
            </div>
            <div className={`font-lora text-xs mt-1 capitalize ${
              profile?.subscription_status === 'active' ? 'text-green-600' :
              profile?.subscription_status === 'trialing' ? 'text-blue-600' :
              'text-[#9a7060]'
            }`}>
              {profile?.subscription_status === 'active' ? 'Active' :
               profile?.subscription_status === 'trialing' ? 'Free Trial' :
               profile?.subscription_status === 'past_due' ? 'Payment past due' :
               'Inactive'}
            </div>
            {profile?.subscription_ends_at && (
              <div className="font-lora text-xs text-[#9a7060] mt-1">
                {profile.subscription_status === 'active' ? 'Renews' : 'Expires'}{' '}
                {new Date(profile.subscription_ends_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </div>
            )}
          </div>
          {(!profile?.subscription_status || profile?.subscription_status === 'inactive' || profile?.subscription_status === 'canceled') && (
            <Link href="/pricing"
              className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-5 py-2.5 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Profile form */}
      <AccountForm profile={profile} userEmail={user.email || ''} />

      {/* Danger zone */}
      <div className="bg-white rounded-2xl p-7 shadow-md border border-red-100 mt-6">
        <h2 className="font-playfair text-xl font-bold text-red-700 mb-2">Danger Zone</h2>
        <p className="font-lora text-sm text-[#9a7060] mb-5">
          Deleting your account is permanent and cannot be undone. All your starters, feedings, schedules, and recipes will be lost forever, honey.
        </p>
        <Link href="/dashboard/account/delete"
          className="font-lora text-sm text-red-600 hover:underline">
          Delete my account
        </Link>
      </div>
    </div>
  )
}