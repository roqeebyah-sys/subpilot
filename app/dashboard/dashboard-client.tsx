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

function riskLabel(score: number | undefined): { label: string; color: string; bg: string; border: string } {
  if (!score) return { label: 'Unknown', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' }
  if (score >= 9) return { label: 'Critical', color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/25' }
  if (score >= 7) return { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/25' }
  if (score >= 5) return { label: 'Medium',   color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/25' }
  return             { label: 'Low',      color: 'text-white/40',   bg: 'bg-white/5',      border: 'border-white/10' }
}

function churnWindow(score: number | undefined, days: number | null): string {
  if (score !== undefined && score >= 9) return 'Likely to churn in 1–3 days'
  if (score !== undefined && score >= 7) return 'Likely to churn within 1 week'
  if (score !== undefined && score >= 5) return 'Likely to churn in 2–3 weeks'
  if (days && days > 60)                return 'Likely to churn this month'
  return 'Low urgency — monitor closely'
}

function riskReasons(s: { daysInactive: number | null; churnScore?: number; plan: string }): string[] {
  const reasons: string[] = []
  if (s.daysInactive && s.daysInactive > 7)  reasons.push(`No login in ${s.daysInactive} days`)
  if (s.churnScore && s.churnScore >= 7)      reasons.push('Significant engagement drop')
  if (s.churnScore && s.churnScore >= 9)      reasons.push('High cancellation probability')
  if (reasons.length === 0)                   reasons.push('Activity below normal baseline')
  return reasons
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
  const [sendingId, setSendingId]         = useState<string | null>(null)
  const [sentIds, setSentIds]             = useState<Set<string>>(new Set())
  const [showAllRisk, setShowAllRisk]     = useState(false)

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

  async function sendAIMessage(subscriberId: string) {
    setSendingId(subscriberId)
    try {
      const res  = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSentIds(prev => new Set([...prev, subscriberId]))
    } catch {
      // swallow — user can retry from subscriber profile
    } finally {
      setSendingId(null)
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

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[220px] border-r border-white/[0.06] flex-shrink-0 h-screen sticky top-0">

        {/* Logo */}
        <div className="px-5 h-[60px] flex items-center border-b border-white/[0.06]">
          <Link href="/" className="text-[15px] font-semibold tracking-tight hover:opacity-75 transition-opacity">
            Sub<span className="text-emerald-400">Pilot</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {([
            { icon: '⊞', label: 'Overview',    section: 'overview' },
            { icon: '◧', label: 'Subscribers', section: 'subscribers' },
            { icon: '✦', label: 'Tools',       section: 'tools' },
          ] as const).map(item => (
            <button
              key={item.label}
              onClick={() => setSection(item.section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === item.section
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-[#e8eaed] hover:text-white/65 hover:bg-white/[0.04]'
              }`}
            >
              <span className="opacity-60 text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link
            href="/billing"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e8eaed] hover:text-white/65 hover:bg-white/[0.04] transition-all"
          >
            <span className="opacity-60 text-xs">◈</span>
            Billing
          </Link>
        </nav>

        {/* Briefing shortcut */}
        <div className="px-3 pb-3">
          {briefingSent ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              ✓ Briefing sent
            </div>
          ) : (
            <button
              onClick={sendBriefing}
              disabled={briefingSending}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all disabled:opacity-40"
            >
              {briefingSending ? (
                <><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />Sending…</>
              ) : <><span>📋</span> Email today's briefing</>}
            </button>
          )}
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{session?.user?.name || 'User'}</div>
              <div className="text-[10px] text-[#e8eaed] truncate">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
        <header className="h-[60px] border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden text-sm font-semibold hover:opacity-75 transition-opacity">
              Sub<span className="text-emerald-400">Pilot</span>
            </Link>
            <span className="text-xs text-white/50 hidden sm:block">{today}</span>
          </div>
          <div className="flex items-center gap-2">
            {briefingError && (
              <span className="text-xs text-red-400 hidden sm:block">{briefingError}</span>
            )}
            {/* Mobile briefing button */}
            {!briefingSent ? (
              <button
                onClick={sendBriefing}
                disabled={briefingSending}
                className="lg:hidden flex items-center gap-1.5 text-xs font-medium bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-[#e8eaed] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              >
                {briefingSending ? '…' : '📋'}
              </button>
            ) : null}
            {/* User avatar (mobile) */}
            <div className="lg:hidden w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* ── MOBILE NAV TABS ────────────────────────────────────────────────── */}
        <div className="lg:hidden flex border-b border-white/[0.06] bg-[#080808] flex-shrink-0">
          {([
            { icon: '⊞', label: 'Overview',    section: 'overview' },
            { icon: '◧', label: 'Subscribers', section: 'subscribers' },
            { icon: '✦', label: 'Tools',       section: 'tools' },
          ] as const).map(item => (
            <button
              key={item.label}
              onClick={() => setSection(item.section)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                activeSection === item.section
                  ? 'text-white border-b-2 border-white'
                  : 'text-[#e8eaed] hover:text-white/60'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link
            href="/billing"
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-[#e8eaed] hover:text-white/60 transition-colors"
          >
            <span className="text-sm">◈</span>
            Billing
          </Link>
        </div>

        {/* ── CONTENT ────────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto">

          {/* LOADING SKELETON */}
          {loading && (
            <div className="px-4 md:px-6 py-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 animate-pulse">
                    <div className="h-2.5 bg-white/10 rounded mb-3 w-20" />
                    <div className="h-7 bg-white/10 rounded w-16 mb-2" />
                    <div className="h-2 bg-white/5 rounded w-24" />
                  </div>
                ))}
              </div>
              <div className="h-64 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse" />
            </div>
          )}

          {/* NO DATA */}
          {!loading && !data && (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
              <div className="max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-[#635bff]/10 border border-[#635bff]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
                  💳
                </div>
                <h2 className="text-lg font-semibold mb-2">Connect your Stripe account</h2>
                <p className="text-sm text-white/40 mb-8 leading-relaxed">
                  SubPilot needs read-only access to your Stripe data to start tracking subscribers and detecting churn risk.
                </p>
                <SyncButton />
                <p className="text-white/45 text-xs mt-5">Read-only access · We never touch your money</p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              OVERVIEW SECTION
          ════════════════════════════════════════════════════════════════════ */}
          {data && activeSection === 'overview' && (() => {
            // Derived metrics
            const hist     = data.mrrHistory
            const prevMrr  = hist[hist.length - 2]?.mrr ?? 0
            const currMrr  = hist[hist.length - 1]?.mrr ?? 0
            const mrrDelta = Math.max(0, currMrr - prevMrr)
            const churnPct = parseFloat(data.metrics.churnRate)

            // Activity feed — synthesised from real data
            const feed: { icon: string; color: string; text: string; time: string }[] = []
            if (data.atRisk.length > 0) {
              feed.push({
                icon: '⚠',
                color: 'text-red-400 bg-red-500/10',
                text: `${data.atRisk.length} high-risk subscriber${data.atRisk.length > 1 ? 's' : ''} detected`,
                time: 'Just now',
              })
            }
            if (mrrDelta > 0) {
              feed.push({
                icon: '↑',
                color: 'text-emerald-400 bg-emerald-500/10',
                text: `$${mrrDelta.toLocaleString()} recovered vs last month`,
                time: 'This month',
              })
            }
            if (data.metrics.pastDue > 0) {
              feed.push({
                icon: '!',
                color: 'text-amber-400 bg-amber-500/10',
                text: `${data.metrics.pastDue} payment${data.metrics.pastDue > 1 ? 's' : ''} past due — retry recommended`,
                time: 'Ongoing',
              })
            }
            if (sentIds.size > 0) {
              feed.push({
                icon: '✉',
                color: 'text-emerald-400 bg-emerald-500/10',
                text: `${sentIds.size} win-back message${sentIds.size > 1 ? 's' : ''} sent today`,
                time: 'Today',
              })
            }
            if (feed.length < 3) {
              feed.push({
                icon: '✓',
                color: 'text-white/40 bg-white/5',
                text: `Watching ${data.metrics.activeSubscribers.toLocaleString()} active subscribers`,
                time: 'Always on',
              })
            }

            const kpis = [
              {
                label:  'Revenue at risk',
                value:  `$${data.metrics.revenueAtRisk.toLocaleString()}`,
                sub:    `${data.metrics.atRiskCount} subscribers`,
                delta:  data.metrics.revenueAtRisk > 0 ? { dir: 'down', pct: null } : null,
                accent: data.metrics.revenueAtRisk > 0 ? {
                  num: 'text-red-400', border: 'border-red-500/20', glow: 'bg-red-500/[0.03]',
                  dot: 'bg-red-400',
                } : {
                  num: 'text-[#e8eaed]', border: 'border-white/[0.06]', glow: 'bg-white/[0.02]', dot: '',
                },
              },
              {
                label:  'Recovered revenue',
                value:  `$${mrrDelta.toLocaleString()}`,
                sub:    'vs last month',
                delta:  mrrDelta > 0 ? { dir: 'up', pct: null } : null,
                accent: mrrDelta > 0 ? {
                  num: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'bg-emerald-500/[0.03]',
                  dot: 'bg-emerald-400',
                } : {
                  num: 'text-[#e8eaed]', border: 'border-white/[0.06]', glow: 'bg-white/[0.02]', dot: '',
                },
              },
              {
                label:  'Churn rate',
                value:  `${data.metrics.churnRate}%`,
                sub:    `${data.metrics.cancelledSubscribers} cancelled`,
                delta:  churnPct > 5 ? { dir: 'down', pct: null } : churnPct < 2 ? { dir: 'up', pct: null } : null,
                accent: churnPct > 5 ? {
                  num: 'text-red-400', border: 'border-red-500/20', glow: 'bg-red-500/[0.03]', dot: 'bg-red-400',
                } : {
                  num: 'text-[#e8eaed]', border: 'border-white/[0.06]', glow: 'bg-white/[0.02]', dot: '',
                },
              },
              {
                label:  'Subscribers saved',
                value:  String(sentIds.size),
                sub:    'win-backs sent today',
                delta:  sentIds.size > 0 ? { dir: 'up', pct: null } : null,
                accent: sentIds.size > 0 ? {
                  num: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'bg-emerald-500/[0.03]',
                  dot: 'bg-emerald-400',
                } : {
                  num: 'text-[#e8eaed]', border: 'border-white/[0.06]', glow: 'bg-white/[0.02]', dot: '',
                },
              },
            ]

            return (
              <div className="p-4 md:p-6 space-y-5">

                {/* ── Page title ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Good morning, {firstName} 👋</h1>
                    <p className="text-sm text-[#e8eaed] mt-0.5">
                      {data.metrics.atRiskCount > 0
                        ? `${data.metrics.atRiskCount} subscriber${data.metrics.atRiskCount > 1 ? 's' : ''} at risk · $${data.metrics.revenueAtRisk.toLocaleString()}/mo in danger`
                        : `Watching ${data.metrics.activeSubscribers.toLocaleString()} active subscribers · No critical alerts`}
                    </p>
                  </div>
                  {data.metrics.atRiskCount > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                      Live alerts
                    </div>
                  )}
                </div>

                {/* ── KPI Strip ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {kpis.map(k => (
                    <div
                      key={k.label}
                      className={`${k.accent.glow} border ${k.accent.border} rounded-xl p-4 group hover:border-white/20 transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[#e8eaed] font-medium">{k.label}</span>
                        {k.delta && (
                          <span className={`text-xs font-bold ${k.delta.dir === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {k.delta.dir === 'up' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                      <div className={`text-2xl font-bold tracking-tight mb-1 ${k.accent.num}`}>
                        {k.value}
                      </div>
                      <div className="text-xs text-white/50">{k.sub}</div>
                    </div>
                  ))}
                </div>

                {/* ── Tax Pot ─────────────────────────────────────────────── */}
                {data.taxPot.mrr > 0 && (
                  <div
                    className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden cursor-pointer hover:border-white/[0.14] transition-colors"
                    onClick={() => setTaxOpen(o => !o)}
                  >
                    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-base flex-shrink-0">💰</div>
                        <div>
                          <div className="text-sm font-medium">
                            Set aside <span className="text-[#e8eaed]">${data.taxPot.setAside.toLocaleString()}</span> this month for taxes
                          </div>
                          <div className="text-xs text-[#e8eaed] mt-0.5">
                            {data.taxPot.rate}% of ${data.taxPot.mrr.toLocaleString()} MRR · tap to expand
                          </div>
                        </div>
                      </div>
                      <span className="text-white/50 text-xs flex-shrink-0">{taxOpen ? '▲' : '▼'}</span>
                    </div>
                    {taxOpen && (
                      <div className="border-t border-white/[0.06] px-5 py-4 bg-white/[0.015] space-y-3">
                        {[
                          { label: 'Total MRR',              value: `$${data.taxPot.mrr.toLocaleString()}`,      note: 'All active subscriber revenue' },
                          { label: `× ${data.taxPot.rate}% tax rate`, value: '',                               note: 'Standard self-employed set-aside' },
                          { label: 'Recommended set-aside',  value: `$${data.taxPot.setAside.toLocaleString()}`, note: 'Transfer to a separate account', bold: true },
                        ].map(row => (
                          <div key={row.label} className="flex items-center justify-between gap-4">
                            <div>
                              <div className={`text-xs ${row.bold ? 'font-semibold text-[#e8eaed]' : 'text-white/50'}`}>{row.label}</div>
                              <div className="text-[10px] text-white/50">{row.note}</div>
                            </div>
                            {row.value && <div className="text-sm font-bold text-[#e8eaed] flex-shrink-0">{row.value}</div>}
                          </div>
                        ))}
                        <div className="text-[10px] text-white/45 pt-1 border-t border-white/[0.04]">
                          Guide only — consult a tax professional for your jurisdiction.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Main 2-col: Action Center + Insights ───────────────── */}
                <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">

                  {/* LEFT — High Risk Subscribers */}
                  <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                        <h2 className="text-sm font-semibold">High Risk Subscribers</h2>
                      </div>
                      {data.atRisk.length > 0 && (
                        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
                          {data.atRisk.length} at risk
                        </span>
                      )}
                    </div>

                    {/* Empty state */}
                    {data.atRisk.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                        <div className="text-4xl mb-4">🎯</div>
                        <div className="text-sm font-medium text-emerald-400 mb-1.5">No at-risk subscribers</div>
                        <div className="text-xs text-[#e8eaed] max-w-xs">
                          Go to Tools → Run churn analysis to score your subscribers
                        </div>
                      </div>
                    )}

                    {/* Subscriber rows */}
                    {data.atRisk.length > 0 && (
                      <div className="divide-y divide-white/[0.045]">
                        {(showAllRisk ? data.atRisk : data.atRisk.slice(0, 4)).map(s => {
                          const risk    = riskLabel(s.churnScore)
                          const reasons = riskReasons(s)
                          const urgency = churnWindow(s.churnScore, s.daysInactive)
                          const isSent  = sentIds.has(s.id)
                          const isSending = sendingId === s.id

                          return (
                            <div key={s.id} className="px-5 py-4 hover:bg-white/[0.025] transition-colors group">
                              <div className="flex items-start gap-4">

                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${risk.bg} border ${risk.border}`}>
                                  <span className={risk.color}>{s.name[0]?.toUpperCase()}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <Link
                                      href={`/dashboard/subscribers/${s.id}`}
                                      className="text-sm font-semibold hover:text-white/80 transition-colors"
                                    >
                                      {s.name}
                                    </Link>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${risk.bg} ${risk.color} border ${risk.border}`}>
                                      {risk.label}
                                    </span>
                                    {s.churnScore !== undefined && <ScoreBadge score={s.churnScore} />}
                                  </div>

                                  {/* Value + reasons */}
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="text-xs font-semibold text-white/70">${s.amount}<span className="text-[#e8eaed] font-normal">/mo</span></span>
                                    <span className="text-white/15">·</span>
                                    <span className="text-xs text-white/40">{s.plan}</span>
                                  </div>

                                  {/* Risk reasons */}
                                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                                    {reasons.map(r => (
                                      <span key={r} className="text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
                                        {r}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Urgency */}
                                  <div className={`text-[11px] font-medium mb-3 ${
                                    s.churnScore && s.churnScore >= 8 ? 'text-red-400' :
                                    s.churnScore && s.churnScore >= 6 ? 'text-orange-400' : 'text-amber-400'
                                  }`}>
                                    ⏱ {urgency}
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isSent ? (
                                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium">
                                        ✓ Draft sent to your inbox
                                      </span>
                                    ) : (
                                      <div className="group/btn relative">
                                        <button
                                          onClick={() => sendAIMessage(s.id)}
                                          disabled={!!sendingId}
                                          className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {isSending ? (
                                            <><span className="w-2.5 h-2.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending…</>
                                          ) : '✦ Send AI Message'}
                                        </button>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/btn:block z-20 pointer-events-none">
                                          <div className="bg-[#1a1a1a] border border-white/[0.12] rounded-lg px-3 py-2 text-[10px] text-[#e8eaed] w-52 leading-relaxed shadow-xl">
                                            Claude writes a personalised win-back email and sends the draft <span className="text-white/90 font-medium">to your inbox</span> — you review before sending.
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <Link
                                      href={`/dashboard/subscribers/${s.id}`}
                                      className="text-xs font-medium text-white/50 hover:text-white/80 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] px-3.5 py-1.5 rounded-lg transition-all"
                                    >
                                      Offer Discount
                                    </Link>
                                    <Link
                                      href={`/dashboard/subscribers/${s.id}`}
                                      className="text-xs text-white/50 hover:text-white/50 transition-colors ml-auto"
                                    >
                                      View profile →
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Footer */}
                    {data.atRisk.length > 0 && (
                      <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between gap-3">
                        <span className="text-[11px] text-white/50">
                          ${data.metrics.revenueAtRisk.toLocaleString()}/mo at risk
                        </span>
                        <div className="flex items-center gap-3">
                          {data.atRisk.length > 4 && (
                            <button
                              onClick={() => setShowAllRisk(v => !v)}
                              className="text-[11px] font-medium text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] px-2.5 py-1 rounded-lg transition-colors"
                            >
                              {showAllRisk
                                ? '↑ See less'
                                : `↓ See ${data.atRisk.length - 4} more`}
                            </button>
                          )}
                          <button
                            onClick={() => setSection('subscribers')}
                            className="text-[11px] text-[#e8eaed] hover:text-white/55 transition-colors"
                          >
                            All subscribers →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT — AI Insights Panel */}
                  <div className="space-y-3">

                    {/* Insights summary */}
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-emerald-500/20 rounded-md flex items-center justify-center text-[10px] text-emerald-400">✦</div>
                        <h3 className="text-sm font-semibold">AI Insights</h3>
                      </div>

                      <div className="space-y-3">
                        {/* Likely to churn this week */}
                        <div className="bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3">
                          <div className="text-2xl font-bold text-red-400 mb-0.5">
                            {data.atRisk.filter(s => (s.churnScore ?? 0) >= 7).length}
                          </div>
                          <div className="text-xs text-white/40">subscribers likely to churn this week</div>
                        </div>

                        {/* Revenue at risk */}
                        <div className="bg-orange-500/5 border border-orange-500/15 rounded-lg px-4 py-3">
                          <div className="text-2xl font-bold text-orange-400 mb-0.5">
                            ${data.metrics.revenueAtRisk.toLocaleString()}
                          </div>
                          <div className="text-xs text-white/40">total revenue at risk per month</div>
                        </div>

                        {/* Engagement trend */}
                        <div className={`${mrrDelta > 0 ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.02] border-white/[0.06]'} border rounded-lg px-4 py-3`}>
                          <div className={`text-2xl font-bold mb-0.5 ${mrrDelta > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                            {mrrDelta > 0 ? `+$${mrrDelta.toLocaleString()}` : '—'}
                          </div>
                          <div className="text-xs text-white/40">MRR growth vs last month</div>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    {data.atRisk.length > 0 && (() => {
                      const top = data.atRisk[0]
                      const risk = riskLabel(top.churnScore)
                      return (
                        <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-amber-500/20 rounded-md flex items-center justify-center text-[10px] text-amber-400">!</div>
                            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Recommended Action</h3>
                          </div>
                          <p className="text-xs text-[#e8eaed] leading-relaxed mb-3">
                            Send a personalised win-back message to{' '}
                            <span className="text-white font-medium">{top.name}</span>
                            {' '}— your highest-risk subscriber at ${top.amount}/mo.
                            {top.daysInactive ? ` They've been inactive for ${top.daysInactive} days.` : ''}
                          </p>
                          <button
                            onClick={() => sendAIMessage(top.id)}
                            disabled={!!sendingId || sentIds.has(top.id)}
                            className="w-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/25 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                          >
                            {sentIds.has(top.id) ? '✓ Message sent' : sendingId === top.id ? 'Sending…' : `Send to ${top.name.split(' ')[0]} →`}
                          </button>
                        </div>
                      )
                    })()}

                    {/* Quick stats */}
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide">Overview</h3>
                      {[
                        { label: 'Active subscribers', value: data.metrics.activeSubscribers.toLocaleString(), color: 'text-emerald-400' },
                        { label: 'Avg revenue / sub',  value: `$${data.metrics.arpu}`,                         color: 'text-white/70' },
                        { label: 'Past due',            value: String(data.metrics.pastDue),                    color: data.metrics.pastDue > 0 ? 'text-amber-400' : 'text-white/40' },
                        { label: 'Total MRR',           value: `$${data.metrics.mrr.toLocaleString()}`,         color: 'text-white/70' },
                      ].map(stat => (
                        <div key={stat.label} className="flex items-center justify-between">
                          <span className="text-xs text-[#e8eaed]">{stat.label}</span>
                          <span className={`text-xs font-semibold ${stat.color}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Lower Section: Chart + Activity Feed ────────────────── */}
                <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">

                  {/* Revenue / MRR Chart */}
                  <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold">Revenue growth</h2>
                        <p className="text-xs text-[#e8eaed] mt-0.5">MRR — last 6 months</p>
                      </div>
                      {(() => {
                        if (prevMrr === 0 || currMrr === 0) return null
                        const pct = ((currMrr - prevMrr) / prevMrr) * 100
                        const pos = pct >= 0
                        return (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                            pos
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-red-400 bg-red-500/10 border-red-500/20'
                          }`}>
                            {pos ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}% vs last month
                          </span>
                        )
                      })()}
                    </div>
                    <div className="p-5">
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.mrrHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.055)" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                            axisLine={false} tickLine={false} dy={6}
                          />
                          <YAxis
                            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                            axisLine={false} tickLine={false}
                            tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                            width={46}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#111',
                              border: '1px solid rgba(255,255,255,0.10)',
                              borderRadius: 10,
                              fontSize: 12,
                              padding: '8px 14px',
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}
                            itemStyle={{ color: '#fff', fontWeight: 600 }}
                            formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'MRR']}
                            cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="mrr"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#mrrGrad)"
                            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#10b981', stroke: 'rgba(16,185,129,0.25)', strokeWidth: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                      <h2 className="text-sm font-semibold">Activity feed</h2>
                      <p className="text-xs text-[#e8eaed] mt-0.5">Latest events</p>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {feed.map((item, i) => (
                        <div key={i} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${item.color}`}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white/70 leading-relaxed">{item.text}</div>
                            <div className="text-[10px] text-white/50 mt-0.5">{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-white/[0.04]">
                      <button
                        onClick={sendBriefing}
                        disabled={briefingSending || briefingSent}
                        className="w-full text-xs font-medium text-white/40 hover:text-white/70 transition-colors text-left disabled:opacity-40"
                      >
                        {briefingSent ? '✓ Briefing sent to your inbox' : '📋 Get morning briefing via email →'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upgrade prompt */}
                {data.planInfo.atLimit && data.planInfo.limit !== null && (
                  <UpgradePrompt
                    plan={data.planInfo.plan}
                    total={data.planInfo.total}
                    limit={data.planInfo.limit}
                  />
                )}

              </div>
            )
          })()}

          {/* ═══════════════════════════════════════════════════════════════════
              SUBSCRIBERS SECTION
          ════════════════════════════════════════════════════════════════════ */}
          {data && activeSection === 'subscribers' && (
            <div className="p-4 md:p-6 space-y-4">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold">Subscribers</h1>
                  <p className="text-sm text-white/40 mt-0.5">
                    {data.metrics.totalSubscribers.toLocaleString()} total · {data.metrics.activeSubscribers.toLocaleString()} active
                  </p>
                </div>
                <input
                  type="text"
                  value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                  placeholder="Search name or email…"
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors w-full sm:w-64"
                />
              </div>

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
                      subFilter === f.key ? 'bg-white/[0.12] text-white/80' : 'bg-white/[0.05] text-[#e8eaed]'
                    }`}>{f.count}</span>
                  </button>
                ))}
              </div>

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
                    <div className="hidden md:grid grid-cols-[1fr_160px_80px_100px_90px] gap-4 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
                      {['Subscriber', 'Plan', 'MRR', 'Status', 'Risk'].map(h => (
                        <div key={h} className="text-[10px] font-medium uppercase tracking-widest text-white/45">{h}</div>
                      ))}
                    </div>
                    {filtered.length === 0 ? (
                      <div className="text-center py-12 text-sm text-[#e8eaed]">
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
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {s.name[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium truncate">{s.name}</div>
                                <div className="text-xs text-[#e8eaed] truncate">{s.email}</div>
                              </div>
                            </div>
                            <div className="hidden md:block text-xs text-white/40 truncate">{s.plan || '—'}</div>
                            <div className="hidden md:block text-xs font-medium">${s.amount}<span className="text-white/50">/mo</span></div>
                            <div className="hidden md:block"><StatusPill status={s.status} /></div>
                            <div className="hidden md:block">
                              {s.churnScore !== undefined
                                ? <ScoreBadge score={s.churnScore} />
                                : <span className="text-xs text-white/45">—</span>
                              }
                            </div>
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
                    <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[11px] text-white/50">
                        {filtered.length} of {data.metrics.totalSubscribers} subscribers
                      </span>
                      {data.planInfo.limit !== null && (
                        <span className="text-[11px] text-white/50">Plan limit: {data.planInfo.limit.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TOOLS SECTION
          ════════════════════════════════════════════════════════════════════ */}
          {data && activeSection === 'tools' && (
            <div className="p-4 md:p-6 space-y-5">

              <div>
                <h1 className="text-xl font-bold mb-1">Tools</h1>
                <p className="text-sm text-white/40">Import data, analyse churn, and generate AI insights.</p>
              </div>

              {patreonMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm border flex items-center justify-between gap-3 ${
                  patreonMsg.startsWith('✓')
                    ? 'bg-white/[0.06] border-white/[0.12] text-white'
                    : 'bg-white/[0.04] border-white/[0.10] text-white/50'
                }`}>
                  {patreonMsg}
                  <button onClick={() => setPatreonMsg(null)} className="text-[#e8eaed] hover:text-white/60 text-xs">✕</button>
                </div>
              )}

              <CSVUploadButton />
              <AIInsightsPanel />

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold mb-1">Churn risk analysis</h2>
                  <p className="text-xs text-white/40">
                    Score every subscriber for churn risk based on activity, payment status, and tenure.
                  </p>
                </div>
                <ChurnScoreButton />
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold mb-1">Stripe sync</h2>
                  <p className="text-xs text-white/40">Refresh subscriber data directly from your Stripe account.</p>
                </div>
                <SyncButton />
              </div>

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
