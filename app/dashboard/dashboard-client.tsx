'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import Link from 'next/link'
import SyncButton from './sync-button'
import ChurnScoreButton from './churn-score-button'
import CSVUploadButton from './csv-upload-button'
import AIInsightsPanel from './ai-insights-panel'
import ActionCentre from './action-centre'
import UpgradePrompt from './upgrade-prompt'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardData = {
  planInfo: {
    plan: 'starter' | 'growth' | 'pro'
    limit: number | null
    total: number
    shown: number
    atLimit: boolean
  }
  metrics: {
    mrr: number
    activeSubscribers: number
    cancelledSubscribers: number
    pastDue: number
    churnRate: string
    arpu: string
    totalSubscribers: number
    atRiskCount: number
    revenueAtRisk: number
  }
  mrrHistory: { month: string; mrr: number }[]
  subscribers: {
    id: string
    name: string
    email: string
    plan: string
    amount: number
    status: string
    source: string
    startedAt: string
    lastActiveAt: string
    daysInactive: number | null
  }[]
  atRisk: {
    id: string
    name: string
    email: string
    amount: number
    plan: string
    daysInactive: number | null
    churnScore?: number
  }[]
}

// ─── Small reusable pieces ─────────────────────────────────────────────────────

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

// ─── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({ session }: { session: any }) {
  const [data, setData]                   = useState<DashboardData | null>(null)
  const [loading, setLoading]             = useState(true)
  const [briefingSending, setBriefing]    = useState(false)
  const [briefingSent, setBriefingSent]   = useState(false)
  const [briefingError, setBriefingError] = useState<string | null>(null)
  const [activeSection, setSection]       = useState<'overview' | 'tools'>('overview')

  async function sendBriefing() {
    setBriefing(true)
    setBriefingError(null)
    try {
      const res = await fetch('/api/alerts/briefing', { method: 'POST' })
      const d   = await res.json()
      if (d.error) throw new Error(d.error)
      setBriefingSent(true)
    } catch (err: any) {
      setBriefingError(err.message || 'Failed to send briefing')
    } finally {
      setBriefing(false)
    }
  }

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const initials  = session?.user?.name?.[0]?.toUpperCase() || 'U'
  const today     = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">

      {/* ══ SIDEBAR ════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[216px] border-r border-white/[0.06] flex-shrink-0 h-screen sticky top-0">

        {/* Logo */}
        <div className="px-5 h-14 flex items-center border-b border-white/[0.06]">
          <span className="text-base font-semibold tracking-tight">
            Sub<span className="text-emerald-400">Pilot</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {([
            { icon: '▦', label: 'Overview', section: 'overview' },
            { icon: '✦', label: 'Tools',    section: 'tools' },
          ] as const).map(item => (
            <button
              key={item.label}
              onClick={() => setSection(item.section)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === item.section
                  ? 'bg-white/[0.07] text-white'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link
            href="/billing"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
          >
            <span className="opacity-70">◈</span>
            Billing
          </Link>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{session?.user?.name || 'User'}</div>
              <div className="text-[10px] text-white/30 truncate">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
        <header className="h-14 border-b border-white/[0.06] px-6 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <span className="lg:hidden text-sm font-semibold">
              Sub<span className="text-emerald-400">Pilot</span>
            </span>
            <span className="text-xs text-white/30 hidden sm:block">{today}</span>
          </div>

          <div className="flex items-center gap-2">
            {briefingError && (
              <span className="text-xs text-red-400 hidden sm:block">{briefingError}</span>
            )}
            {briefingSent ? (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                ✓ Briefing sent to {session?.user?.email}
              </span>
            ) : (
              <button
                onClick={sendBriefing}
                disabled={briefingSending}
                className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              >
                {briefingSending ? (
                  <>
                    <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : '📋 Email today\'s briefing'}
              </button>
            )}
          </div>
        </header>

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto px-6 py-6">

          {/* LOADING SKELETON */}
          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 animate-pulse">
                    <div className="h-2.5 bg-white/10 rounded mb-3 w-20" />
                    <div className="h-7 bg-white/10 rounded w-16 mb-2" />
                    <div className="h-2 bg-white/5 rounded w-24" />
                  </div>
                ))}
              </div>
              <div className="h-48 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse" />
            </div>
          )}

          {/* NO DATA — connect Stripe */}
          {!loading && !data && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-[#635bff]/10 border border-[#635bff]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
                  💳
                </div>
                <h2 className="text-lg font-semibold mb-2">Connect your Stripe account</h2>
                <p className="text-sm text-white/40 mb-8 leading-relaxed">
                  SubPilot needs read-only access to your Stripe data to start
                  tracking subscribers and detecting churn risk.
                </p>
                <SyncButton />
                <p className="text-white/20 text-xs mt-5">
                  Read-only access · We never touch your money
                </p>
              </div>
            </div>
          )}

          {/* ── OVERVIEW SECTION ─────────────────────────────────────────── */}
          {data && activeSection === 'overview' && (
            <div className="space-y-6">

              {/* GREETING */}
              <div>
                <h1 className="text-xl font-bold mb-1">Good morning, {firstName} 👋</h1>
                <p className="text-sm text-white/40">
                  {data.metrics.atRiskCount > 0
                    ? `${data.metrics.atRiskCount} subscriber${data.metrics.atRiskCount > 1 ? 's are' : ' is'} at risk · $${data.metrics.revenueAtRisk.toLocaleString()}/mo in danger`
                    : `Watching ${data.metrics.activeSubscribers.toLocaleString()} active subscribers · No critical alerts`}
                </p>
              </div>

              {/* METRIC CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Monthly revenue',
                    value: `$${data.metrics.mrr.toLocaleString()}`,
                    sub:   `$${data.metrics.arpu} avg / subscriber`,
                    color: 'text-white',
                    border:'border-white/[0.06]',
                  },
                  {
                    label: 'Active subscribers',
                    value: data.metrics.activeSubscribers.toLocaleString(),
                    sub:   `${data.metrics.totalSubscribers} total`,
                    color: 'text-white',
                    border:'border-white/[0.06]',
                  },
                  {
                    label: 'Churn rate',
                    value: `${data.metrics.churnRate}%`,
                    sub:   `${data.metrics.cancelledSubscribers} cancelled`,
                    color: parseFloat(data.metrics.churnRate) > 5 ? 'text-red-400' : 'text-emerald-400',
                    border: parseFloat(data.metrics.churnRate) > 5 ? 'border-red-500/20' : 'border-white/[0.06]',
                  },
                  {
                    label: 'Revenue at risk',
                    value: `$${data.metrics.revenueAtRisk.toLocaleString()}`,
                    sub:   `${data.metrics.atRiskCount} subscribers`,
                    color: data.metrics.revenueAtRisk > 0 ? 'text-orange-400' : 'text-white',
                    border: data.metrics.revenueAtRisk > 0 ? 'border-orange-500/20' : 'border-white/[0.06]',
                  },
                ].map(m => (
                  <div key={m.label} className={`bg-white/[0.02] border rounded-xl p-4 ${m.border}`}>
                    <div className="text-xs text-white/35 mb-2">{m.label}</div>
                    <div className={`text-2xl font-bold mb-0.5 ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-white/25">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* ACTION CENTRE */}
              {data.metrics.atRiskCount > 0 && (
                <ActionCentre
                  atRisk={data.atRisk}
                  pastDueCount={data.metrics.pastDue}
                  metrics={{
                    atRiskCount:    data.metrics.atRiskCount,
                    revenueAtRisk:  data.metrics.revenueAtRisk,
                  }}
                />
              )}

              {/* AT-RISK LIST  +  MRR CHART */}
              <div className="grid lg:grid-cols-2 gap-4">

                {/* At-risk subscribers */}
                {data.atRisk.length > 0 ? (
                  <div className="bg-white/[0.02] border border-red-500/10 rounded-xl">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.06]">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                      <h2 className="text-sm font-semibold">At-risk subscribers</h2>
                      <span className="ml-auto text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                        {data.atRisk.length} at risk
                      </span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {data.atRisk.map(s => (
                        <Link key={s.id} href={`/dashboard/subscribers/${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs text-red-400 font-bold flex-shrink-0">
                              {s.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-medium">{s.name}</div>
                              <div className="text-xs text-white/30">
                                ${s.amount}/mo · {s.plan}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {s.churnScore !== undefined && <ScoreBadge score={s.churnScore} />}
                            <span className="text-xs text-white/25 hidden sm:block">
                              {s.daysInactive ? `${s.daysInactive}d inactive` : 'No activity'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/[0.02] border border-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-center p-8 min-h-[180px]">
                    <div className="text-3xl mb-3">🎯</div>
                    <div className="text-sm font-medium text-emerald-400 mb-1">No at-risk subscribers</div>
                    <div className="text-xs text-white/30">
                      Go to Tools → Run churn analysis to score your subscribers
                    </div>
                  </div>
                )}

                {/* MRR chart */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <div className="px-4 py-3.5 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold">Revenue growth</h2>
                    <p className="text-xs text-white/30 mt-0.5">MRR over the last 6 months</p>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={190}>
                      <AreaChart data={data.mrrHistory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                          axisLine={false} tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                          axisLine={false} tickLine={false}
                          tickFormatter={v => `$${v}`}
                          width={42}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#141414',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8, fontSize: 12,
                          }}
                          formatter={(val: any) => [`$${val}`, 'MRR']}
                        />
                        <Area
                          type="monotone"
                          dataKey="mrr"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#mrrGrad)"
                          dot={false}
                          activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* UPGRADE PROMPT — shown when subscriber count approaches or hits the plan limit */}
              {data.planInfo.atLimit && data.planInfo.limit !== null && (
                <UpgradePrompt
                  plan={data.planInfo.plan}
                  total={data.planInfo.total}
                  limit={data.planInfo.limit}
                />
              )}

              {/* ALL SUBSCRIBERS TABLE */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
                  <h2 className="text-sm font-semibold">All subscribers</h2>
                  <span className="text-xs text-white/30">{data.metrics.totalSubscribers} total</span>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-[1fr_160px_80px_100px] gap-4 px-4 py-2 border-b border-white/[0.04]">
                  {['Subscriber', 'Plan', 'MRR', 'Status'].map(h => (
                    <div key={h} className="text-[10px] font-medium uppercase tracking-widest text-white/20">{h}</div>
                  ))}
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {data.subscribers.slice(0, 10).map(s => (
                    <Link
                      key={s.id}
                      href={`/dashboard/subscribers/${s.id}`}
                      className="grid md:grid-cols-[1fr_160px_80px_100px] gap-4 items-center px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      {/* Name + email */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{s.name}</div>
                          <div className="text-xs text-white/30 truncate">{s.email}</div>
                        </div>
                      </div>
                      <div className="hidden md:block text-xs text-white/40 truncate">{s.plan || '—'}</div>
                      <div className="hidden md:block text-xs font-medium">
                        ${s.amount}<span className="text-white/25">/mo</span>
                      </div>
                      <div className="hidden md:block">
                        <StatusPill status={s.status} />
                      </div>
                      {/* Mobile: status only */}
                      <div className="md:hidden flex items-center justify-between col-span-full mt-1">
                        <span className="text-xs text-white/40">${s.amount}/mo</span>
                        <StatusPill status={s.status} />
                      </div>
                    </Link>
                  ))}
                </div>

                {data.subscribers.length > 10 && (
                  <div className="px-4 py-3 border-t border-white/[0.06] text-center">
                    <span className="text-xs text-white/25">
                      + {data.subscribers.length - 10} more subscribers
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── TOOLS SECTION ────────────────────────────────────────────── */}
          {data && activeSection === 'tools' && (
            <div className="space-y-6">

              <div>
                <h1 className="text-xl font-bold mb-1">Tools</h1>
                <p className="text-sm text-white/40">Import data, analyse churn, and generate AI insights.</p>
              </div>

              {/* CSV upload */}
              <CSVUploadButton />

              {/* AI Insights */}
              <AIInsightsPanel />

              {/* Churn analysis */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold mb-1">Churn risk analysis</h2>
                  <p className="text-xs text-white/40">
                    Score every subscriber for churn risk based on activity, payment status, and tenure.
                  </p>
                </div>
                <ChurnScoreButton />
              </div>

              {/* Stripe sync */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold mb-1">Stripe sync</h2>
                  <p className="text-xs text-white/40">
                    Refresh subscriber data directly from your Stripe account.
                  </p>
                </div>
                <SyncButton />
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
