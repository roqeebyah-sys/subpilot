import Stripe from 'stripe'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Takes raw Stripe subscription data and converts it into
// our unified subscriber format — same shape as CSV imports
function normaliseStripeSubscription(
  customer: Stripe.Customer,
  subscription: Stripe.Subscription,
  userId: string
) {
  const item = subscription.items.data[0]

  return {
    userId,
    source: 'stripe',
    sourceId: customer.id,
    name: customer.name || '',
    email: customer.email || '',
    plan: item?.price?.nickname || item?.price?.id || 'unknown',
    // Stripe stores amounts in cents — divide by 100 for dollars
    amount: item?.price?.unit_amount || 0,
    currency: subscription.currency || 'usd',
    status: mapStripeStatus(subscription.status),
    startedAt: new Date(subscription.created * 1000), // Stripe uses Unix timestamps
    cancelledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    lastActiveAt: subscription.start_date
  ? new Date(subscription.start_date * 1000)
  : new Date(),
metadata: {
  stripeSubscriptionId: subscription.id,
  stripePriceId: item?.price?.id,
  currentPeriodEnd: item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null,
},
  }
}

// Maps Stripe's status names to our unified status names
function mapStripeStatus(stripeStatus: string) {
  const map: Record<string, string> = {
    active: 'active',
    canceled: 'cancelled',
    past_due: 'past_due',
    trialing: 'trialing',
    paused: 'paused',
    incomplete: 'unknown',
    incomplete_expired: 'cancelled',
    unpaid: 'past_due',
  }
  return map[stripeStatus] || 'unknown'
}

// Main function — pulls all subscribers from Stripe and saves to MongoDB
export async function syncStripeSubscribers(userId: string) {
  await connectDB()

  const results = {
    synced: 0,
    errors: 0,
  }

  try {
    // Fetch all subscriptions from Stripe
    // auto_paging_each handles pagination automatically
    for await (const subscription of stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer'], // include customer data in the response
    })) {
      try {
        const customer = subscription.customer as Stripe.Customer

        if (!customer.email) continue // skip customers with no email

        const subscriberData = normaliseStripeSubscription(
          customer,
          subscription,
          userId
        )

        // upsert = update if exists, create if not
        // This means running sync twice doesn't create duplicates
        await Subscriber.findOneAndUpdate(
          { userId, source: 'stripe', sourceId: customer.id },
          subscriberData,
          { upsert: true, new: true }
        )

        results.synced++
      } catch (err) {
        console.error('Error syncing subscriber:', err)
        results.errors++
      }
    }
  } catch (err) {
    console.error('Stripe sync error:', err)
    throw err
  }

  return results
}

// Pull summary metrics directly from Stripe for the dashboard
export async function getStripeMetrics() {
  const [subscriptions, charges] = await Promise.all([
    stripe.subscriptions.list({ limit: 100, status: 'active' }),
    stripe.charges.list({ limit: 100 }),
  ])

  // Calculate MRR — sum of all active subscription amounts
  const mrr = subscriptions.data.reduce((total, sub) => {
    const amount = sub.items.data[0]?.price?.unit_amount || 0
    const interval = sub.items.data[0]?.price?.recurring?.interval
    // Normalise to monthly — annual plans divide by 12
    return total + (interval === 'year' ? amount / 12 : amount)
  }, 0)

  return {
    mrr: mrr / 100, // convert cents to dollars
    activeSubscribers: subscriptions.data.length,
    totalCharges: charges.data.length,
  }
}