'use client'

import { useState, useEffect, useRef } from 'react'
import { signOut } from 'next-auth/react'
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
  taxPot: {
    mrr:      number
    setAside: number
    rate:     number
  }
  trial: {
    expired:    boolean
    daysLeft:   number | null
    onPaidPlan: boolean
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
  if (s.daysInactive && s.daysInactive > 7)  reasons.push(`${s.daysInactive} days inactive`)
  if (s.churnScore && s.churnScore >= 7)      reasons.push('Engagement drop')
  if (s.churnScore && s.churnScore >= 9)      reasons.push('High cancellation probability')
  if (reasons.length === 0)                   reasons.push('Activity below normal baseline')
  return reasons
}

// ─── Email preview modal ───────────────────────────────────────────────────────

type EmailPreview = {
  subscriberId: string
  subscriberName: string
  subscriberEmail: string
  subject: string
  body: string
}

function EmailPreviewModal({ preview, onClose, onSend, sending, sent }: {
  preview: EmailPreview
  onClose: () => void
  onSend: () => void
  sending: boolean
  sent: boolean
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(`Subject: ${preview.subject}\n\n${preview.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <div className="text-sm font-semibold">AI win-back email</div>
            <div className="text-xs text-white/40 mt-0.5">For {preview.subscriberName} · {preview.subscriberEmail}</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5 text-xs text-white/50">
            <div className="flex gap-2"><span className="w-14 flex-shrink-0">To:</span><span className="text-white/80">{preview.subscriberEmail}</span></div>
            <div className="flex gap-2"><span className="w-14 flex-shrink-0">Subject:</span><span className="text-white/80">{preview.subject}</span></div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-xs text-[#e8eaed] leading-relaxed whitespace-pre-wrap font-mono">
            {preview.body}
          </div>
          <div className="flex gap-2">
            {sent ? (
              <div className="flex-1 text-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 rounded-lg font-medium">
                ✓ Draft sent to your inbox
              </div>
            ) : (
              <button
                onClick={onSend}
                disabled={sending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-semibold py-2.5 rounded-lg transition-colors"
              >
                {sending ? 'Sending…' : 'Send draft to my inbox'}
              </button>
            )}
            <button
              onClick={copy}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 text-xs font-medium py-2.5 rounded-lg transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── User menu (sidebar bottom) ───────────────────────────────────────────────

function UserMenu({ session, initials }: { session: any; initials: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="px-3 pt-4 pb-11 border-t border-white/[0.08] relative">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#1a1a1a] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl z-50">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            My profile
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors w-full">
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            Toggle theme
            <span className="ml-auto text-xs text-white/30 bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">M</span>
          </button>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Homepage
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors w-full">
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 010 5.304m2.121-7.425a6.75 6.75 0 010 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 01-1.06-2.122m-1.061 4.243a6.75 6.75 0 01-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12z" />
            </svg>
            Onboarding
          </button>
          <div className="border-t border-white/[0.08]">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/[0.06] transition-colors w-full"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Log out
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 border-t border-white/[0.08] bg-white/[0.03]">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
              {initials}
            </div>
            <span className="text-xs text-white/40 truncate">{session?.user?.email}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 text-left">
          <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
          <div className="text-xs text-white/40 truncate">{session?.user?.email}</div>
        </div>
        <svg className="w-3.5 h-3.5 text-white/20 ml-auto flex-shrink-0 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
        </svg>
      </button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({ session }: { session: any }) {
  const [data, setData]                   = useState<DashboardData | null>(null)
  const [loading, setLoading]             = useState(true)
  const [briefingSending, setBriefing]    = useState(false)
  const [briefingSent, setBriefingSent]   = useState(false)
  const [briefingError, setBriefingError] = useState<string | null>(null)
  const [briefingPreview, setBriefingPreview] = useState<{ briefingText: string; topPriority: string; topActions: { label: string; description: string; urgency: string }[] } | null>(null)
  const [briefingPreviewing, setBriefingPreviewing] = useState(false)
  const [activeSection, setSection]       = useState<'overview' | 'subscribers' | 'at-risk' | 'tools'>('overview')
  const [subSearch, setSubSearch]         = useState('')
  const [subFilter, setSubFilter]         = useState<'all' | 'active' | 'cancelled' | 'past_due'>('all')
  const [taxOpen, setTaxOpen]             = useState(false)
  const [sendingId, setSendingId]         = useState<string | null>(null)
  const [sentIds, setSentIds]             = useState<Set<string>>(new Set())
  const [showAllRisk, setShowAllRisk]     = useState(false)
  const [emailPreview, setEmailPreview]   = useState<EmailPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)
  const [sendingFromModal, setSendingFromModal] = useState(false)
  const [sentFromModal, setSentFromModal]       = useState(false)

  async function previewBriefing() {
    setBriefingPreviewing(true)
    setBriefingError(null)
    try {
      const res = await fetch('/api/alerts/briefing')
      const d   = await res.json()
      if (d.error) throw new Error(d.error)
      setBriefingPreview(d)
    } catch (err: any) {
      setBriefingError(err.message || 'Failed to generate preview')
    } finally {
      setBriefingPreviewing(false)
    }
  }

  async function sendBriefing() {
    setBriefing(true)
    setBriefingError(null)
    try {
      const res = await fetch('/api/alerts/briefing', { method: 'POST' })
      const d   = await res.json()
      if (d.error) throw new Error(d.error)
      setBriefingSent(true)
      setBriefingPreview(null)
    } catch (err: any) {
      setBriefingError(err.message || 'Failed to send briefing')
    } finally {
      setBriefing(false)
    }
  }

  async function openEmailPreview(subscriberId: string, subscriberName: string) {
    setPreviewLoading(subscriberId)
    setSentFromModal(false)
    try {
      const res  = await fetch('/api/ai/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setEmailPreview({
        subscriberId,
        subscriberName,
        subscriberEmail: json.subscriberEmail,
        subject: json.subject,
        body: json.body,
      })
    } catch {
      // fallback: send directly if preview fails
      sendAIMessage(subscriberId)
    } finally {
      setPreviewLoading(null)
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
      // swallow
    } finally {
      setSendingId(null)
    }
  }

  async function sendFromModal() {
    if (!emailPreview) return
    setSendingFromModal(true)
    await sendAIMessage(emailPreview.subscriberId)
    setSentFromModal(true)
    setSendingFromModal(false)
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
    <>
    <div className="min-h-screen text-white flex" style={{ background: '#0f0f0f' }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.12] flex-shrink-0 h-screen sticky top-0" style={{ background: '#1a1a1a' }}>

        {/* Workspace switcher — 44px top, 32px row, 16px gap */}
        <div className="px-5 pt-11 pb-4">
          <Link href="/" className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="text-[15px] font-semibold flex-1 text-white">SubPilot</span>
            <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
            </svg>
          </Link>
        </div>

        {/* Nav — 40px items, 4px gap */}
        <nav className="flex-1 px-4 pb-2 space-y-1 overflow-y-auto">
          {([
            {
              label: 'Overview', section: 'overview' as const,
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
            },
            {
              label: 'Subscribers', section: 'subscribers' as const,
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
            },
            {
              label: 'At Risk', section: 'at-risk' as const,
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
            },
            {
              label: 'Tools', section: 'tools' as const,
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>,
            },
          ]).map(item => (
            <button
              key={item.label}
              onClick={() => setSection(item.section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${
                activeSection === item.section
                  ? 'bg-white/[0.1] text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${activeSection === item.section ? 'text-white' : 'text-white/35'}`}>
                {item.icon}
              </span>
              {item.label}
              {item.section === 'at-risk' && data && data.atRisk.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-orange-500/25 text-orange-400 px-2 py-0.5 rounded-full">
                  {data.atRisk.length}
                </span>
              )}
            </button>
          ))}

          <div className="mt-6 mb-2 border-t border-white/[0.08]" />

          <Link href="/billing" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
            <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Billing
          </Link>

          <Link href="/account" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
            <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>

        {/* Trial banner — compact, fits the nav style */}
        {data && !data.trial.onPaidPlan && data.trial.daysLeft !== null && (
          <div className="px-4 pb-2">
            <Link
              href="/billing"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${
                data.trial.daysLeft <= 2 ? 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-red-300' :
                data.trial.daysLeft <= 5 ? 'bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 text-amber-300' :
                'text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-bold">{data.trial.daysLeft}d</span> left · Upgrade →</span>
            </Link>
          </div>
        )}

        {/* Briefing shortcut — same style as nav items */}
        <div className="px-4 pb-3">
          {briefingSent ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Briefing sent
            </div>
          ) : (
            <button
              onClick={previewBriefing}
              disabled={briefingPreviewing || briefingSending}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all disabled:opacity-40"
            >
              {briefingPreviewing ? (
                <><span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />Generating…</>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" /></svg>
                  Email briefing
                </>
              )}
            </button>
          )}
        </div>

        {/* User */}
        <UserMenu session={session} initials={initials} />
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
        <header className="h-14 border-b border-white/[0.06] px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 backdrop-blur" style={{ background: 'rgba(15,15,15,0.9)' }}>
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden text-sm font-semibold hover:opacity-75 transition-opacity">
            Sub<span className="text-emerald-400">Pilot</span>
          </Link>
          {/* Error */}
          {briefingError && (
            <span className="text-xs text-red-400 hidden lg:block">{briefingError}</span>
          )}
          <div className="hidden lg:block" />

          {/* Right: utility links */}
          <div className="flex items-center gap-6">
            <a href="#" className="hidden lg:block text-sm text-white/50 hover:text-white/90 transition-colors font-medium">Docs</a>
            <a href="#" className="hidden lg:block text-sm text-white/50 hover:text-white/90 transition-colors font-medium">Help</a>
            <button className="hidden lg:flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white border border-white/[0.15] rounded-lg px-4 py-1.5 hover:bg-white/[0.06] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Feedback
            </button>
            {/* Mobile briefing + avatar */}
            {!briefingSent && (
              <button onClick={sendBriefing} disabled={briefingSending} className="lg:hidden flex items-center gap-1.5 text-xs font-medium bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                {briefingSending ? '…' : '📋'}
              </button>
            )}
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

          {/* ── TRIAL BANNER ──────────────────────────────────────────────────── */}
          {data && !data.trial.onPaidPlan && (
            data.trial.expired ? (
              <div className="mx-4 md:mx-6 mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
                  <div>
                    <div className="text-sm font-semibold text-amber-400">Your free trial has ended</div>
                    <div className="text-xs text-white/50">Churn analysis, AI emails, and Stripe sync are locked. Upgrade to keep protecting your MRR.</div>
                  </div>
                </div>
                <a href="/billing" className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                  Upgrade now →
                </a>
              </div>
            ) : (
              <div className="mx-4 md:mx-6 mt-4 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-xs text-white/60">
                    <span className="text-emerald-400 font-semibold">{data.trial.daysLeft} {data.trial.daysLeft === 1 ? 'day' : 'days'}</span> left on your free trial
                  </span>
                </div>
                <a href="/billing" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  Upgrade →
                </a>
              </div>
            )
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
            const isEmpty  = data.metrics.totalSubscribers === 0

            const DEMO_MRR = [
              { month: 'Oct', mrr: 1200 },
              { month: 'Nov', mrr: 1850 },
              { month: 'Dec', mrr: 1600 },
              { month: 'Jan', mrr: 2400 },
              { month: 'Feb', mrr: 2150 },
              { month: 'Mar', mrr: 3200 },
            ]

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
                {isEmpty ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {['Revenue at risk', 'Recovered revenue', 'Churn rate', 'Subscribers saved'].map(label => (
                      <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                        <div className="text-xs text-[#e8eaed] font-medium mb-3">{label}</div>
                        <div className="text-2xl font-bold tracking-tight mb-1.5 text-white/15">—</div>
                        <div className="text-xs text-white/25">Connect data to see metrics</div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}

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
                        {isEmpty ? (
                          <span className="w-2 h-2 bg-emerald-400/60 rounded-full flex-shrink-0" />
                        ) : (
                          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                        )}
                        <h2 className="text-sm font-semibold">
                          {isEmpty ? 'Quick start' : 'High Risk Subscribers'}
                        </h2>
                      </div>
                      {!isEmpty && data.atRisk.length > 0 && (
                        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
                          {data.atRisk.length} at risk
                        </span>
                      )}
                    </div>

                    {/* Empty state */}
                    {data.atRisk.length === 0 && !isEmpty && (
                      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                        <div className="text-4xl mb-4">🎯</div>
                        <div className="text-sm font-medium text-emerald-400 mb-1.5">No at-risk subscribers</div>
                        <div className="text-xs text-[#e8eaed] max-w-xs">
                          Go to Tools → Run churn analysis to score your subscribers
                        </div>
                      </div>
                    )}

                    {/* Onboarding checklist — shown only when no data imported yet */}
                    {isEmpty && (
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 bg-emerald-500/15 border border-emerald-500/25 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🚀</div>
                          <div>
                            <div className="text-sm font-semibold">Get started in 3 steps</div>
                            <div className="text-xs text-white/40 mt-0.5">Takes about 60 seconds</div>
                          </div>
                        </div>
                        {([
                          {
                            num: 1,
                            title: 'Import your subscribers',
                            desc: 'Connect Stripe for live sync, or upload a CSV file to get started instantly.',
                            active: true,
                            action: (
                              <div className="flex flex-wrap gap-2 mt-3">
                                <SyncButton />
                                <CSVUploadButton />
                              </div>
                            ),
                          },
                          {
                            num: 2,
                            title: 'Run churn analysis',
                            desc: 'SubPilot scores every subscriber for churn risk based on activity and payment signals.',
                            active: false,
                            action: null,
                          },
                          {
                            num: 3,
                            title: 'See who is at risk and act',
                            desc: 'Get a prioritised list of subscribers about to leave — then send AI win-back messages in one click.',
                            active: false,
                            action: null,
                          },
                        ] as const).map((step) => (
                          <div
                            key={step.num}
                            className={`flex gap-4 p-4 rounded-xl border transition-all ${
                              step.active
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-white/[0.02] border-white/[0.05] opacity-45'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                              step.active
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                : 'bg-white/10 border border-white/10 text-white/30'
                            }`}>
                              {step.num}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${step.active ? 'text-white' : 'text-white/50'}`}>{step.title}</div>
                              <div className="text-xs text-white/35 mt-0.5 leading-relaxed">{step.desc}</div>
                              {step.action}
                            </div>
                          </div>
                        ))}
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
                            <div key={s.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/subscribers/${s.id}`}>
                              <div className="flex items-start justify-between gap-4">

                                {/* Left: avatar + details */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {s.name[0]?.toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium">{s.name}</div>
                                    <div className="text-xs text-white/40 mt-0.5">{s.plan} · ${s.amount}/mo</div>
                                    <div className={`text-[11px] font-medium mt-1 ${
                                      s.churnScore && s.churnScore >= 8 ? 'text-red-400' :
                                      s.churnScore && s.churnScore >= 6 ? 'text-orange-400' : 'text-amber-400'
                                    }`}>{urgency}</div>
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                      {reasons.map(r => (
                                        <span key={r} className="text-[10px] bg-white/[0.06] text-white/50 px-2 py-0.5 rounded-full">{r}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: score + button */}
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  {s.churnScore !== undefined && <ScoreBadge score={s.churnScore} />}
                                  {isSent ? (
                                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
                                      ✓ Sent
                                    </span>
                                  ) : (
                                    <button
                                      onClick={e => { e.stopPropagation(); openEmailPreview(s.id, s.name) }}
                                      disabled={!!previewLoading}
                                      className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                      {previewLoading === s.id ? (
                                        <><span className="w-2.5 h-2.5 border border-emerald-400 border-t-transparent rounded-full animate-spin" />Generating…</>
                                      ) : 'Send AI email →'}
                                    </button>
                                  )}
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
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-emerald-400 text-xs">✦</span>
                        <h3 className="text-sm font-semibold">AI Insights</h3>
                      </div>

                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                          <div className="text-sm font-medium text-white/60 mb-1">AI insights will appear here</div>
                          <div className="text-xs text-white/30 leading-relaxed max-w-[200px]">Import your first subscribers to unlock AI-powered churn predictions and win-back recommendations.</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Today's briefing */}
                          <div className="bg-red-500/10 border border-red-500/15 rounded-lg p-3">
                            <div className="text-[10px] text-red-400 uppercase tracking-widest mb-1.5 font-semibold">Today's briefing</div>
                            <div className="text-xs text-[#e8eaed] leading-relaxed">
                              {data.atRisk.length > 0
                                ? `${data.atRisk.length} subscriber${data.atRisk.length > 1 ? 's' : ''} show elevated churn risk. Immediate action on ${data.atRisk[0].name} could protect $${data.atRisk[0].amount}/mo.`
                                : 'All subscribers look healthy today. Keep monitoring for early signals.'}
                            </div>
                          </div>

                          {/* Top priority */}
                          {data.atRisk.length > 0 && (
                            <div className="bg-amber-500/10 border border-amber-500/15 rounded-lg p-3">
                              <div className="text-[10px] text-amber-400 uppercase tracking-widest mb-1.5 font-semibold">Top priority</div>
                              <div className="text-xs text-[#e8eaed] leading-relaxed">
                                Reach out to {data.atRisk[0].name} today.
                                {data.atRisk[0].daysInactive ? ` ${data.atRisk[0].daysInactive} days inactive` : ''}
                                {data.atRisk[0].churnScore ? `, score ${data.atRisk[0].churnScore}/10.` : '.'}
                              </div>
                            </div>
                          )}

                          {/* Revenue opportunities */}
                          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-semibold">Revenue opportunities</div>
                            <div className="space-y-1.5 text-xs text-white/50">
                              {data.metrics.pastDue > 0 && (
                                <div>↑ Recover {data.metrics.pastDue} failed payment{data.metrics.pastDue > 1 ? 's' : ''}</div>
                              )}
                              {data.atRisk.filter(s => (s.churnScore ?? 0) >= 7).length > 1 && (
                                <div>↑ {data.atRisk.filter(s => (s.churnScore ?? 0) >= 7).length} high-risk subscribers need a personal message</div>
                              )}
                              {mrrDelta > 0 && (
                                <div>↑ MRR up ${mrrDelta.toLocaleString()} vs last month — keep momentum</div>
                              )}
                              {data.metrics.pastDue === 0 && data.atRisk.filter(s => (s.churnScore ?? 0) >= 7).length <= 1 && (
                                <div>↑ Good health — focus on onboarding new subscribers</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick stats */}
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 space-y-2">
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">Overview</div>
                      {[
                        { label: 'Active subscribers', value: data.metrics.activeSubscribers.toLocaleString(), color: 'text-emerald-400' },
                        { label: 'Avg revenue / sub',  value: `$${data.metrics.arpu}`,                         color: 'text-white' },
                        { label: 'Past due',            value: String(data.metrics.pastDue),                    color: data.metrics.pastDue > 0 ? 'text-amber-400' : 'text-white/40' },
                        { label: 'Total MRR',           value: `$${data.metrics.mrr.toLocaleString()}`,         color: 'text-white' },
                      ].map(stat => (
                        <div key={stat.label} className="flex items-center justify-between text-xs">
                          <span className="text-white/40">{stat.label}</span>
                          <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
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
                      {!isEmpty && (() => {
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
                      {isEmpty ? (
                        <div className="relative">
                          <div className="blur-sm pointer-events-none select-none">
                            <ResponsiveContainer width="100%" height={220}>
                              <AreaChart data={DEMO_MRR} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.055)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} width={46} />
                                <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2.5} fill="url(#demoGrad)" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="bg-[#080808]/80 border border-white/[0.10] rounded-xl px-6 py-4 text-center backdrop-blur-sm shadow-xl">
                              <div className="text-sm font-semibold mb-1">Your MRR chart will appear here</div>
                              <div className="text-xs text-white/40">Connect Stripe or import a CSV to unlock</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={data.mrrHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.055)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} width={46} />
                            <Tooltip
                              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 12, padding: '8px 14px' }}
                              labelStyle={{ color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}
                              itemStyle={{ color: '#fff', fontWeight: 600 }}
                              formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'MRR']}
                              cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2.5} fill="url(#mrrGrad)" dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10b981', stroke: 'rgba(16,185,129,0.25)', strokeWidth: 4 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
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
              AT RISK SECTION
          ════════════════════════════════════════════════════════════════════ */}
          {data && activeSection === 'at-risk' && (
            <div className="p-4 md:p-6">
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    {data.atRisk.length > 0
                      ? <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                      : <span className="w-2 h-2 bg-emerald-400/60 rounded-full flex-shrink-0" />
                    }
                    <h2 className="text-sm font-semibold">High Risk Subscribers</h2>
                  </div>
                  {data.atRisk.length > 0 && (
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
                      {data.atRisk.length} at risk
                    </span>
                  )}
                </div>

                {data.atRisk.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="text-4xl mb-4">🎯</div>
                    <div className="text-sm font-medium text-emerald-400 mb-1.5">No at-risk subscribers</div>
                    <div className="text-xs text-white/40">Go to Tools → Run churn analysis to score your subscribers</div>
                  </div>
                )}

                {data.atRisk.length > 0 && (
                  <div className="divide-y divide-white/[0.045]">
                    {(showAllRisk ? data.atRisk : data.atRisk.slice(0, 4)).map(s => {
                      const risk    = riskLabel(s.churnScore)
                      const reasons = riskReasons(s)
                      const urgency = churnWindow(s.churnScore, s.daysInactive)
                      const isSent  = sentIds.has(s.id)
                      return (
                        <div key={s.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/subscribers/${s.id}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {s.name[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{s.name}</div>
                                <div className="text-xs text-white/40 mt-0.5">{s.plan} · ${s.amount}/mo</div>
                                <div className={`text-[11px] font-medium mt-1 ${
                                  s.churnScore && s.churnScore >= 8 ? 'text-red-400' :
                                  s.churnScore && s.churnScore >= 6 ? 'text-orange-400' : 'text-amber-400'
                                }`}>{urgency}</div>
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                  {reasons.map(r => (
                                    <span key={r} className="text-[10px] bg-white/[0.06] text-white/50 px-2 py-0.5 rounded-full">{r}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {s.churnScore !== undefined && <ScoreBadge score={s.churnScore} />}
                              {isSent ? (
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">✓ Sent</span>
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); openEmailPreview(s.id, s.name) }}
                                  disabled={!!previewLoading}
                                  className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {previewLoading === s.id ? (
                                    <><span className="w-2.5 h-2.5 border border-emerald-400 border-t-transparent rounded-full animate-spin" />Generating…</>
                                  ) : 'Send AI email →'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {data.atRisk.length > 0 && (
                  <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between gap-3">
                    <span className="text-[11px] text-white/50">${data.metrics.revenueAtRisk.toLocaleString()}/mo at risk</span>
                    <div className="flex items-center gap-3">
                      {data.atRisk.length > 4 && (
                        <button
                          onClick={() => setShowAllRisk(v => !v)}
                          className="text-[11px] font-medium text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {showAllRisk ? '↑ See less' : `↓ See ${data.atRisk.length - 4} more`}
                        </button>
                      )}
                      <button onClick={() => setSection('subscribers')} className="text-[11px] text-white/50 hover:text-white/80 transition-colors">
                        All subscribers →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TOOLS SECTION
          ════════════════════════════════════════════════════════════════════ */}
          {data && activeSection === 'tools' && (
            <div className="p-4 md:p-6 space-y-5">

              <div>
                <h1 className="text-xl font-bold mb-1">Tools</h1>
                <p className="text-sm text-white/40">Connect your data, score your subscribers, and act before they leave.</p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold mb-1">Stripe sync</h2>
                  <p className="text-xs text-white/40">Refresh subscriber data directly from your Stripe account.</p>
                </div>
                <SyncButton trialExpired={data.trial.expired} />
              </div>

              <CSVUploadButton />

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold mb-1">Churn risk analysis</h2>
                  <p className="text-xs text-white/40">
                    Score every subscriber for churn risk based on activity, payment status, and tenure.
                  </p>
                </div>
                <ChurnScoreButton trialExpired={data.trial.expired} />
              </div>

              <AIInsightsPanel trialExpired={data.trial.expired} />

            </div>
          )}

        </main>
      </div>
    </div>

      {emailPreview && (
        <EmailPreviewModal
          preview={emailPreview}
          onClose={() => { setEmailPreview(null); setSentFromModal(false) }}
          onSend={sendFromModal}
          sending={sendingFromModal}
          sent={sentFromModal}
        />
      )}
    </>
  )
}
