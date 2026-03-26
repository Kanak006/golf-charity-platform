// app/api/subscriptions/webhook/route.ts

import { constructWebhookEvent } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, sig)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId || !session.subscription) break

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          plan: session.metadata?.plan || 'monthly',
          amount_cents: session.amount_total || 0,
          updated_at: new Date().toISOString(),
        })

        if (error) console.error('Upsert error:', error)

        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription

        const { data: subscription, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (fetchError) {
          console.error('Fetch error:', fetchError)
          break
        }

        if (subscription) {
          const { error } = await supabase.from('subscriptions').update({
            status: sub.status === 'active' ? 'active' : 'inactive',
            current_period_start: new Date(
              sub.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              sub.current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', subscription.id)

          if (error) console.error('Update error:', error)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const { error } = await supabase.from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)

        if (error) console.error('Delete update error:', error)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'lapsed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', invoice.customer as string)

        if (error) console.error('Payment failed update error:', error)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
