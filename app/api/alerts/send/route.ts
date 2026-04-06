import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { generateWinBackEmail } from '@/lib/ai-insights'
import { sendChurnAlertEmail } from '@/lib/email-service'
import { parseBody, sendAlertSchema } from '@/lib/validations'

export const maxDuration = 30

// POST /api/alerts/send
// Finds all subscribers with churnScore >= 7 and sends the account owner
// a churn alert email for each, with an AI-generated win-back draft.
// Accepts optional body: { subscriberId } to alert for a single subscriber.

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const parsed = await parseBody(req, sendAlertSchema)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
    const { subscriberId } = parsed.data

    await connectDB()

    const query: Record<string, any> = {
      userId: session.user.id,
      churnScore: { $gte: 7 },
      status: { $in: ['active', 'past_due', 'trialing'] },
    }

    if (subscriberId) {
      query._id = subscriberId
    }

    const atRisk = await Subscriber.find(query).sort({ churnScore: -1 }).limit(10)

    if (atRisk.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No high-risk subscribers found' })
    }

    const ownerEmail = session.user.email
    const ownerName = session.user.name?.split(' ')[0] || 'there'
    const businessName = session.user.name || 'your business'

    const sent: string[] = []
    const failed: string[] = []

    for (const subscriber of atRisk) {
      try {
        const daysInactive = subscriber.lastActiveAt
          ? Math.floor((Date.now() - new Date(subscriber.lastActiveAt).getTime()) / 86400000)
          : 30

        const tenureDays = subscriber.startedAt
          ? Math.floor((Date.now() - new Date(subscriber.startedAt).getTime()) / 86400000)
          : 0

        const amount = (subscriber.amount || 0) / 100

        // Generate personalised win-back email via Claude
        const winBackEmail = await generateWinBackEmail({
          businessName,
          subscriberName: subscriber.name || 'Subscriber',
          subscriberEmail: subscriber.email,
          planName: subscriber.plan || 'your plan',
          monthlyAmount: amount,
          daysInactive,
          churnScore: subscriber.churnScore,
          churnReason: buildReason(subscriber),
          predictedWindow: getPredictedWindow(subscriber.churnScore),
        })

        // Send the alert email via Resend
        await sendChurnAlertEmail({
          ownerEmail,
          ownerName,
          subscriber: {
            name: subscriber.name || 'Unknown',
            email: subscriber.email,
            plan: subscriber.plan || 'Unknown',
            amount,
            churnScore: subscriber.churnScore,
            label: getLabel(subscriber.churnScore),
            reason: buildReason(subscriber),
            predictedChurnWindow: getPredictedWindow(subscriber.churnScore),
          },
          winBackEmail,
        })

        sent.push(subscriber.email)
      } catch (err) {
        console.error(`Failed to alert for ${subscriber.email}:`, err)
        failed.push(subscriber.email)
      }
    }

    return NextResponse.json({
      sent: sent.length,
      failed: failed.length,
      subscribers: sent,
    })

  } catch (error: any) {
    console.error('Alert send error:', error?.message)
    return NextResponse.json({ error: 'Failed to send alerts' }, { status: 500 })
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getLabel(score: number): string {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
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

  return parts.length > 0
    ? parts.join(', ').replace(/^./, c => c.toUpperCase())
    : 'High churn risk detected'
}
