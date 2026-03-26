import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { User } from '@/models/User'

// How many subscribers each plan can see on the dashboard
const PLAN_LIMITS: Record<string, number> = {
  starter: 100,
  growth:  500,
  pro:     Infinity,
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // Get user plan fresh from DB (JWT may be stale after upgrade)
    const user  = await User.findById(userId).select('plan').lean() as { plan?: string } | null
    const plan  = (user?.plan as string) || 'starter'
    const limit = PLAN_LIMITS[plan] ?? 100

    // Get all subscribers for this user
    const subscribers = await Subscriber.find({ userId }).sort({ startedAt: -1 })

    // ── METRICS ──────────────────────────────────────────────────────

    const active = subscribers.filter(s => s.status === 'active')
    const cancelled = subscribers.filter(s => s.status === 'cancelled')
    const pastDue = subscribers.filter(s => s.status === 'past_due')

    // MRR — sum of all active subscriber amounts (stored in cents)
    const mrr = active.reduce((sum, s) => sum + (s.amount || 0), 0) / 100

    // Churn rate — cancelled / total as a percentage
    const churnRate = subscribers.length > 0
      ? ((cancelled.length / subscribers.length) * 100).toFixed(1)
      : '0.0'

    // Average revenue per user
    const arpu = active.length > 0
      ? (mrr / active.length).toFixed(0)
      : '0'

    // ── MRR HISTORY (last 6 months) ──────────────────────────────────
    // Build a simple month-by-month MRR chart
    const mrrHistory = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthLabel = monthDate.toLocaleString('default', { month: 'short' })

      // Count subscribers active during this month
      const activeInMonth = subscribers.filter(s => {
        const started = s.startedAt ? new Date(s.startedAt) : null
        const cancelled = s.cancelledAt ? new Date(s.cancelledAt) : null
        if (!started) return false
        if (started > monthEnd) return false
        if (cancelled && cancelled < monthDate) return false
        return true
      })

      const monthMrr = activeInMonth.reduce((sum, s) => sum + (s.amount || 0), 0) / 100

      mrrHistory.push({
        month: monthLabel,
        mrr: Math.round(monthMrr),
      })
    }

    // ── AT RISK SUBSCRIBERS ──────────────────────────────────────────
    // Flag subscribers who haven't been active in 14+ days
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const atRisk = active.filter(s => {
      if (!s.lastActiveAt) return true
      return new Date(s.lastActiveAt) < fourteenDaysAgo
    })

    // ── FORMAT SUBSCRIBER LIST ───────────────────────────────────────
    // Apply plan limit — subscribers beyond the cap are not returned
    const cappedSubscribers = limit === Infinity
      ? subscribers
      : subscribers.slice(0, limit)

    const subscriberList = cappedSubscribers.map(s => ({
      id: s._id.toString(),
      name: s.name || 'Unknown',
      email: s.email,
      plan: s.plan || 'Unknown',
      amount: (s.amount || 0) / 100,
      status: s.status,
      source: s.source,
      startedAt: s.startedAt,
      lastActiveAt: s.lastActiveAt,
      churnScore: s.churnScore,
      daysInactive: s.lastActiveAt
        ? Math.floor((Date.now() - new Date(s.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }))

    return NextResponse.json({
      planInfo: {
        plan,
        limit:   limit === Infinity ? null : limit,
        total:   subscribers.length,     // real total before cap
        shown:   cappedSubscribers.length,
        atLimit: limit !== Infinity && subscribers.length >= limit,
      },
      metrics: {
        mrr: Math.round(mrr),
        activeSubscribers: active.length,
        cancelledSubscribers: cancelled.length,
        pastDue: pastDue.length,
        churnRate,
        arpu,
        totalSubscribers: subscribers.length,
        atRiskCount: atRisk.length,
        revenueAtRisk: Math.round(atRisk.reduce((sum, s) => sum + (s.amount || 0), 0) / 100),
      },
      mrrHistory,
      subscribers: subscriberList,
      atRisk: atRisk.slice(0, 10).map(s => ({
        id: s._id.toString(),
        name: s.name || 'Unknown',
        email: s.email,
        amount: (s.amount || 0) / 100,
        plan: s.plan,
        churnScore: s.churnScore ?? undefined,
        daysInactive: s.lastActiveAt
          ? Math.floor((Date.now() - new Date(s.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
    })

  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}