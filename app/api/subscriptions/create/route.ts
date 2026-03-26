// app/api/subscriptions/create/route.ts
import {createCheckoutSession, createStripeCustomer} from '@/lib/stripe'
import {createClient} from '@/lib/supabase/server'
import {SUBSCRIPTION_AMOUNTS} from '@/types'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const {plan} = await req.json()
  if (!['monthly', 'yearly'].includes(plan)) {
    return NextResponse.json({error: 'Invalid plan'}, {status: 400})
  }

  // Check existing subscription
  const {data: existingSub} = await supabase.from('subscriptions')
                                  .select('stripe_customer_id, status')
                                  .eq('user_id', user.id)
                                  .single()

  let customerId = existingSub?.stripe_customer_id

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer =
        await createStripeCustomer(user.email!, user.user_metadata?.full_name)
    customerId = customer
                     .id

                         // Store customer ID
                         await supabase.from('subscriptions')
                     .upsert({
                       user_id: user.id,
                       stripe_customer_id: customerId,
                       plan,
                       status: 'inactive',
                       amount_cents: SUBSCRIPTION_AMOUNTS
                           [plan as keyof typeof SUBSCRIPTION_AMOUNTS],
                     })
  }

  const priceId = plan === 'monthly' ?
      process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID! :
      process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!

      const appUrl = process.env.NEXT_PUBLIC_APP_URL!

                     const session = await createCheckoutSession({
        customerId,
        priceId,
        successUrl: `${appUrl}/dashboard?subscribed=true`,
        cancelUrl: `${appUrl}/subscribe`,
        userId: user.id,
      })

  return NextResponse.json({url: session.url})
}