'use client'

import { useState } from 'react'

type Action = {
  id: string
  urgency: 'critical' | 'high' | 'medium'
  label: string
  description: string
  subscriberEmail?: string
  subscriberName?: string
  subscriberId?: string
  actionType: 'email' | 'retry' | 'review'
}

type Props = {
  atRisk: {
    id: string
    name: string
    email: string
    amount: number
    plan: string
    daysInactive: number | null
    churnScore?: number
  }[]
  pastDueCount: number
  metrics: {
    atRiskCount: number
    revenueAtRisk: number
  }
}

export default function ActionCentre({ atRisk, pastDueCount, metrics }: Props) {
  const [sending, setSending] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const actions = buildActions(atRisk, pastDueCount, metrics)

  if (actions.length === 0) return null

  async function handleAction(action: Action) {
    setSending(action.id)
    setError(null)

    try {
      if (action.actionType === 'email' && action.subscriberId) {
        const res = await fetch('/api/alerts/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriberId: action.subscriberId }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
      }

      setDone(prev => new Set([...prev, action.id]))
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSending(null)
    }
  }

  const urgencyStyles = {
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      badge: 'bg-red-500/20 text-red-400',
      dot: 'bg-red-400',
      button: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
      number: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    high: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/5',
      badge: 'bg-orange-500/20 text-orange-400',
      dot: 'bg-orange-400',
      button: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400',
      number: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    medium: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/20 text-amber-400',
      dot: 'bg-amber-400',
      button: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400',
      number: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
  }

  const actionLabel = (action: Action) => {
    if (action.actionType === 'email') return 'Send alert email'
    if (action.actionType === 'retry') return 'View in Stripe'
    return 'Run churn analysis'
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold">Do these {actions.length} things today</h2>
          <p className="text-xs text-white/40 mt-0.5">Highest-impact actions to prevent churn right now</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/40">{metrics.atRiskCount} at risk · ${metrics.revenueAtRisk}/mo</span>
        </div>
      </div>

      {/* Action list */}
      <div className="space-y-3">
        {actions.map((action, i) => {
          const styles = urgencyStyles[action.urgency]
          const isDone = done.has(action.id)
          const isSending = sending === action.id

          return (
            <div
              key={action.id}
              className={`rounded-xl border px-4 py-4 transition-all ${
                isDone
                  ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60'
                  : `${styles.border} ${styles.bg}`
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Number badge */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : styles.number
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-white">{action.label}</span>
                    {!isDone && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                        {action.urgency}
                      </span>
                    )}
                    {isDone && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{action.description}</p>
                </div>

                {/* Action button */}
                {!isDone && (
                  <button
                    onClick={() => handleAction(action)}
                    disabled={isSending || !!sending}
                    className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${styles.button}`}
                  >
                    {isSending ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : actionLabel(action)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {done.size === actions.length && actions.length > 0 && (
        <div className="mt-4 text-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-3">
          All done for today 🎉 Check back tomorrow for new actions.
        </div>
      )}
    </div>
  )
}

// ── ACTION BUILDER ────────────────────────────────────────────────────────────

function buildActions(
  atRisk: Props['atRisk'],
  pastDueCount: number,
  metrics: Props['metrics']
): Action[] {
  const actions: Action[] = []

  // 1. Most critical subscriber — highest churn score or longest inactive
  const sorted = [...atRisk].sort((a, b) => {
    const scoreA = a.churnScore ?? 0
    const scoreB = b.churnScore ?? 0
    if (scoreB !== scoreA) return scoreB - scoreA
    return (b.daysInactive ?? 0) - (a.daysInactive ?? 0)
  })

  if (sorted.length > 0) {
    const top = sorted[0]
    const score = top.churnScore
    const urgency = score !== undefined && score >= 9 ? 'critical' : score !== undefined && score >= 7 ? 'high' : 'medium'

    actions.push({
      id: `email-${top.id}`,
      urgency,
      label: `Send win-back email to ${top.name}`,
      description: score !== undefined
        ? `Churn score ${score}/10 · $${top.amount}/mo · ${top.daysInactive ? `${top.daysInactive}d inactive` : 'no recent activity'}. Click to send an AI-drafted alert to your inbox.`
        : `${top.daysInactive ? `${top.daysInactive}d inactive` : 'No recent activity'} · $${top.amount}/mo. A personal email could save this subscription.`,
      subscriberEmail: top.email,
      subscriberName: top.name,
      subscriberId: top.id,
      actionType: 'email',
    })
  }

  // 2. Past-due payments
  if (pastDueCount > 0) {
    actions.push({
      id: 'retry-payments',
      urgency: 'high',
      label: `Retry ${pastDueCount} failed payment${pastDueCount > 1 ? 's' : ''}`,
      description: `Failed payments convert to cancellations within days. Go to Stripe and trigger a manual payment retry or send a payment update link.`,
      actionType: 'retry',
    })
  }

  // 3. Second-highest risk subscriber (if different from top)
  if (sorted.length > 1 && actions.length < 3) {
    const second = sorted[1]
    const score = second.churnScore
    actions.push({
      id: `email-${second.id}`,
      urgency: score !== undefined && score >= 7 ? 'high' : 'medium',
      label: `Send win-back email to ${second.name}`,
      description: score !== undefined
        ? `Churn score ${score}/10 · $${second.amount}/mo · ${second.daysInactive ? `${second.daysInactive}d inactive` : 'no recent activity'}.`
        : `$${second.amount}/mo · ${second.daysInactive ? `${second.daysInactive}d inactive` : 'no recent activity'}.`,
      subscriberEmail: second.email,
      subscriberName: second.name,
      subscriberId: second.id,
      actionType: 'email',
    })
  }

  // 4. Fallback — run churn analysis if nothing scored
  if (actions.length === 0 && metrics.atRiskCount > 0) {
    actions.push({
      id: 'run-churn',
      urgency: 'medium',
      label: 'Run churn analysis',
      description: `${metrics.atRiskCount} subscribers look inactive. Score them now to see who needs attention.`,
      actionType: 'review',
    })
  }

  return actions.slice(0, 3)
}
