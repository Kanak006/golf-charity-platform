// app/api/subscriptions/webhook/route.ts
import {constructWebhookEvent} from '@/lib/stripe'
import {createAdminClient} from '@/lib/supabase/server'
import {NextRequest, NextResponse} from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers
                  .get('stripe-signature')!

              let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, sig)
  } catch {
    return NextResponse.json({error: 'Invalid signature'}, {status: 400})
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId || !session.subscription) break

          await supabase.from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                status: 'active',
                plan: session.metadata?.plan || 'monthly',
                amount_cents: session.amount_total || 0,
              })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const {data: subscription} = await supabase.from('subscriptions')
                                       .select('*')
                                       .eq('stripe_subscription_id', sub.id)
                                       .single()

      if (subscription) {
        await supabase.from('subscriptions')
            .update({
              status: sub.status === 'active' ? 'active' : 'inactive',
              current_period_start:
                  new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end:
                  new Date(sub.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions')
              .update(
                  {status: 'cancelled', updated_at: new Date().toISOString()})
              .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
  const invoice = event.data.object as Stripe.Invoice;

  await supabase
    .from('subscriptions')
    .update({
      status: 'lapsed',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer as string);

  break;
}
  }

  return NextResponse.json({received: true})
}

export const config = {
  api: {bodyParser: false}
}
