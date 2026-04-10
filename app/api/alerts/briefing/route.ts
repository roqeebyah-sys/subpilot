import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { generateDailyBriefing } from '@/lib/ai-insights'
import { sendBriefingEmail } from '@/lib/email-service'
import { checkAiLimit } from '@/lib/ratelimit'

export const maxDuration = 30

// ── Shared helper to gather metrics and generate briefing text ────────────────

async function buildBriefing(userId: string) {
  await connectDB()
  const subscribers = await Subscriber.find({ userId })

  const active    = subscribers.filter(s => s.status === 'active')
  const cancelled = subscribers.filter(s => s.status === 'cancelled')
  const mrr       = Math.round(active.reduce((sum, s) => sum + (s.amount || 0), 0) / 100)
  const churnRate = subscribers.length > 0
    ? ((cancelled.length / subscribers.length) * 100).toFixed(1) : '0.0'

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const atRisk = active.filter(s =>
    (s.churnScore !== null && s.churnScore >= 7) ||
    (!s.lastActiveAt || new Date(s.lastActiveAt) < fourteenDaysAgo)
  )

  const revenueAtRisk  = Math.round(atRisk.reduce((sum, s) => sum + (s.amount || 0), 0) / 100)
  const criticalCount  = subscribers.filter(s => s.churnScore !== null && s.churnScore >= 9).length
  const monthStart     = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const newThisMonth   = subscribers.filter(s => s.startedAt && new Date(s.startedAt) >= monthStart).length
  const cancelledThisMonth = cancelled.filter(s => s.cancelledAt && new Date(s.cancelledAt) >= monthStart).length

  const briefingText = await generateDailyBriefing({
    mrr, activeSubscribers: active.length, churnRate,
    atRiskCount: atRisk.length, revenueAtRisk, criticalCount, newThisMonth, cancelledThisMonth,
  })

  const topPriority = atRisk.length > 0
    ? `Contact your ${atRisk.length} at-risk subscriber${atRisk.length > 1 ? 's' : ''} today — $${revenueAtRisk}/mo at risk`
    : 'All subscribers look healthy — focus on growth today'

  const topActions = buildTopActions(atRisk, subscribers)

  return { mrr, active, atRisk, revenueAtRisk, churnRate, briefingText, topPriority, topActions }
}

// GET /api/alerts/briefing — preview without sending
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Upstash rate limit: 20 AI generations per minute per user
    const limit = await checkAiLimit(session.user.id)
    if (limit.limited) {
      return NextResponse.json({ error: 'Rate limit reached. Try again shortly.' }, { status: 429 })
    }

    const { briefingText, topPriority, topActions, mrr, active, atRisk, revenueAtRisk, churnRate } =
      await buildBriefing(session.user.id)

    return NextResponse.json({
      briefingText,
      topPriority,
      topActions,
      metrics: { mrr, activeSubscribers: active.length, atRiskCount: atRisk.length, revenueAtRisk, churnRate },
    })
  } catch (err: any) {
    console.error('Briefing preview error:', err?.message)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}

// POST /api/alerts/briefing
// Computes today's metrics, generates a Claude briefing, and emails it
// to the account owner via Resend.

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Upstash rate limit: 20 AI generations per minute per user
    const limit = await checkAiLimit(session.user.id)
    if (limit.limited) {
      return NextResponse.json({ error: 'Rate limit reached. Try again shortly.' }, { status: 429 })
    }

    const { mrr, active, atRisk, revenueAtRisk, churnRate, briefingText, topPriority, topActions } =
      await buildBriefing(session.user.id)

    const result = await sendBriefingEmail({
      ownerEmail: session.user.email,
      ownerName: session.user.name?.split(' ')[0] || 'there',
      metrics: { mrr, activeSubscribers: active.length, atRiskCount: atRisk.length, revenueAtRisk, churnRate },
      briefingText,
      topPriority,
      topActions,
    })

    return NextResponse.json({ sent: true, emailId: (result as any).data?.id })

  } catch (error: any) {
    console.error('Briefing email error:', error?.message)
    return NextResponse.json({ error: 'Failed to send briefing' }, { status: 500 })
  }
}

// ── ACTION BUILDER ────────────────────────────────────────────────────────────

type Action = { label: string; description: string; urgency: 'critical' | 'high' | 'medium' }

function buildTopActions(atRisk: any[], allSubscribers: any[]): Action[] {
  const actions: Action[] = []

  // Action 1 — critical churn scores
  const critical = atRisk.filter(s => s.churnScore !== null && s.churnScore >= 9)
  if (critical.length > 0) {
    actions.push({
      label: `Reach out to ${critical[0].name || 'a critical subscriber'}`,
      description: `Score ${critical[0].churnScore}/10 — predicted to churn within 7–14 days. Send the AI-drafted win-back email.`,
      urgency: 'critical',
    })
  }

  // Action 2 — past due payments
  const pastDue = allSubscribers.filter(s => s.status === 'past_due')
  if (pastDue.length > 0) {
    actions.push({
      label: `Retry payment for ${pastDue.length} past-due subscriber${pastDue.length > 1 ? 's' : ''}`,
      description: `$${Math.round(pastDue.reduce((s: number, x: any) => s + (x.amount || 0), 0) / 100)}/mo in failed payments. Reach out now before they churn.`,
      urgency: 'high',
    })
  }

  // Action 3 — high-risk inactive subscribers
  const highRisk = atRisk.filter(s => s.churnScore !== null && s.churnScore >= 7 && s.churnScore < 9)
  if (highRisk.length > 0 && actions.length < 3) {
    actions.push({
      label: `Check in with ${highRisk.length} high-risk subscriber${highRisk.length > 1 ? 's' : ''}`,
      description: `Scores 7–8/10. A personal check-in email now can prevent cancellation.`,
      urgency: 'high',
    })
  }

  // Fallback — general at-risk
  if (atRisk.length > 0 && actions.length < 3) {
    actions.push({
      label: `Review at-risk subscribers`,
      description: `${atRisk.length} subscriber${atRisk.length > 1 ? 's' : ''} showing early churn signals. Open SubPilot for details.`,
      urgency: 'medium',
    })
  }

  return actions.slice(0, 3)
}
