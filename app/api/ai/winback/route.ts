import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { User } from '@/models/User'
import { generateWinBackEmail } from '@/lib/ai-insights'
import { getTrialInfo } from '@/lib/trial'
import { checkAiLimit } from '@/lib/ratelimit'
import { parseBody, winbackSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Upstash rate limit: 20 AI generations per minute per user
    const limit = await checkAiLimit(session.user.id)
    if (limit.limited) {
      return NextResponse.json({ error: 'Rate limit reached. Try again shortly.' }, { status: 429 })
    }

    const parsed = await parseBody(req, winbackSchema)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
    const { subscriberId, tone } = parsed.data

    await connectDB()

    const user = await User.findById(session.user.id).select('plan createdAt').lean() as { plan?: string; createdAt: Date } | null
    const trial = getTrialInfo(user?.createdAt ?? new Date(), user?.plan ?? 'starter')
    if (trial.expired) {
      return NextResponse.json({ error: 'Your free trial has ended. Upgrade to send AI win-back emails.', trialExpired: true }, { status: 403 })
    }

    // Verify the subscriber belongs to this user
    const sub = await Subscriber.findOne({
      _id: subscriberId,
      userId: session.user.id,
    }).lean() as any

    if (!sub) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    const daysInactive = sub.lastActiveAt
      ? Math.floor((Date.now() - new Date(sub.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
      : 30

    const churnScore  = sub.churnScore ?? 5
    const churnReason = churnScore >= 9 ? 'critically inactive'
                      : churnScore >= 7 ? 'highly at risk'
                      : churnScore >= 5 ? 'moderately at risk'
                      : 'slightly at risk'

    const predictedWindow = churnScore >= 9 ? '7–14 days'
                          : churnScore >= 7 ? '14–30 days'
                          : '30–60 days'

    const toneLabel: Record<string, string> = {
      warm:         'warm and genuine, like a friend checking in',
      professional: 'professional and polished, clear business tone',
      casual:       'casual and relaxed, conversational and low-pressure',
      urgent:       'honest and direct about the risk of losing access, with a clear call to action',
    }

    const email = await generateWinBackEmail({
      businessName:    session.user.name || 'your business',
      subscriberName:  sub.name || 'there',
      subscriberEmail: sub.email,
      planName:        sub.plan || 'your plan',
      monthlyAmount:   (sub.amount || 0) / 100,
      daysInactive,
      churnScore,
      churnReason:     `${churnReason}. Tone: ${toneLabel[tone] ?? toneLabel.warm}`,
      predictedWindow,
    })

    return NextResponse.json(email)

  } catch (error: any) {
    console.error('Win-back email error:', error?.message)
    return NextResponse.json(
      { error: 'Failed to generate email', details: error?.message },
      { status: 500 }
    )
  }
}
