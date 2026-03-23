import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { generateFullInsights } from '@/lib/ai-insights'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // Get all subscribers
    const allSubscribers = await Subscriber.find({ userId })

    const active = allSubscribers.filter(s => s.status === 'active')
    const atRisk = allSubscribers
      .filter(s => s.churnScore && s.churnScore >= 4)
      .sort((a, b) => (b.churnScore || 0) - (a.churnScore || 0))

    const mrr = active.reduce((sum, s) => sum + (s.amount || 0), 0) / 100
    const cancelled = allSubscribers.filter(s => s.status === 'cancelled')
    const churnRate = allSubscribers.length > 0
      ? ((cancelled.length / allSubscribers.length) * 100).toFixed(1)
      : '0.0'

    // Build the data package for Claude
    const result = await generateFullInsights({
      userId,
      businessName: session.user.name || 'Your business',
      metrics: {
        mrr: Math.round(mrr),
        activeSubscribers: active.length,
        churnRate,
        atRiskCount: atRisk.length,
        revenueAtRisk: Math.round(atRisk.reduce((sum, s) => sum + (s.amount || 0), 0) / 100),
        totalSubscribers: allSubscribers.length,
      },
      atRiskSubscribers: atRisk.slice(0, 5).map(s => ({
        id: s._id.toString(),
        name: s.name || 'Unknown',
        email: s.email,
        amount: (s.amount || 0) / 100,
        plan: s.plan || 'Unknown',
        score: s.churnScore || 0,
        label: s.churnScore >= 9 ? 'Critical' : s.churnScore >= 7 ? 'High' : 'Medium',
        reason: 'Inactive and at risk',
        predictedChurnWindow: s.churnScore >= 9 ? '7–14 days' : '14–30 days',
        daysInactive: s.lastActiveAt
          ? Math.floor((Date.now() - new Date(s.lastActiveAt).getTime()) / 86400000)
          : 30,
      })),
      allSubscribers: active.map(s => ({
        name: s.name || 'Unknown',
        plan: s.plan || 'Unknown',
        amount: (s.amount || 0) / 100,
        daysSubscribed: s.startedAt
          ? Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 86400000)
          : 0,
        status: s.status,
      })),
    })

    return NextResponse.json({ success: true, ...result })

  } catch (error: any) {
    console.error('AI insights error:', error?.message)
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error?.message },
      { status: 500 }
    )
  }
}