import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const tier = resolveSubscriptionTier(sub)

      await supabase
        .from('users')
        .update({
          subscription_tier:   tier,
          subscription_status: sub.status === 'active' ? 'active' : 'inactive',
          stripe_customer_id:  sub.customer as string,
        })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('users')
        .update({ subscription_tier: 'free', subscription_status: 'cancelled' })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}

function resolveSubscriptionTier(sub: Stripe.Subscription): string {
  const priceId = sub.items.data[0]?.price.id ?? ''
  if (
    priceId === process.env.STRIPE_PRICE_FAMILY_PLUS_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_FAMILY_PLUS_ANNUAL
  ) {
    return 'family_plus'
  }
  if (
    priceId === process.env.STRIPE_PRICE_FAMILY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_FAMILY_ANNUAL
  ) {
    return 'family'
  }
  return 'free'
}
