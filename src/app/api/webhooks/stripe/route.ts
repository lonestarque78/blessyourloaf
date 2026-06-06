import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Service role client bypasses RLS — required for webhook context (no user session)
  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const userId = session.metadata?.supabase_user_id

        console.log('[webhook] checkout.session.completed', {
          sessionId: session.id,
          customerId,
          subscriptionId,
          userId,
          customerEmail: session.customer_email,
          metadataKeys: Object.keys(session.metadata ?? {}),
        })

        if (!subscriptionId) {
          console.error('[webhook] No subscription ID on checkout session', session.id)
          break
        }

        if (!userId) {
          console.error('[webhook] No supabase_user_id in session metadata', session.id)
          break
        }

        let subscription: Stripe.Subscription
        try {
          subscription = await stripe.subscriptions.retrieve(subscriptionId)
        } catch (stripeErr) {
          console.error('[webhook] Failed to retrieve subscription', subscriptionId, stripeErr)
          throw stripeErr
        }

        console.log('[webhook] Retrieved subscription', {
          id: subscription.id,
          status: subscription.status,
          itemCount: subscription.items.data.length,
        })

        const priceId = subscription.items.data[0]?.price.id
        if (!priceId) {
          console.error('[webhook] No price ID on subscription items', subscription.id)
          break
        }

        const tier = priceId === process.env.STRIPE_ANNUAL_PRICE_ID ? 'annual' : 'monthly'
        // In Stripe API 2026-05-27.dahlia, current_period_end moved to the subscription item
        const periodEnd = subscription.items.data[0].current_period_end

        console.log('[webhook] Subscription details', {
          priceId,
          tier,
          periodEnd,
          hasPeriodEnd: periodEnd != null,
        })

        if (periodEnd == null) {
          console.error('[webhook] current_period_end missing on subscription', subscription.id)
          break
        }

        const { error: updateError, count } = await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            subscription_tier: tier,
            subscription_status: subscription.status,
            subscription_ends_at: new Date(periodEnd * 1000).toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('[webhook] Supabase profile update failed', { userId, updateError })
          throw new Error(`Supabase update failed: ${updateError.message}`)
        }

        console.log('[webhook] Profile updated', { userId, tier, rowsAffected: count })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0].price.id
        const tier = priceId === process.env.STRIPE_ANNUAL_PRICE_ID ? 'annual' : 'monthly'
        const periodEnd = subscription.items.data[0].current_period_end

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            subscription_ends_at: new Date(periodEnd * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        if (updateError) {
          console.error('[webhook] customer.subscription.updated — Supabase update failed', {
            customerId,
            updateError,
          })
          throw new Error(`Supabase update failed: ${updateError.message}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'inactive',
            subscription_ends_at: null,
          })
          .eq('stripe_customer_id', customerId)

        if (updateError) {
          console.error('[webhook] customer.subscription.deleted — Supabase update failed', {
            customerId,
            updateError,
          })
          throw new Error(`Supabase update failed: ${updateError.message}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        if (updateError) {
          console.error('[webhook] invoice.payment_failed — Supabase update failed', {
            customerId,
            updateError,
          })
          throw new Error(`Supabase update failed: ${updateError.message}`)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
