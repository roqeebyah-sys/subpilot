'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Subscriber = {
  _id: string
  name: string
  email: string
  plan: string
  amount: number
  currency: string
  status: string
  source: string
  sourceId?: string
  startedAt?: string
  cancelledAt?: string
  lastActiveAt?: string
  churnScore?: number
  churnScoreUpdatedAt?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(date?: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function daysAgo(date?: string) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / 86_400_000)
}

function tenureMonths(date?: string) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / (86_400_000 * 30))
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 9 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    score >= 7 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    score >= 5 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  const label =
    score >= 9 ? 'Critical' :
    score >= 7 ? 'High risk' :
    score >= 5 ? 'Medium risk' : 'Low risk'
  return (
    <div className={`inline-flex flex-col items-center px-4 py-2 rounded-xl border ${cls}`}>
      <span className="text-3xl font-bold">{score}<span className="text-lg font-normal opacity-60">/10</span></span>
      <span className="text-xs mt-0.5">{label}</span>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; bg: string; label: string }> = {
    active:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
    cancelled: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Cancelled' },
    past_due:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Past due' },
    trialing:  { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Trialing' },
    paused:    { dot: 'bg-white/40',    text: 'text-white/50',    bg: 'bg-white/5',        label: 'Paused' },
  }
  const c = map[status] ?? { dot: 'bg-white/20', text: 'text-white/40', bg: 'bg-white/5', label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${c.text} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, string> = {
    stripe:    '💳 Stripe',
    paypal:    '🅿 PayPal',
    gumroad:   '🛍 Gumroad',
    teachable: '🎓 Teachable',
    kajabi:    '⚡ Kajabi',
    csv:       '📄 CSV import',
    manual:    '✍ Manual',
  }
  return (
    <span className="text-xs text-white/40 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
      {map[source] ?? source}
    </span>
  )
}

function FactorBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct   = Math.round((value / max) * 100)
  const color = value >= 7 ? 'bg-red-400' : value >= 4 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/50 w-6 text-right font-medium">{value}</span>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function SubscriberDetailClient({
  id,
  session,
}: {
  id: string
  session: any
}) {
  const [sub, setSub]         = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [alertSent, setAlertSent]     = useState(false)
  const [alertSending, setAlertSending] = useState(false)
  const [alertError, setAlertError]   = useState('')
  const [copied, setCopied]           = useState(false)

  // Win-back email generator
  const [winbackOpen, setWinbackOpen]   = useState(false)
  const [winbackLoading, setWinbackLoading] = useState(false)
  const [winbackEmail, setWinbackEmail] = useState<{
    subject: string
    body: string
    talkingPoints: string[]
  } | null>(null)
  const [winbackError, setWinbackError] = useState('')
  const [winbackCopied, setWinbackCopied] = useState(false)
  const [winbackTone, setWinbackTone]   = useState<'warm' | 'professional' | 'casual' | 'urgent'>('warm')

  const initials = session?.user?.name?.[0]?.toUpperCase() || 'U'

  useEffect(() => {
    fetch(`/api/subscribers/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setSub(d)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load subscriber'); setLoading(false) })
  }, [id])

  async function sendAlert() {
    setAlertSending(true)
    setAlertError('')
    try {
      const res  = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId: id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAlertSent(true)
    } catch (err: any) {
      setAlertError(err.message || 'Failed to send alert')
    } finally {
      setAlertSending(false)
    }
  }

  function copyEmail() {
    if (!sub) return
    navigator.clipboard.writeText(sub.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function generateWinback() {
    if (!sub) return
    setWinbackLoading(true)
    setWinbackError('')
    setWinbackEmail(null)
    setWinbackOpen(true)
    try {
      const res  = await fetch('/api/ai/winback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscriberId: sub._id, tone: winbackTone }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setWinbackEmail(data)
    } catch (err: any) {
      setWinbackError(err.message || 'Failed to generate email')
    } finally {
      setWinbackLoading(false)
    }
  }

  function copyWinback() {
    if (!winbackEmail) return
    const text = `Subject: ${winbackEmail.subject}\n\n${winbackEmail.body}`
    navigator.clipboard.writeText(text)
    setWinbackCopied(true)
    setTimeout(() => setWinbackCopied(false), 2000)
  }

  const days    = daysAgo(sub?.lastActiveAt ?? undefined)
  const tenure  = tenureMonths(sub?.startedAt ?? undefined)
  const score   = sub?.churnScore

  // ── Sidebar layout shared with dashboard ──
  return (
    <div className="min-h-screen bg-[#080808] text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[216px] border-r border-white/[0.06] flex-shrink-0 h-screen sticky top-0">
        <div className="px-5 h-14 flex items-center border-b border-white/[0.06]">
          <span className="text-base font-semibold tracking-tight">
            Sub<span className="text-emerald-400">Pilot</span>
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: '▦', label: 'Overview', href: '/dashboard' },
            { icon: '✦', label: 'Tools',    href: '/dashboard?tab=tools' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
            >
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{session?.user?.name || 'User'}</div>
              <div className="text-[10px] text-white/55 truncate">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* TOP BAR */}
        <header className="h-14 border-b border-white/[0.06] px-4 md:px-6 flex items-center gap-3 flex-shrink-0 sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-white/[0.12]">/</span>
          <span className="text-xs text-white/60 truncate">
            {loading ? '…' : (sub?.name || sub?.email || 'Subscriber')}
          </span>
        </header>

        <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">

          {/* LOADING */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-xl" />
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-20 bg-white/[0.03] border border-white/[0.06] rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <div className="text-red-400 font-medium mb-2">Subscriber not found</div>
              <div className="text-white/40 text-sm mb-4">{error}</div>
              <Link href="/dashboard" className="text-xs text-white/50 hover:text-white transition-colors">
                ← Back to dashboard
              </Link>
            </div>
          )}

          {/* CONTENT */}
          {sub && (
            <div className="space-y-5 max-w-3xl">

              {/* ── PROFILE HEADER ─────────────────────────────────────── */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="flex flex-wrap items-start gap-4">

                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                    sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    sub.status === 'past_due'  ? 'bg-amber-500/10 text-amber-400' :
                                                 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {sub.name?.[0]?.toUpperCase() ?? sub.email[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h1 className="text-lg font-bold">{sub.name || '(no name)'}</h1>
                      <StatusPill status={sub.status} />
                      <SourceBadge source={sub.source} />
                    </div>
                    <div className="text-sm text-white/40 mb-3">{sub.email}</div>
                    <div className="flex flex-wrap gap-2">
                      {/* Actions */}
                      {alertSent ? (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                          ✓ Alert sent to your inbox
                        </span>
                      ) : (
                        <button
                          onClick={sendAlert}
                          disabled={alertSending}
                          className="flex items-center gap-1.5 text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 px-3 py-2.5 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {alertSending ? (
                            <><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />Sending…</>
                          ) : '⚡ Send win-back alert'}
                        </button>
                      )}
                      <button
                        onClick={copyEmail}
                        className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-3 py-2.5 rounded-lg transition-colors"
                      >
                        {copied ? '✓ Copied' : '📋 Copy email'}
                      </button>
                      <a
                        href={`mailto:${sub.email}`}
                        className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-3 py-2.5 rounded-lg transition-colors"
                      >
                        ✉ Open in mail
                      </a>
                      <button
                        onClick={generateWinback}
                        disabled={winbackLoading}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {winbackLoading ? (
                          <><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />Generating…</>
                        ) : '✨ Generate win-back email'}
                      </button>
                    </div>
                    {alertError && (
                      <p className="text-xs text-red-400 mt-2">{alertError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── STAT CARDS ─────────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Monthly value',
                    value: `$${sub.amount.toLocaleString()}`,
                    sub:   sub.currency.toUpperCase(),
                    color: 'text-white',
                    border:'border-white/[0.06]',
                  },
                  {
                    label: 'Tenure',
                    value: tenure !== null ? `${tenure}mo` : '—',
                    sub:   sub.startedAt ? `Since ${fmt(sub.startedAt)}` : 'Start date unknown',
                    color: 'text-white',
                    border:'border-white/[0.06]',
                  },
                  {
                    label: 'Churn score',
                    value: score !== undefined && score !== null ? `${score}/10` : 'Not scored',
                    sub:   score !== undefined && score !== null
                           ? (score >= 7 ? 'High risk — act now' : score >= 5 ? 'Monitor closely' : 'Healthy')
                           : 'Run churn analysis',
                    color: score === undefined || score === null ? 'text-white/40' :
                           score >= 7 ? 'text-orange-400' :
                           score >= 5 ? 'text-amber-400' : 'text-emerald-400',
                    border: score === undefined || score === null ? 'border-white/[0.06]' :
                            score >= 7 ? 'border-orange-500/20' :
                            score >= 5 ? 'border-amber-500/20' : 'border-emerald-500/20',
                  },
                  {
                    label: 'Last active',
                    value: days !== null ? `${days}d ago` : '—',
                    sub:   sub.lastActiveAt ? fmt(sub.lastActiveAt) : 'No activity recorded',
                    color: days !== null && days > 30 ? 'text-red-400' :
                           days !== null && days > 14 ? 'text-amber-400' : 'text-white',
                    border: days !== null && days > 30 ? 'border-red-500/20' :
                            days !== null && days > 14 ? 'border-amber-500/20' : 'border-white/[0.06]',
                  },
                ].map(m => (
                  <div key={m.label} className={`bg-white/[0.02] border rounded-xl p-4 ${m.border}`}>
                    <div className="text-xs text-white/60 mb-2">{m.label}</div>
                    <div className={`text-2xl font-bold mb-0.5 ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-white/50">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* ── CHURN RISK DETAIL ───────────────────────────────────── */}
              {score !== undefined && score !== null && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-sm font-semibold mb-1">Churn risk breakdown</h2>
                      <p className="text-xs text-white/60">
                        Scored {sub.churnScoreUpdatedAt ? fmt(sub.churnScoreUpdatedAt) : 'recently'}.
                        Higher = more at risk.
                      </p>
                    </div>
                    <ScoreBadge score={score} />
                  </div>
                  <div className="space-y-3">
                    <FactorBar label="Activity"   value={Math.round(score * 0.9)} />
                    <FactorBar label="Payment"    value={sub.status === 'past_due' ? 8 : sub.status === 'cancelled' ? 10 : Math.round(score * 0.4)} />
                    <FactorBar label="Tenure"     value={tenure !== null ? Math.max(1, 10 - Math.floor(tenure / 3)) : 5} />
                    <FactorBar label="Plan value" value={sub.amount > 100 ? 7 : sub.amount > 50 ? 5 : 3} />
                  </div>
                  <div className="mt-4 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-xs text-white/50 leading-relaxed">
                    <span className="text-white/70 font-medium">What to do: </span>
                    {score >= 9
                      ? 'Contact them personally today. Every day you wait reduces recovery odds by ~15%.'
                      : score >= 7
                      ? 'Send a personalised win-back email this week. Ask how they\'re getting on with the product.'
                      : score >= 5
                      ? 'Send a helpful tip or re-engagement offer to keep them warm.'
                      : 'No immediate action needed. Continue monitoring.'}
                  </div>
                </div>
              )}

              {/* ── WIN-BACK EMAIL GENERATOR ───────────────────────────── */}
              {winbackOpen && (
                <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl">
                  {/* Header */}
                  <div className="flex flex-col gap-3 px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✨</span>
                        <h2 className="text-sm font-semibold">AI Win-Back Email</h2>
                        {winbackLoading && (
                          <span className="text-xs text-white/55 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 border border-white/30 border-t-transparent rounded-full animate-spin" />
                            Writing…
                          </span>
                        )}
                      </div>
                    <div className="flex items-center gap-2">
                      {winbackEmail && (
                        <>
                          <button
                            onClick={copyWinback}
                            className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {winbackCopied ? '✓ Copied' : '📋 Copy email'}
                          </button>
                          <a
                            href={`mailto:${sub.email}?subject=${encodeURIComponent(winbackEmail.subject)}&body=${encodeURIComponent(winbackEmail.body)}`}
                            className="text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            ✉ Open in mail
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => setWinbackOpen(false)}
                        className="text-white/55 hover:text-white/60 text-sm px-2 py-1 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    </div>

                    {/* Tone selector */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-white/55 uppercase tracking-widest font-medium">Tone</span>
                      {([
                        { key: 'warm',         label: '🤝 Warm' },
                        { key: 'professional', label: '💼 Professional' },
                        { key: 'casual',       label: '💬 Casual' },
                        { key: 'urgent',       label: '⚡ Urgent' },
                      ] as const).map(t => (
                        <button
                          key={t.key}
                          onClick={() => setWinbackTone(t.key)}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            winbackTone === t.key
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loading skeleton */}
                  {winbackLoading && (
                    <div className="px-5 py-5 space-y-3 animate-pulse">
                      <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-2 bg-white/[0.04] rounded w-full" />
                      <div className="h-2 bg-white/[0.04] rounded w-5/6" />
                      <div className="h-2 bg-white/[0.04] rounded w-4/5" />
                      <div className="h-2 bg-white/[0.04] rounded w-full" />
                      <div className="h-2 bg-white/[0.04] rounded w-3/5" />
                    </div>
                  )}

                  {/* Error */}
                  {winbackError && (
                    <div className="px-5 py-4">
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{winbackError}</p>
                      <button onClick={generateWinback} className="mt-3 text-xs text-emerald-400 hover:underline">
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Email output */}
                  {winbackEmail && !winbackLoading && (
                    <div className="divide-y divide-white/[0.05]">
                      {/* Subject */}
                      <div className="px-5 py-3 flex items-center gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/55 w-14 flex-shrink-0">Subject</span>
                        <input
                          type="text"
                          value={winbackEmail.subject}
                          onChange={e => setWinbackEmail(prev => prev ? { ...prev, subject: e.target.value } : prev)}
                          className="flex-1 text-sm font-medium text-white bg-transparent border-b border-white/[0.08] focus:border-emerald-500/40 focus:outline-none py-0.5 transition-colors"
                        />
                      </div>

                      {/* Body */}
                      <div className="px-5 py-4">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/55 mb-3">Body</div>
                        <textarea
                          value={winbackEmail.body}
                          onChange={e => {
                            setWinbackEmail(prev => prev ? { ...prev, body: e.target.value } : prev)
                            e.target.style.height = 'auto'
                            e.target.style.height = e.target.scrollHeight + 'px'
                          }}
                          ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
                          className="w-full text-sm text-white/80 leading-relaxed bg-white/[0.02] rounded-lg px-4 py-3 border border-white/[0.05] focus:border-emerald-500/30 focus:outline-none resize-none overflow-hidden transition-colors"
                        />
                      </div>

                      {/* Talking points */}
                      {winbackEmail.talkingPoints.length > 0 && (
                        <div className="px-5 py-4">
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/55 mb-3">Follow-up talking points</div>
                          <ul className="space-y-2">
                            {winbackEmail.talkingPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                                <span className="text-emerald-400 flex-shrink-0 mt-0.5">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Regenerate */}
                      <div className="px-5 py-3 flex items-center justify-between">
                        <span className="text-[10px] text-white/45">Generated by AI · always review before sending</span>
                        <button
                          onClick={generateWinback}
                          className="text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                          ↻ Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── SUBSCRIPTION TIMELINE ──────────────────────────────── */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-4">Subscription timeline</h2>
                <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">

                  {sub.startedAt && (
                    <div className="relative flex gap-4 items-start">
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#080808] flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-white/80">Subscribed</div>
                        <div className="text-xs text-white/55 mt-0.5">{fmt(sub.startedAt)}</div>
                      </div>
                    </div>
                  )}

                  {sub.lastActiveAt && (
                    <div className="relative flex gap-4 items-start">
                      <div className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#080808] flex-shrink-0 ${
                        days !== null && days > 30 ? 'bg-red-400' :
                        days !== null && days > 14 ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      <div>
                        <div className="text-xs font-medium text-white/80">Last active</div>
                        <div className="text-xs text-white/55 mt-0.5">
                          {fmt(sub.lastActiveAt)}
                          {days !== null && (
                            <span className={`ml-2 ${days > 30 ? 'text-red-400' : days > 14 ? 'text-amber-400' : 'text-white/40'}`}>
                              ({days} days ago)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {sub.cancelledAt && (
                    <div className="relative flex gap-4 items-start">
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-red-400 ring-4 ring-[#080808] flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-red-400">Cancelled</div>
                        <div className="text-xs text-white/55 mt-0.5">{fmt(sub.cancelledAt)}</div>
                      </div>
                    </div>
                  )}

                  <div className="relative flex gap-4 items-start">
                    <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-white/20 ring-4 ring-[#080808] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-white/50">Record created</div>
                      <div className="text-xs text-white/50 mt-0.5">{fmt(sub.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SUBSCRIPTION DETAILS ───────────────────────────────── */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-4">Subscription details</h2>
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Plan',      value: sub.plan || '—' },
                    { label: 'Amount',    value: `$${sub.amount}/mo` },
                    { label: 'Currency',  value: sub.currency.toUpperCase() },
                    { label: 'Status',    value: sub.status },
                    { label: 'Source',    value: sub.source },
                    { label: 'Source ID', value: sub.sourceId || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-xs text-white/55 mb-1">{label}</dt>
                      <dd className="text-xs font-medium text-white/80 truncate">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>


            </div>
          )}
        </main>
      </div>
    </div>
  )
}
