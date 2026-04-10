import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

// Tell Next.js to not parse the body — we need the raw bytes to verify
// Stripe's webhook signature
export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// Maps Stripe price IDs to our plan names
function planFromPriceId(priceId: string): 'starter' | 'growth' | 'pro' | null {
  const map: Record<string, 'starter' | 'growth' | 'pro'> = {
    [process.env.STRIPE_STARTER_PRICE_ID!]: 'starter',
    [process.env.STRIPE_GROWTH_PRICE_ID!]:  'growth',
    [process.env.STRIPE_PRO_PRICE_ID!]:     'pro',
  }
  return map[priceId] ?? null
}

export async function POST(req: NextRequest) {
  // Read raw body — required for Stripe signature verification
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  await connectDB()

  try {
    switch (event.type) {

      // ── Subscription created or updated ─────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId

        if (!userId) {
          console.warn('Webhook: subscription has no userId in metadata — skipping')
          break
        }

        // Work out which plan this price corresponds to
        const priceId = sub.items.data[0]?.price?.id
        const plan    = priceId ? planFromPriceId(priceId) : null

        if (!plan) {
          console.warn(`Webhook: unknown priceId ${priceId} — plan unchanged`)
          break
        }

        await User.findByIdAndUpdate(userId, { plan })
        console.log(`Webhook: updated user ${userId} plan → ${plan}`)
        break
      }

      // ── Subscription cancelled / ended ───────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId

        if (!userId) {
          console.warn('Webhook: deleted subscription has no userId — skipping')
          break
        }

        await User.findByIdAndUpdate(userId, { plan: 'starter' })
        console.log(`Webhook: user ${userId} subscription ended → reset to starter`)
        break
      }

      // ── Payment failed ────────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn(
          `Webhook: payment failed — customer ${invoice.customer}, ` +
          `amount $${(invoice.amount_due / 100).toFixed(2)}, ` +
          `attempt #${invoice.attempt_count}`
        )
        // TODO: send a payment-failed email via Resend
        break
      }

      default:
        // Safely ignore unhandled event types
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
