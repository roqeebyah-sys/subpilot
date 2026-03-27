import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id).select('stripeCustomerId')
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Subscribe to a plan first.' },
        { status: 404 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 })
  }
}
