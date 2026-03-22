import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type ChurnFactors = {
  activity: number
  payment: number
  tenure: number
  value: number
}

export type ChurnResult = {
  score: number
  label: 'Low' | 'Medium' | 'High' | 'Critical'
  factors: ChurnFactors
  reason: string
  predictedChurnWindow: string
}

// ── INDIVIDUAL RISK CALCULATORS ───────────────────────────────────────────────

function calcActivityRisk(daysInactive: number, expectedUsageInterval: number): number {
  // How overdue are they relative to expected usage?
  // e.g. inactive 20 days, expected every 7 days → (20/7)*5 = 14.28 → capped at 10
  return Math.min(10, (daysInactive / expectedUsageInterval) * 5)
}

function calcPaymentRisk(
  failedPaymentRecent: boolean,
  paymentRetryPending: boolean,
  cardExpiring: boolean
): number {
  if (failedPaymentRecent) return 10
  if (paymentRetryPending) return 7
  if (cardExpiring) return 5
  return 0
}

function calcTenureRisk(tenureDays: number): number {
  if (tenureDays < 30) return 8   // brand new — highest risk
  if (tenureDays < 90) return 5   // still early
  return 2                         // established subscriber — lowest risk
}

function calcValueRisk(planPrice: number, maxPlanPrice: number): number {
  // Lower value plans = higher risk (more price sensitive)
  // e.g. $29 plan, max $149 → 10 - (29/149 * 10) = 10 - 1.95 = 8.05
  if (maxPlanPrice === 0) return 5 // unknown pricing — neutral
  return 10 - ((planPrice / maxPlanPrice) * 10)
}

// ── LABEL + WINDOW ────────────────────────────────────────────────────────────

function getLabel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

function getPredictedChurnWindow(score: number): string {
  if (score >= 9) return '7–14 days'
  if (score >= 7) return '14–30 days'
  if (score >= 4) return '30–60 days'
  return 'Unlikely to churn soon'
}

function buildReason(
  factors: ChurnFactors,
  daysInactive: number,
  failedPayment: boolean,
  cardExpiring: boolean,
  tenureDays: number
): string {
  const parts: string[] = []

  if (factors.activity >= 7)       parts.push(`inactive for ${daysInactive} days`)
  else if (factors.activity >= 4)  parts.push(`${daysInactive} days since last activity`)

  if (failedPayment)               parts.push('recent failed payment')
  else if (cardExpiring)           parts.push('card expiring soon')

  if (tenureDays < 30)             parts.push('new subscriber')
  else if (tenureDays < 90)        parts.push('still in early tenure')

  if (factors.value >= 7)          parts.push('on a low-value plan')

  if (parts.length === 0) return 'Subscriber looks healthy'
  return parts.join(', ').replace(/^./, c => c.toUpperCase())
}

// ── MAIN SCORE CALCULATOR ─────────────────────────────────────────────────────

export function calculateChurnScore(params: {
  daysInactive: number
  expectedUsageInterval: number
  failedPaymentRecent: boolean
  paymentRetryPending: boolean
  cardExpiring: boolean
  tenureDays: number
  planPrice: number
  maxPlanPrice: number
}): ChurnResult {
  const {
    daysInactive, expectedUsageInterval,
    failedPaymentRecent, paymentRetryPending, cardExpiring,
    tenureDays, planPrice, maxPlanPrice,
  } = params

  // ── Calculate individual risks ──
  const activityRisk = calcActivityRisk(daysInactive, expectedUsageInterval)
  const paymentRisk  = calcPaymentRisk(failedPaymentRecent, paymentRetryPending, cardExpiring)
  const tenureRisk   = calcTenureRisk(tenureDays)
  const valueRisk    = calcValueRisk(planPrice, maxPlanPrice)

  const factors: ChurnFactors = {
    activity: Math.round(activityRisk * 10) / 10,
    payment:  paymentRisk,
    tenure:   tenureRisk,
    value:    Math.round(valueRisk * 10) / 10,
  }

  // ── Weighted formula ──
  // activity: 40% | payment: 30% | tenure: 15% | value: 15%
  let score =
    (activityRisk * 0.4) +
    (paymentRisk  * 0.3) +
    (tenureRisk   * 0.15) +
    (valueRisk    * 0.15)

  // ── Spike conditions — override if serious signals present ──
  if (daysInactive > 45) {
    score = Math.max(score, 8)
  }
  if (failedPaymentRecent && daysInactive > 14) {
    score = Math.max(score, 9)
  }

  // ── Clamp between 0 and 10 ──
  score = Math.min(Math.max(Math.round(score * 10) / 10, 0), 10)

  return {
    score,
    label: getLabel(score),
    factors,
    reason: buildReason(factors, daysInactive, failedPaymentRecent, cardExpiring, tenureDays),
    predictedChurnWindow: getPredictedChurnWindow(score),
  }
}

// ── EXTRACT PARAMS FROM SUBSCRIBER DOCUMENT ───────────────────────────────────

function subscriberToParams(subscriber: any, maxPlanPrice: number) {
  const daysInactive = subscriber.lastActiveAt
    ? Math.floor((Date.now() - new Date(subscriber.lastActiveAt).getTime()) / 86400000)
    : 30 // assume 30 days if unknown

  const tenureDays = subscriber.startedAt
    ? Math.floor((Date.now() - new Date(subscriber.startedAt).getTime()) / 86400000)
    : 0

  const planPrice = (subscriber.amount || 0) / 100 // cents to dollars

  return {
    daysInactive,
    expectedUsageInterval: 7, // assume weekly usage as baseline
    failedPaymentRecent: subscriber.status === 'past_due',
    paymentRetryPending: subscriber.metadata?.paymentRetryPending || false,
    cardExpiring: subscriber.metadata?.cardExpiring || false,
    tenureDays,
    planPrice,
    maxPlanPrice,
  }
}

// ── SCORE ALL SUBSCRIBERS FOR A USER ─────────────────────────────────────────

export async function scoreSubscribers(userId: string) {
  await connectDB()

  const subscribers = await Subscriber.find({
    userId,
    status: { $in: ['active', 'past_due', 'paused', 'trialing'] },
  })

  // Find highest plan price to normalise value risk
  const maxPlanPrice = Math.max(
    ...subscribers.map(s => (s.amount || 0) / 100),
    1 // prevent divide by zero
  )

  const results = []

  for (const subscriber of subscribers) {
    const params = subscriberToParams(subscriber, maxPlanPrice)
    const scoring = calculateChurnScore(params)

    // Persist score to MongoDB
    await Subscriber.findByIdAndUpdate(subscriber._id, {
      churnScore: scoring.score,
      churnScoreUpdatedAt: new Date(),
    })

    results.push({
      id: subscriber._id.toString(),
      name: subscriber.name || 'Unknown',
      email: subscriber.email,
      amount: (subscriber.amount || 0) / 100,
      plan: subscriber.plan,
      ...scoring,
    })
  }

  // Highest risk first
  results.sort((a, b) => b.score - a.score)

  return {
    scored: results.length,
    results,
    critical: results.filter(r => r.label === 'Critical').length,
    high:     results.filter(r => r.label === 'High').length,
    medium:   results.filter(r => r.label === 'Medium').length,
    low:      results.filter(r => r.label === 'Low').length,
  }
}