'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

// ─── Demo data ────────────────────────────────────────────────────────────────

const MRR_HISTORY = [
  { month: 'Oct', mrr: 3100 },
  { month: 'Nov', mrr: 3480 },
  { month: 'Dec', mrr: 3200 },
  { month: 'Jan', mrr: 3900 },
  { month: 'Feb', mrr: 4480 },
  { month: 'Mar', mrr: 4820 },
]

const AT_RISK = [
  { id: '1', name: 'James M.',  email: 'james@acmecorp.io',   plan: 'Pro',     amount: 49, score: 9, days: 34, reason: 'Never completed onboarding. No login in 34 days.' },
  { id: '2', name: 'Sarah K.',  email: 'sarah@stacklabs.com', plan: 'Growth',  amount: 29, score: 8, days: 21, reason: 'Has not used core feature in 3 weeks.' },
  { id: '3', name: 'David L.',  email: 'david@vaultco.io',   plan: 'Pro',     amount: 49, score: 7, days: 18, reason: 'Payment failed once, re-engaged briefly then dropped off.' },
  { id: '4', name: 'Priya N.',  email: 'priya@loopHQ.com',   plan: 'Starter', amount: 9,  score: 6, days: 15, reason: 'Onboarding incomplete, usage below baseline.' },
]

const ALL_SUBSCRIBERS = [
  { id: '1',  name: 'James M.',    email: 'james@acmecorp.io',     plan: 'Pro',     amount: 49,  status: 'active',    score: 9, days: 34 },
  { id: '2',  name: 'Sarah K.',    email: 'sarah@stacklabs.com',   plan: 'Growth',  amount: 29,  status: 'active',    score: 8, days: 21 },
  { id: '3',  name: 'David L.',    email: 'david@vaultco.io',      plan: 'Pro',     amount: 49,  status: 'past_due',  score: 7, days: 18 },
  { id: '4',  name: 'Priya N.',    email: 'priya@loopHQ.com',      plan: 'Starter', amount: 9,   status: 'active',    score: 6, days: 15 },
  { id: '5',  name: 'Tom B.',      email: 'tom@buildfast.dev',      plan: 'Growth',  amount: 29,  status: 'active',    score: 4, days: 7  },
  { id: '6',  name: 'Emma R.',     email: 'emma@helixai.io',        plan: 'Pro',     amount: 49,  status: 'active',    score: 2, days: 1  },
  { id: '7',  name: 'Carlos M.',   email: 'carlos@synapse.co',      plan: 'Growth',  amount: 29,  status: 'active',    score: 1, days: 0  },
  { id: '8',  name: 'Aisha T.',    email: 'aisha@fintechly.com',    plan: 'Pro',     amount: 49,  status: 'active',    score: 2, days: 2  },
  { id: '9',  name: 'Noah P.',     email: 'noah@gridworks.io',      plan: 'Starter', amount: 9,   status: 'cancelled', score: 10, days: 60 },
  { id: '10', name: 'Lily C.',     email: 'lily@craftbase.com',     plan: 'Growth',  amount: 29,  status: 'active',    score: 3, days: 3  },
  { id: '11', name: 'Raj S.',      email: 'raj@omnisync.io',        plan: 'Pro',     amount: 49,  status: 'active',    score: 1, days: 0  },
  { id: '12', name: 'Grace H.',    email: 'grace@luminary.co',      plan: 'Starter', amount: 9,   status: 'active',    score: 5, days: 10 },
  { id: '13', name: 'Ben W.',      email: 'ben@devpulse.io',        plan: 'Growth',  amount: 29,  status: 'past_due',  score: 8, days: 25 },
  { id: '14', name: 'Sofia A.',    email: 'sofia@arcflow.com',      plan: 'Pro',     amount: 49,  status: 'active',    score: 2, days: 1  },
  { id: '15', name: 'Kai L.',      email: 'kai@shipfaster.dev',     plan: 'Starter', amount: 9,   status: 'active',    score: 3, days: 4  },
]

