import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { message, history } = await req.json()

    await connectDB()

    // Pull subscriber context so Claude knows their actual business data
    const subscribers = await Subscriber.find({ userId: session.user.id })
    const active = subscribers.filter(s => s.status === 'active')
    const atRisk = subscribers.filter(s => s.churnScore && s.churnScore >= 6)
    const mrr = active.reduce((sum, s) => sum + (s.amount || 0), 0) / 100

    const systemPrompt = `You are SubPilot's AI assistant — a specialist in subscription business health, churn reduction, and revenue retention.

You ONLY answer questions related to:
- The user's subscriber data and churn risk
- Strategies to reduce churn and retain customers
- Subscription pricing and plan optimisation
- Win-back email strategies
- Revenue growth for subscription businesses

You NEVER answer questions unrelated to subscription business management.
If asked about anything else, politely redirect: "I'm focused on helping you retain subscribers and grow your MRR. Ask me anything about your subscription business!"

Current business context:
- MRR: $${Math.round(mrr)}
- Active subscribers: ${active.length}
- Total subscribers: ${subscribers.length}
- At-risk subscribers (score 6+): ${atRisk.length}
- At-risk revenue: $${Math.round(atRisk.reduce((sum, s) => sum + (s.amount || 0), 0) / 100)}/mo
- Top at-risk: ${atRisk.slice(0, 3).map(s => `${s.name || s.email} (score: ${s.churnScore}/10)`).join(', ') || 'None'}

Keep responses concise — 2-4 sentences max unless the user asks for detail.
Be direct and actionable. Always end with a specific next step.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        // Include conversation history for context
        ...(history || []).map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: message },
      ],
    })

    const reply = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I could not generate a response. Please try again.'

    return NextResponse.json({ reply })

  } catch (error: any) {
    console.error('AI chat error:', error?.message)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}