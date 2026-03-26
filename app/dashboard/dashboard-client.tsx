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
  patreonConnected: boolean
  taxPot: {
    mrr:      number
    setAside: number
    rate:     number
  }
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
    churnScore?: number
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
  const [activeSection, setSection]       = useState<'overview' | 'subscribers' | 'tools'>('overview')
  const [subSearch, setSubSearch]         = useState('')
  const [subFilter, setSubFilter]         = useState<'all' | 'active' | 'cancelled' | 'past_due'>('all')
  const [patreonSyncing, setPatreonSync]  = useState(false)
  const [patreonMsg, setPatreonMsg]       = useState<string | null>(null)
  const [taxOpen, setTaxOpen]             = useState(false)

  // Read ?patreon= query param on mount to show connection feedback
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('patreon')
    if (p === 'connected') setPatreonMsg('✓ Patreon connected and synced!')
    if (p === 'error')     setPatreonMsg('⚠ Patreon connection failed — try again')
    if (p) window.history.replaceState({}, '', '/dashboard')
  }, [])

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
          <Link href="/" className="text-base font-semibold tracking-tight hover:opacity-75 transition-opacity">
            Sub<span className="text-emerald-400">Pilot</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {([
            { icon: '▦', label: 'Overview',    section: 'overview' },
            { icon: '◧', label: 'Subscribers', section: 'subscribers' },
            { icon: '✦', label: 'Tools',       section: 'tools' },
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
        <header className="h-14 border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden text-sm font-semibold hover:opacity-75 transition-opacity">
              Sub<span className="text-emerald-400">Pilot</span>
            </Link>
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
                className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
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

        {/* ── MOBILE NAV TABS ─────────────────────────────────────────────── */}
        <div className="lg:hidden flex border-b border-white/[0.06] bg-[#080808] flex-shrink-0">
          {([
            { icon: '▦', label: 'Overview',    section: 'overview' },
            { icon: '◧', label: 'Subscribers', section: 'subscribers' },
            { icon: '✦', label: 'Tools',       section: 'tools' },
          ] as const).map(item => (
            <button
              key={item.label}
              onClick={() => setSection(item.section)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                activeSection === item.section
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link
            href="/billing"
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="text-sm">◈</span>
            Billing
          </Link>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">

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
              {(() => {
                // Derive MRR trend from last 2 months of history
                const hist = data.mrrHistory
                const prevMrr = hist[hist.length - 2]?.mrr ?? 0
                const currMrr = hist[hist.length - 1]?.mrr ?? 0
                const mrrTrendPct = prevMrr > 0 ? ((currMrr - prevMrr) / prevMrr) * 100 : null
                const churnPct    = parseFloat(data.metrics.churnRate)

                const cards = [
                  {
                    label:  'Monthly revenue',
                    value:  `$${data.metrics.mrr.toLocaleString()}`,
                    sub:    `$${data.metrics.arpu} avg / subscriber`,
                    color:  'text-white',
                    border: 'border-white/[0.06]',
                    trend:  mrrTrendPct,
                  },
                  {
                    label:  'Active subscribers',
                    value:  data.metrics.activeSubscribers.toLocaleString(),
                    sub:    `${data.metrics.totalSubscribers} total`,
                    color:  'text-white',
                    border: 'border-white/[0.06]',
                    trend:  null,
                  },
                  {
                    label:  'Churn rate',
                    value:  `${data.metrics.churnRate}%`,
                    sub:    `${data.metrics.cancelledSubscribers} cancelled`,
                    color:  churnPct > 5 ? 'text-red-400' : 'text-emerald-400',
                    border: churnPct > 5 ? 'border-red-500/20' : 'border-white/[0.06]',
                    // High churn is bad — invert direction for display
                    trend:  churnPct > 5 ? -1 : churnPct < 2 ? 1 : null,
                  },
                  {
                    label:  'Revenue at risk',
                    value:  `$${data.metrics.revenueAtRisk.toLocaleString()}`,
                    sub:    `${data.metrics.atRiskCount} subscribers`,
                    color:  data.metrics.revenueAtRisk > 0 ? 'text-orange-400' : 'text-white',
                    border: data.metrics.revenueAtRisk > 0 ? 'border-orange-500/20' : 'border-white/[0.06]',
                    trend:  data.metrics.revenueAtRisk > 0 ? -1 : null,
                  },
                ]

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cards.map(m => (
                      <div key={m.label} className={`bg-white/[0.02] border rounded-xl p-4 ${m.border}`}>
                        <div className="text-xs text-white/35 mb-2">{m.label}</div>
                        <div className={`text-2xl font-bold mb-1 ${m.color}`}>{m.value}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-white/25">{m.sub}</div>
                          {m.trend !== null && (
                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ml-auto ${
                              m.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {m.trend > 0 ? '↑' : '↓'}
                              {typeof m.trend === 'number' && Math.abs(m.trend) > 1
                                ? ` ${Math.abs(m.trend).toFixed(1)}%`
                                : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* TAX POT CARD */}
              {data.taxPot.mrr > 0 && (
                <div
                  className="bg-white/[0.02] border border-white/[0.10] rounded-xl overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
                  onClick={() => setTaxOpen(o => !o)}
                >
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-lg flex-shrink-0">💰</div>
                      <div>
                        <div className="text-sm font-semibold">
                          Set aside{' '}
                          <span className="text-white/60">${data.taxPot.setAside.toLocaleString()}</span>
                          {' '}this month for taxes
                        </div>
                        <div className="text-xs text-white/35 mt-0.5">
                          {data.taxPot.rate}% of ${data.taxPot.mrr.toLocaleString()} MRR — tap to see breakdown
                        </div>
                      </div>
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">{taxOpen ? '▲' : '▼'}</span>
                  </div>

                  {taxOpen && (
                    <div className="border-t border-white/[0.08] px-5 py-4 bg-white/[0.02] space-y-3">
                      <div className="text-xs text-white/40 font-medium uppercase tracking-widest mb-2">How it's calculated</div>
                      {[
                        { label: 'Total MRR',           value: `$${data.taxPot.mrr.toLocaleString()}`,      note: 'All active subscriber revenue' },
                        { label: `× ${data.taxPot.rate}% tax rate`, value: '',                              note: 'Standard self-employed set-aside' },
                        { label: 'Recommended set-aside', value: `$${data.taxPot.setAside.toLocaleString()}`, note: 'Transfer this to a separate account', bold: true },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between gap-4">
                          <div>
                            <div className={`text-xs ${row.bold ? 'font-semibold text-white/60' : 'text-white/60'}`}>{row.label}</div>
                            <div className="text-[10px] text-white/25">{row.note}</div>
                          </div>
                          {row.value && (
                            <div className={`text-sm font-bold flex-shrink-0 ${row.bold ? 'text-white/60' : 'text-white/60'}`}>
                              {row.value}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="text-[10px] text-white/20 pt-1 border-t border-white/[0.04]">
                        This is a guide only — consult a tax professional for your jurisdiction.
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                {data.atRisk.length > 0 ? (() => {
                  const high   = data.atRisk.filter(s => (s.churnScore ?? 0) >= 8)
                  const medium = data.atRisk.filter(s => (s.churnScore ?? 0) >= 5 && (s.churnScore ?? 0) < 8)
                  const low    = data.atRisk.filter(s => (s.churnScore ?? 0) < 5)

                  const groups = [
                    { label: 'High risk',   color: 'text-red-400',    dot: 'bg-red-400',    items: high },
                    { label: 'Medium risk', color: 'text-orange-400', dot: 'bg-orange-400', items: medium },
                    { label: 'Low risk',    color: 'text-amber-400',  dot: 'bg-amber-400',  items: low },
                  ].filter(g => g.items.length > 0)

                  return (
                    <div className="bg-white/[0.02] border border-red-500/10 rounded-xl">
                      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.06]">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                        <h2 className="text-sm font-semibold">At-risk subscribers</h2>
                        <span className="ml-auto text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                          {data.atRisk.length} at risk
                        </span>
                      </div>
                      {groups.map(group => (
                        <div key={group.label}>
                          {/* Group header */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.01] border-b border-white/[0.04]">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${group.dot}`} />
                            <span className={`text-[10px] font-semibold uppercase tracking-widest ${group.color}`}>{group.label}</span>
                            <span className="ml-auto text-[10px] text-white/25">{group.items.length}</span>
                          </div>
                          {/* Subscribers in group */}
                          <div className="divide-y divide-white/[0.04]">
                            {group.items.map(s => (
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
                      ))}
                    </div>
                  )
                })() : (
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
                  <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">Revenue growth</h2>
                      <p className="text-xs text-white/30 mt-0.5">MRR — last 6 months</p>
                    </div>
                    {/* Mini trend badge */}
                    {(() => {
                      const h = data.mrrHistory
                      const prev = h[h.length - 2]?.mrr ?? 0
                      const curr = h[h.length - 1]?.mrr ?? 0
                      if (prev === 0 || curr === 0) return null
                      const pct  = ((curr - prev) / prev) * 100
                      const pos  = pct >= 0
                      return (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${
                          pos
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {pos ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}% vs last month
                        </span>
                      )
                    })()}
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={data.mrrHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 11 }}
                          axisLine={false} tickLine={false}
                          dy={6}
                        />
                        <YAxis
                          tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 11 }}
                          axisLine={false} tickLine={false}
                          tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                          width={46}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#161616',
                            border: '1px solid rgba(255,255,255,0.10)',
                            borderRadius: 10,
                            fontSize: 12,
                            padding: '8px 12px',
                          }}
                          labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}
                          itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                          formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'MRR']}
                          cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="mrr"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#mrrGrad)"
                          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: '#10b981', stroke: 'rgba(16,185,129,0.2)', strokeWidth: 4 }}
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

            </div>
          )}

          {/* ── SUBSCRIBERS SECTION ──────────────────────────────────────── */}
          {data && activeSection === 'subscribers' && (
            <div className="space-y-4">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold">Subscribers</h1>
                  <p className="text-sm text-white/40 mt-0.5">
                    {data.metrics.totalSubscribers.toLocaleString()} total · {data.metrics.activeSubscribers.toLocaleString()} active
                  </p>
                </div>
                {/* Search */}
                <input
                  type="text"
                  value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                  placeholder="Search name or email…"
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors w-full sm:w-64"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { key: 'all',       label: 'All',       count: data.metrics.totalSubscribers },
                  { key: 'active',    label: 'Active',    count: data.metrics.activeSubscribers },
                  { key: 'cancelled', label: 'Cancelled', count: data.metrics.cancelledSubscribers },
                  { key: 'past_due',  label: 'Past due',  count: data.metrics.pastDue },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setSubFilter(f.key)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      subFilter === f.key
                        ? 'bg-white/[0.08] border-white/[0.15] text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
                    }`}
                  >
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      subFilter === f.key ? 'bg-white/[0.12] text-white/80' : 'bg-white/[0.05] text-white/30'
                    }`}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Table */}
              {(() => {
                const filtered = data.subscribers
                  .filter(s => subFilter === 'all' || s.status === subFilter)
                  .filter(s => {
                    if (!subSearch) return true
                    const q = subSearch.toLowerCase()
                    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
                  })

                return (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[1fr_160px_80px_100px_90px] gap-4 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
                      {['Subscriber', 'Plan', 'MRR', 'Status', 'Risk'].map(h => (
                        <div key={h} className="text-[10px] font-medium uppercase tracking-widest text-white/20">{h}</div>
                      ))}
                    </div>

                    {filtered.length === 0 ? (
                      <div className="text-center py-12 text-sm text-white/30">
                        {subSearch ? `No subscribers matching "${subSearch}"` : 'No subscribers in this category'}
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {filtered.map(s => (
                          <Link
                            key={s.id}
                            href={`/dashboard/subscribers/${s.id}`}
                            className="grid md:grid-cols-[1fr_160px_80px_100px_90px] gap-4 items-center px-4 py-3 hover:bg-white/[0.04] transition-colors"
                          >
                            {/* Name + email */}
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold flex-shrink-0 flex-shrink-0">
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
                            <div className="hidden md:block">
                              {s.churnScore !== undefined
                                ? <ScoreBadge score={s.churnScore} />
                                : <span className="text-xs text-white/20">—</span>
                              }
                            </div>
                            {/* Mobile row */}
                            <div className="md:hidden flex items-center justify-between gap-2 mt-1">
                              <span className="text-xs text-white/40">${s.amount}/mo · {s.plan || '—'}</span>
                              <div className="flex items-center gap-1.5">
                                <StatusPill status={s.status} />
                                {s.churnScore !== undefined && <ScoreBadge score={s.churnScore} />}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Footer count */}
                    <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[11px] text-white/25">
                        {filtered.length} of {data.metrics.totalSubscribers} subscribers
                      </span>
                      {data.planInfo.limit !== null && (
                        <span className="text-[11px] text-white/25">
                          Plan limit: {data.planInfo.limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })()}

            </div>
          )}

          {/* ── TOOLS SECTION ────────────────────────────────────────────── */}
          {data && activeSection === 'tools' && (
            <div className="space-y-6">

              <div>
                <h1 className="text-xl font-bold mb-1">Tools</h1>
                <p className="text-sm text-white/40">Import data, analyse churn, and generate AI insights.</p>
              </div>

              {/* Patreon connection status banner */}
              {patreonMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm border flex items-center justify-between gap-3 ${
                  patreonMsg.startsWith('✓')
                    ? 'bg-white/[0.06] border-white/[0.12] text-white'
                    : 'bg-white/[0.04] border-white/[0.10] text-white/50'
                }`}>
                  {patreonMsg}
                  <button onClick={() => setPatreonMsg(null)} className="text-white/30 hover:text-white/60 text-xs">✕</button>
                </div>
              )}

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

              {/* Patreon connect / sync */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-sm font-semibold">Patreon</h2>
                      {data.patreonConnected && (
                        <span className="text-[10px] font-medium text-white bg-white/[0.06] border border-white/[0.12] px-2 py-0.5 rounded-full">Connected</span>
                      )}
                    </div>
                    <p className="text-xs text-white/40">
                      {data.patreonConnected
                        ? 'Re-sync your patron list and pledge data from Patreon.'
                        : 'Connect your Patreon account to pull patron data and churn scores.'}
                    </p>
                  </div>
                  <div className="text-2xl flex-shrink-0">🎨</div>
                </div>

                {data.patreonConnected ? (
                  <button
                    onClick={async () => {
                      setPatreonSync(true)
                      setPatreonMsg(null)
                      try {
                        const res  = await fetch('/api/patreon/sync', { method: 'POST' })
                        const json = await res.json()
                        if (json.error) throw new Error(json.error)
                        setPatreonMsg(`✓ Synced ${json.synced} patrons from Patreon`)
                      } catch (err: any) {
                        setPatreonMsg(`⚠ ${err.message || 'Sync failed'}`)
                      } finally {
                        setPatreonSync(false)
                      }
                    }}
                    disabled={patreonSyncing}
                    className="flex items-center gap-2 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.08] border border-white/[0.10] text-white/70 px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {patreonSyncing ? (
                      <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />Syncing…</>
                    ) : '↻ Sync Patreon'}
                  </button>
                ) : (
                  <a
                    href="/api/patreon/connect"
                    className="inline-flex items-center gap-2 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.08] border border-white/[0.10] text-white/70 px-4 py-2 rounded-lg transition-colors"
                  >
                    🎨 Connect Patreon
                  </a>
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