const AI_EMAILS: Record<string, string> = {
  '1': `Hey James,\n\nI noticed you signed up for UserRetain a little over a month ago but haven't had a chance to get fully set up yet — totally understandable, onboarding can slip.\n\nI wanted to reach out personally. Would it help to jump on a 15-minute call? I can walk you through the setup and make sure you're getting value from day one.\n\nJust reply to this email and we'll find a time.\n\nBest,\nAlex`,
  '2': `Hi Sarah,\n\nQuick check-in — I saw you haven't used the churn scoring feature in a few weeks and wanted to make sure everything's okay.\n\nIs there something that's not clicking, or has it just been a busy season? Happy to share some quick wins other Growth plan users have been seeing.\n\nLet me know if a call would help.\n\nBest,\nAlex`,
  '3': `Hey David,\n\nI noticed there was a failed payment recently and wanted to make sure it didn't cause any disruption to your account.\n\nEverything should be back to normal — but if you ran into any friction or have questions about your plan, I'm here.\n\nJust reply and I'll sort it out for you.\n\nBest,\nAlex`,
  '4': `Hi Priya,\n\nI saw you signed up recently but haven't finished the onboarding flow yet. It only takes about 4 minutes to connect your Stripe account and see your first churn scores.\n\nWant me to send over a quick walkthrough video? Or if you prefer, I'm happy to jump on a screen share.\n\nBest,\nAlex`,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 9 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    score >= 7 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    score >= 5 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                 'bg-white/10 text-white/40 border-white/10'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {score}/10
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; bg: string; label: string }> = {
    active:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
    cancelled: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Cancelled' },
    past_due:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Past due' },
  }
  const c = map[status] ?? { dot: 'bg-white/20', text: 'text-white/40', bg: 'bg-white/5', label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${c.text} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

// ─── AI Email Modal ───────────────────────────────────────────────────────────

function EmailModal({ sub, onClose }: { sub: typeof AT_RISK[0]; onClose: () => void }) {
  const [stage, setStage] = useState<'generating' | 'done'>('generating')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStage('done'), 1800)
    return () => clearTimeout(t)
  }, [])

  function copy() {
    navigator.clipboard.writeText(AI_EMAILS[sub.id] || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <div className="text-sm font-semibold">AI win-back email</div>
            <div className="text-xs text-white/40 mt-0.5">For {sub.name} · {sub.plan} ${sub.amount}/mo</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="p-5">
          {stage === 'generating' ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm text-white/50">Generating personalised email…</div>
              <div className="text-xs text-white/25">Analysing {sub.days} days inactive · {sub.plan} plan · score {sub.score}/10</div>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4 text-xs text-white/50">
                <div className="flex gap-2"><span className="w-14 flex-shrink-0">To:</span><span className="text-white/80">{sub.email}</span></div>
                <div className="flex gap-2"><span className="w-14 flex-shrink-0">Subject:</span><span className="text-white/80">Quick check-in from the team</span></div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm text-[#e8eaed] leading-relaxed whitespace-pre-wrap font-mono text-xs">
                {AI_EMAILS[sub.id]}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={copy}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Copy email'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/60 text-xs font-medium py-2.5 rounded-lg transition-colors border border-white/[0.06]"
                >
                  Edit tone
                </button>
              </div>
              <p className="text-center text-[10px] text-white/20 mt-3">
                This is a demo.{' '}
                <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 underline">
                  Sign up
                </Link>{' '}
                to send real emails to your subscribers.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Subscriber detail panel ──────────────────────────────────────────────────

function SubPanel({ sub, onClose }: { sub: typeof ALL_SUBSCRIBERS[0]; onClose: () => void }) {
  const [emailOpen, setEmailOpen] = useState(false)
  const risk = sub.score >= 9 ? 'Critical' : sub.score >= 7 ? 'High' : sub.score >= 5 ? 'Medium' : 'Low'
  const riskColor = sub.score >= 9 ? 'text-red-400' : sub.score >= 7 ? 'text-orange-400' : sub.score >= 5 ? 'text-amber-400' : 'text-emerald-400'

  const atRiskSub = AT_RISK.find(r => r.id === sub.id)

  return (
    <>
      {emailOpen && atRiskSub && (
        <EmailModal sub={atRiskSub} onClose={() => setEmailOpen(false)} />
      )}
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-[#0d0d0d] border-l border-white/[0.06] h-full overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0d0d0d]">
            <div className="text-sm font-semibold">Subscriber profile</div>
            <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none">✕</button>
          </div>
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                {sub.name[0]}
              </div>
              <div>
                <div className="font-semibold text-sm">{sub.name}</div>
                <div className="text-xs text-white/40">{sub.email}</div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">Churn risk score</div>
              <div className="flex items-center gap-3">
                <div className={`text-4xl font-black ${riskColor}`}>{sub.score}</div>
                <div>
                  <div className={`text-sm font-semibold ${riskColor}`}>{risk} risk</div>
                  <div className="text-xs text-white/40">{sub.days > 0 ? `${sub.days} days inactive` : 'Active recently'}</div>
                </div>
              </div>
              {atRiskSub && (
                <p className="text-xs text-white/50 mt-3 leading-relaxed">{atRiskSub.reason}</p>
              )}
            </div>

            {/* Plan */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Subscription</div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Plan</span>
                <span className="font-medium">{sub.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">MRR</span>
                <span className="font-medium">${sub.amount}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Status</span>
                <StatusPill status={sub.status} />
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Activity timeline</div>
              <div className="space-y-3">
                {[
                  { label: 'Last login', val: sub.days > 0 ? `${sub.days} days ago` : 'Today' },
                  { label: 'Signed up', val: '4 months ago' },
                  { label: 'Last payment', val: sub.status === 'past_due' ? 'Failed 3 days ago' : '28 days ago' },
                  { label: 'Features used', val: sub.score >= 7 ? '1 of 6' : '4 of 6' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-white/40">{row.label}</span>
                    <span className="text-[#e8eaed]">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            {atRiskSub ? (
              <button
                onClick={() => setEmailOpen(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Generate AI win-back email →
              </button>
            ) : (
              <div className="text-center text-xs text-white/30 py-2">Low risk — no action needed</div>
            )}

            <Link
              href="/auth/signup"
              className="block w-full text-center bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-white/60 text-xs font-medium py-2.5 rounded-xl transition-colors"
            >
              Sign up to see your real subscribers →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main demo ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeSection, setSection] = useState<'overview' | 'subscribers' | 'tools'>('overview')
  const [emailModal, setEmailModal] = useState<typeof AT_RISK[0] | null>(null)
  const [subPanel, setSubPanel]   = useState<typeof ALL_SUBSCRIBERS[0] | null>(null)
  const [subSearch, setSubSearch] = useState('')
  const [showAll, setShowAll]     = useState(false)

  const visibleAtRisk = showAll ? AT_RISK : AT_RISK.slice(0, 4)
  const filtered = ALL_SUBSCRIBERS.filter(s =>
    s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(subSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">

      {/* Demo banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <div className="flex items-center gap-2 text-xs text-emerald-300">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
          <span>You're viewing a live demo with sample data. Click anything to explore the product.</span>
        </div>
        <Link
          href="/auth/signup"
          className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded-md transition-colors whitespace-nowrap"
        >
          Start free trial →
        </Link>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-[220px] border-r border-white/[0.06] flex-shrink-0 h-screen sticky top-0">
          <div className="px-5 h-[60px] flex items-center border-b border-white/[0.06]">
            <Link href="/" className="text-[15px] font-semibold tracking-tight hover:opacity-75 transition-opacity">
              User<span className="text-emerald-400">Retain</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {([
              { icon: '⊞', label: 'Overview',    section: 'overview' as const },
              { icon: '◧', label: 'Subscribers', section: 'subscribers' as const },
              { icon: '✦', label: 'Tools',       section: 'tools' as const },
            ]).map(item => (
              <button
                key={item.label}
                onClick={() => setSection(item.section)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeSection === item.section
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-[#e8eaed] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="opacity-60 text-xs">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 cursor-not-allowed">
              <span className="opacity-60 text-xs">◈</span>
              Billing
              <span className="ml-auto text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-medium">Demo</span>
            </div>
          </nav>

          {/* Trial countdown */}
          <div className="px-3 pb-3">
            <Link href="/auth/signup" className="block rounded-xl py-5 px-3 text-center transition-all group hover:bg-white/[0.04]">
              <div className="text-6xl font-black leading-none tabular-nums text-emerald-300">14</div>
              <div className="text-sm font-semibold text-white/70 mt-2 leading-tight uppercase tracking-widest">days<br />left</div>
              <div className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/25 text-emerald-200 group-hover:bg-emerald-500/40 transition-colors">Upgrade now →</div>
            </Link>
          </div>

          {/* User */}
          <div className="px-4 py-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">D</div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">Demo user</div>
                <div className="text-[10px] text-[#e8eaed] truncate">demo@userretain.io</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Top bar */}
          <header className="h-[60px] border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
            <div className="flex items-center gap-3">
              <Link href="/" className="lg:hidden text-sm font-semibold hover:opacity-75">
                User<span className="text-emerald-400">Retain</span>
              </Link>
              <span className="text-xs text-white/50 hidden sm:block">Sunday, March 29</span>
            </div>
            <Link href="/auth/signup" className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg transition-colors">
              Start free trial →
            </Link>
          </header>

          {/* Mobile nav */}
          <div className="lg:hidden flex border-b border-white/[0.06] bg-[#080808]">
            {(['overview','subscribers','tools'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
                  activeSection === s ? 'text-white border-b-2 border-emerald-400' : 'text-white/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div className="p-4 md:p-6 space-y-5">
              {/* Greeting */}
              <div>
                <h1 className="text-lg font-bold">Good morning, Demo 👋</h1>
                <p className="text-xs text-white/40 mt-0.5">Watching 347 active subscribers · 4 critical alerts</p>
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Revenue at risk',    val: '$1,260', sub: '4 subscribers',          color: 'text-red-400' },
                  { label: 'Recovered revenue',  val: '+$340',  sub: 'vs last month',            color: 'text-emerald-400' },
                  { label: 'Churn rate',         val: '3.2%',   sub: '4 cancelled',              color: 'text-amber-400' },
                  { label: 'Subscribers saved',  val: '0',      sub: 'win-backs sent today',    color: 'text-white' },
                ].map(k => (
                  <div key={k.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="text-xs text-white/40 mb-1.5">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
                    <div className="text-xs text-white/30 mt-1">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* 70/30 */}
              <div className="grid lg:grid-cols-[1fr_320px] gap-5">

                {/* At-risk panel */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      <h2 className="text-sm font-semibold">High Risk Subscribers</h2>
                    </div>
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
                      {AT_RISK.length} at risk
                    </span>
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {visibleAtRisk.map(s => (
                      <div key={s.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => setSubPanel(ALL_SUBSCRIBERS.find(x => x.id === s.id) || null)}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">{s.name[0]}</div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{s.name}</div>
                              <div className="text-xs text-white/40 mt-0.5">{s.plan} · ${s.amount}/mo</div>
                              <div className="text-[11px] text-white/30 mt-1">
                                {s.score >= 9 ? 'Likely to churn in 1–3 days' : s.score >= 7 ? 'Likely to churn within 1 week' : 'Likely to churn in 2–3 weeks'}
                              </div>
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                <span className="text-[10px] bg-white/[0.06] text-white/50 px-2 py-0.5 rounded-full">{s.days} days inactive</span>
                                <span className="text-[10px] bg-white/[0.06] text-white/50 px-2 py-0.5 rounded-full">Engagement drop</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <ScoreBadge score={s.score} />
                            <button
                              onClick={e => { e.stopPropagation(); setEmailModal(s) }}
                              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                              Send AI email →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {AT_RISK.length > 4 && (
                    <div className="px-5 py-3 border-t border-white/[0.04]">
                      <button onClick={() => setShowAll(!showAll)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                        {showAll ? '↑ Show less' : `↓ Show ${AT_RISK.length - 4} more`}
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Insights */}
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-emerald-400 text-xs">✦</span>
                      <h2 className="text-sm font-semibold">AI Insights</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-red-500/10 border border-red-500/15 rounded-lg p-3">
                        <div className="text-[10px] text-red-400 uppercase tracking-widest mb-1.5 font-semibold">Today's briefing</div>
                        <div className="text-xs text-[#e8eaed] leading-relaxed">4 subscribers show elevated churn risk. Immediate action on James M. could protect $49/mo. He never completed onboarding.</div>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/15 rounded-lg p-3">
                        <div className="text-[10px] text-amber-400 uppercase tracking-widest mb-1.5 font-semibold">Top priority</div>
                        <div className="text-xs text-[#e8eaed] leading-relaxed">Reach out to James M. today. 34 days inactive, never used core feature.</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-semibold">Revenue opportunities</div>
                        <div className="space-y-1.5 text-xs text-white/50">
                          <div>↑ Offer onboarding call to 2 users stuck at setup</div>
                          <div>↑ Pro upgrade candidate: Sarah K. hitting plan limits</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">Overview</div>
                    <div className="space-y-2">
                      {[
                        { label: 'Active subscribers', val: '347', color: 'text-emerald-400' },
                        { label: 'Avg revenue / sub',  val: '$13.90' },
                        { label: 'Past due',           val: '2',    color: 'text-amber-400' },
                        { label: 'Total MRR',          val: '$4,820' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-white/40">{row.label}</span>
                          <span className={`font-semibold ${row.color || 'text-white'}`}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* MRR Chart */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <div className="text-sm font-semibold">Revenue growth</div>
                  <div className="text-xs text-white/40 mt-0.5">MRR, last 6 months</div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MRR_HISTORY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#34d399" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
                      <Tooltip
                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                        itemStyle={{ color: '#34d399' }}
                        formatter={(v) => [`$${Number(v).toLocaleString()}`, 'MRR']}
                      />
                      <Area type="monotone" dataKey="mrr" stroke="#34d399" strokeWidth={2} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 4, fill: '#34d399' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sign up CTA */}
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 text-center">
                <div className="text-sm font-semibold mb-1">Ready to see your real subscribers?</div>
                <div className="text-xs text-white/40 mb-4">Connect Stripe in 4 minutes. No credit card required.</div>
                <Link href="/auth/signup" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  Start free trial →
                </Link>
              </div>
            </div>
          )}

          {/* ── SUBSCRIBERS ── */}
          {activeSection === 'subscribers' && (
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <h1 className="text-lg font-bold mb-1">Subscribers</h1>
                <p className="text-xs text-white/40">347 total · Click any row to view their profile and generate a win-back email</p>
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left">
                      <th className="px-4 py-3 text-xs text-white/30 font-medium">Name</th>
                      <th className="px-4 py-3 text-xs text-white/30 font-medium hidden md:table-cell">Plan</th>
                      <th className="px-4 py-3 text-xs text-white/30 font-medium hidden sm:table-cell">Status</th>
                      <th className="px-4 py-3 text-xs text-white/30 font-medium">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map(s => (
                      <tr
                        key={s.id}
                        onClick={() => setSubPanel(s)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold flex-shrink-0">{s.name[0]}</div>
                            <div>
                              <div className="text-sm font-medium">{s.name}</div>
                              <div className="text-xs text-white/30">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-xs text-[#e8eaed]">{s.plan}</div>
                          <div className="text-xs text-white/30">${s.amount}/mo</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell"><StatusPill status={s.status} /></td>
                        <td className="px-4 py-3"><ScoreBadge score={s.score} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TOOLS ── */}
          {activeSection === 'tools' && (
            <div className="p-4 md:p-6 space-y-5">
              <div>
                <h1 className="text-lg font-bold mb-1">Tools</h1>
                <p className="text-xs text-white/40">Connect your data, score your subscribers, and act before they leave.</p>
              </div>

              {[
                { title: 'Stripe sync', desc: 'Refresh subscriber data directly from your Stripe account.' },
                { title: 'Import customers (CSV)', desc: 'Upload a CSV file to import your subscriber list manually.' },
                { title: 'Churn risk analysis', desc: 'Score every subscriber for churn risk based on activity, payment status, and tenure.' },
                { title: 'AI insights', desc: 'Generate AI-powered churn insights and win-back email recommendations.' },
              ].map(tool => (
                <div key={tool.title} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold mb-1">{tool.title}</h2>
                    <p className="text-xs text-white/40">{tool.desc}</p>
                  </div>
                  <Link
                    href="/auth/signup"
                    className="flex-shrink-0 text-xs bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white/50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Sign up to unlock →
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {emailModal && <EmailModal sub={emailModal} onClose={() => setEmailModal(null)} />}
      {subPanel && <SubPanel sub={subPanel} onClose={() => setSubPanel(null)} />}

    </div>
  )
}
