import Anthropic from '@anthropic-ai/sdk'
import { calculateChurnScore } from './churn-scoring'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type SubscriberInsight = {
  subscriberId: string
  name: string
  email: string
  score: number
  label: string
  reason: string
  predictedChurnWindow: string
  emailSubject: string
  emailBody: string
  talkingPoints: string[]
}

export type DailyBriefing = {
  summary: string
  topPriority: string
  opportunities: string[]
  insights: SubscriberInsight[]
  generatedAt: string
}

// ── WIN-BACK EMAIL GENERATOR ──────────────────────────────────────────────────
// Generates a personalised win-back email for a single at-risk subscriber

export async function generateWinBackEmail(params: {
  businessName: string
  subscriberName: string
  subscriberEmail: string
  planName: string
  monthlyAmount: number
  daysInactive: number
  churnScore: number
  churnReason: string
  predictedWindow: string
}): Promise<{ subject: string; body: string; talkingPoints: string[] }> {

  const prompt = `You are a customer success expert helping a subscription business retain a customer.

Business context:
- Subscriber: ${params.subscriberName} (${params.subscriberEmail})
- Plan: ${params.planName} at $${params.monthlyAmount}/month
- Days inactive: ${params.daysInactive} days
- Churn risk score: ${params.churnScore}/10 (${params.churnReason})
- Predicted to churn within: ${params.predictedWindow}

Write a genuine, personal win-back email that:
1. Doesn't mention churn scores or analytics
2. Feels like it's from a real person, not automated
3. Acknowledges they haven't been active recently
4. Offers real value — a tip, a feature they might have missed, or a conversation
5. Has a single clear call to action
6. Is under 150 words
7. Tone: warm, genuine, not salesy

Return ONLY a JSON object with these exact fields:
{
  "subject": "email subject line",
  "body": "full email body with Dear [Name] and signature",
  "talkingPoints": ["point 1", "point 2", "point 3"]
}

talkingPoints are 3 short bullet points the sender could use in a follow-up call.
No markdown, no explanation — just the JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      subject: `Checking in, ${params.subscriberName}`,
      body: `Hi ${params.subscriberName},\n\nI noticed you haven't logged in for a while and wanted to check in. Is there anything I can help with?\n\nBest,\nThe Team`,
      talkingPoints: ['Ask about their experience', 'Offer a walkthrough', 'Ask what would make it more useful'],
    }
  }
}

// ── DAILY BRIEFING GENERATOR ──────────────────────────────────────────────────
// Generates a plain-English morning briefing for the business owner

export async function generateDailyBriefing(params: {
  mrr: number
  activeSubscribers: number
  churnRate: string
  atRiskCount: number
  revenueAtRisk: number
  criticalCount: number
  newThisMonth: number
  cancelledThisMonth: number
}): Promise<string> {

  const prompt = `You are a financial advisor giving a subscription business owner their daily briefing.

Today's data:
- MRR: $${params.mrr}
- Active subscribers: ${params.activeSubscribers}
- Churn rate: ${params.churnRate}%
- At-risk subscribers: ${params.atRiskCount} (${params.criticalCount} critical)
- Revenue at risk: $${params.revenueAtRisk}/mo
- New this month: ${params.newThisMonth}
- Cancelled this month: ${params.cancelledThisMonth}

Write a 3-sentence morning briefing that:
1. Starts with the most important thing they need to know today
2. Gives them one specific number to focus on
3. Ends with one clear action they should take before noon

Tone: direct, confident, like a trusted advisor. No fluff. No bullet points. Just 3 sentences.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text'
    ? response.content[0].text
    : 'Your subscription business is being monitored. Check your at-risk subscribers today.'
}

// ── REVENUE OPPORTUNITY DETECTOR ─────────────────────────────────────────────
// Finds upgrade and expansion opportunities

export async function detectOpportunities(subscribers: {
  name: string
  plan: string
  amount: number
  daysSubscribed: number
  status: string
}[]): Promise<string[]> {

  if (subscribers.length === 0) return []

  const prompt = `You are a revenue growth advisor for a subscription business.

Current subscribers:
${subscribers.map(s => `- ${s.name}: ${s.plan} plan ($${s.amount}/mo), ${s.daysSubscribed} days subscribed, status: ${s.status}`).join('\n')}

Identify 2-3 specific revenue opportunities. Each should be:
- Actionable within the next 7 days
- Specific to the actual data above
- Focused on expansion revenue, not new customers

Return ONLY a JSON array of strings. Each string is one opportunity under 20 words.
Example: ["5 Starter plan users have been active 90+ days — ready for a Growth plan upgrade offer"]
No explanation, just the array.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

// ── FULL INSIGHT GENERATION ───────────────────────────────────────────────────
// Runs everything together and returns the complete daily briefing

export async function generateFullInsights(params: {
  userId: string
  businessName: string
  metrics: {
    mrr: number
    activeSubscribers: number
    churnRate: string
    atRiskCount: number
    revenueAtRisk: number
    totalSubscribers: number
  }
  atRiskSubscribers: {
    id: string
    name: string
    email: string
    amount: number
    plan: string
    score: number
    label: string
    reason: string
    predictedChurnWindow: string
    daysInactive: number
  }[]
  allSubscribers: {
    name: string
    plan: string
    amount: number
    daysSubscribed: number
    status: string
  }[]
}): Promise<DailyBriefing> {

  const { metrics, atRiskSubscribers, allSubscribers, businessName } = params

  // Run briefing + opportunities in parallel — saves time
  const [briefing, opportunities] = await Promise.all([
    generateDailyBriefing({
      mrr: metrics.mrr,
      activeSubscribers: metrics.activeSubscribers,
      churnRate: metrics.churnRate,
      atRiskCount: metrics.atRiskCount,
      revenueAtRisk: metrics.revenueAtRisk,
      criticalCount: atRiskSubscribers.filter(s => s.label === 'Critical').length,
      newThisMonth: 0,
      cancelledThisMonth: 0,
    }),
    detectOpportunities(allSubscribers),
  ])

  // Generate win-back emails for at-risk subscribers (max 5 to control API costs)
  const insights: SubscriberInsight[] = []

  for (const subscriber of atRiskSubscribers.slice(0, 5)) {
    const email = await generateWinBackEmail({
      businessName,
      subscriberName: subscriber.name,
      subscriberEmail: subscriber.email,
      planName: subscriber.plan || 'your plan',
      monthlyAmount: subscriber.amount,
      daysInactive: subscriber.daysInactive || 0,
      churnScore: subscriber.score,
      churnReason: subscriber.reason,
      predictedWindow: subscriber.predictedChurnWindow,
    })

    insights.push({
      subscriberId: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      score: subscriber.score,
      label: subscriber.label,
      reason: subscriber.reason,
      predictedChurnWindow: subscriber.predictedChurnWindow,
      emailSubject: email.subject,
      emailBody: email.body,
      talkingPoints: email.talkingPoints,
    })
  }

  return {
    summary: briefing,
    topPriority: atRiskSubscribers.length > 0
      ? `Contact ${atRiskSubscribers[0].name} today — highest churn risk at ${atRiskSubscribers[0].score}/10`
      : 'All subscribers look healthy — focus on growth today',
    opportunities,
    insights,
    generatedAt: new Date().toISOString(),
  }
}