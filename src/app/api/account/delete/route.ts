import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get profile to find Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    // Cancel Stripe subscription if exists
    if (profile?.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
      })

      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id)
      }

      // Also check trialing
      const trialing = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'trialing',
      })

      for (const sub of trialing.data) {
        await stripe.subscriptions.cancel(sub.id)
      }
    }

    // Delete the user from Supabase auth (cascades to all their data via RLS)
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}