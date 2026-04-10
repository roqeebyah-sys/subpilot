import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { scoreSubscribers } from '@/lib/churn-scoring'
import { getTrialInfo } from '@/lib/trial'
import { checkAiLimit } from '@/lib/ratelimit'

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

    await connectDB()
    const user = await User.findById(session.user.id).select('plan createdAt').lean() as { plan?: string; createdAt: Date } | null
    const trial = getTrialInfo(user?.createdAt ?? new Date(), user?.plan ?? 'starter')
    if (trial.expired) {
      return NextResponse.json({ error: 'Your free trial has ended. Upgrade to run churn analysis.', trialExpired: true }, { status: 403 })
    }

    const results = await scoreSubscribers(session.user.id)

    return NextResponse.json({
      success: true,
      ...results,
    })

  } catch (error: any) {
    console.error('Churn scoring error:', error?.message)
    return NextResponse.json(
      { error: 'Failed to score subscribers' },
      { status: 500 }
    )
  }
}