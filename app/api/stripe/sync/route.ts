import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { syncStripeSubscribers, getStripeMetrics } from '@/lib/stripe-service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Sync all Stripe subscribers to MongoDB
    const results = await syncStripeSubscribers(session.user.id)

    // Get live metrics
    const metrics = await getStripeMetrics()

    return NextResponse.json({
      success: true,
      ...results,
      metrics,
    })

  } catch (error) {
    console.error('Stripe sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync Stripe data' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const metrics = await getStripeMetrics()
    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}