import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { parseBody, checkoutSchema } from '@/lib/validations'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const parsed = await parseBody(req, checkoutSchema)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
    const { plan } = parsed.data

    // Resolve the Stripe price ID server-side — env vars without NEXT_PUBLIC_
    // are never sent to the browser, so the lookup must happen here
    const PRICE_IDS: Record<string, string | undefined> = {
      starter: process.env.STRIPE_STARTER_PRICE_ID,
      growth:  process.env.STRIPE_GROWTH_PRICE_ID,
      pro:     process.env.STRIPE_PRO_PRICE_ID,
    }
    const priceId = PRICE_IDS[plan as string]
    if (!priceId) {
      return NextResponse.json(
        { error: `STRIPE_${(plan as string).toUpperCase()}_PRICE_ID is not set in environment variables` },
        { status: 500 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stripe = getStripe()
    let customerId: string = user.stripeCustomerId

    // Create a Stripe customer if the user doesn't have one yet
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      await User.findByIdAndUpdate(session.user.id, { stripeCustomerId: customerId })
    } else {
      // Verify the stored customer still exists in Stripe (guards against
      // account switches or manual deletions)
      try {
        await stripe.customers.retrieve(customerId)
      } catch {
        const customer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name ?? undefined,
          metadata: { userId: session.user.id },
        })
        customerId = customer.id
        await User.findByIdAndUpdate(session.user.id, { stripeCustomerId: customerId })
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      // Carry userId so the webhook knows which DB user to update
      subscription_data: {
        metadata: { userId: session.user.id },
      },
      success_url: `${appUrl}/billing?success=true`,
      cancel_url:  `${appUrl}/billing?cancelled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
