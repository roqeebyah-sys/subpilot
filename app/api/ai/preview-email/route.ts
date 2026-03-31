import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { generateWinBackEmail } from '@/lib/ai-insights'

export const maxDuration = 30

// POST /api/ai/preview-email
// Generates a win-back email draft and returns it — does NOT send anything.
// Body: { subscriberId: string }

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { subscriberId } = await req.json()
    if (!subscriberId) {
      return NextResponse.json({ error: 'subscriberId required' }, { status: 400 })
    }

    await connectDB()

    const subscriber = await Subscriber.findOne({
      _id: subscriberId,
      userId: session.user.id,
    }).lean() as any

    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    const daysInactive = subscriber.lastActiveAt
      ? Math.floor((Date.now() - new Date(subscriber.lastActiveAt).getTime()) / 86400000)
      : 30

    const amount = (subscriber.amount || 0) / 100

    const email = await generateWinBackEmail({
      businessName: session.user.name || 'your business',
      subscriberName: subscriber.name || 'there',
      subscriberEmail: subscriber.email,
      planName: subscriber.plan || 'your plan',
      monthlyAmount: amount,
      daysInactive,
      churnScore: subscriber.churnScore || 7,
      churnReason: buildReason(subscriber),
      predictedWindow: getPredictedWindow(subscriber.churnScore || 7),
    })

    return NextResponse.json({
      subject: email.subject,
      body: email.body,
      talkingPoints: email.talkingPoints,
      subscriberEmail: subscriber.email,
      subscriberName: subscriber.name,
    })

  } catch (err: any) {
    console.error('Preview email error:', err?.message)
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}

function getPredictedWindow(score: number): string {
  if (score >= 9) return '7–14 days'
  if (score >= 7) return '14–30 days'
  if (score >= 4) return '30–60 days'
  return 'Unlikely to churn soon'
}

function buildReason(subscriber: any): string {
  const parts: string[] = []
  if (subscriber.status === 'past_due') parts.push('recent failed payment')
  if (subscriber.lastActiveAt) {
    const days = Math.floor((Date.now() - new Date(subscriber.lastActiveAt).getTime()) / 86400000)
    if (days > 14) parts.push(`inactive for ${days} days`)
  }
  if (subscriber.startedAt) {
    const tenure = Math.floor((Date.now() - new Date(subscriber.startedAt).getTime()) / 86400000)
    if (tenure < 30) parts.push('new subscriber')
  }
  return parts.length > 0 ? parts.join(', ').replace(/^./, c => c.toUpperCase()) : 'High churn risk detected'
}
