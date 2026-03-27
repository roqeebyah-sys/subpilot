'use client'

import Link from 'next/link'

type Plan = 'starter' | 'growth' | 'pro'

const NEXT_PLAN: Record<Plan, { name: string; limit: string } | null> = {
  starter: { name: 'Pro',    limit: '2,000 supporters' },
  growth:  { name: 'Studio', limit: 'unlimited supporters' },
  pro:     null,
}

const PLAN_LABELS: Record<Plan, string> = {
  starter: 'Creator',
  growth:  'Pro',
  pro:     'Studio',
}

export default function UpgradePrompt({
  plan,
  total,
  limit,
}: {
  plan: Plan
  total: number        // how many subscribers the user actually has
  limit: number        // the plan cap
}) {
  const next       = NEXT_PLAN[plan]
  const pct        = Math.min(100, Math.round((total / limit) * 100))
  const atCap      = total >= limit
  const nearCap    = pct >= 80

  if (!next) return null   // Pro users have no limit — nothing to show

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-4 ${
      atCap
        ? 'bg-red-500/[0.04]  border-red-500/20'
        : 'bg-amber-500/[0.04] border-amber-500/20'
    }`}>

      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
        atCap ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
      }`}>
        {atCap ? '⚠' : '↑'}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-sm font-semibold ${atCap ? 'text-red-400' : 'text-amber-400'}`}>
            {atCap
              ? `${PLAN_LABELS[plan]} plan limit reached`
              : `Approaching ${PLAN_LABELS[plan]} plan limit`}
          </span>
        </div>
        <p className="text-xs text-white/45 mb-3 leading-relaxed">
          {atCap
            ? `You have ${total.toLocaleString()} subscribers but your ${PLAN_LABELS[plan]} plan only shows ${limit.toLocaleString()}. Upgrade to ${next.name} to unlock ${next.limit}.`
            : `You're at ${pct}% of your ${limit.toLocaleString()}-subscriber limit. Upgrade before you hit the cap.`}
        </p>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all ${
              atCap ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50">
            {total.toLocaleString()} / {limit.toLocaleString()} subscribers shown
          </span>
          <Link
            href="/billing"
            className={`ml-auto flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              atCap
                ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            Upgrade to {next.name} →
          </Link>
        </div>
      </div>
    </div>
  )
}
