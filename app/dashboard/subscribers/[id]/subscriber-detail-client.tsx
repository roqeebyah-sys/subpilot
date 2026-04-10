'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

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
    paused:    { dot: 'bg-white/40',    text: 'text-[#8e918f]',    bg: 'bg-white/5',        label: 'Paused' },
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
      <span className="text-xs text-[#8e918f] w-6 text-right font-medium">{value}</span>
    </div>
  )
}

// ─── User menu ───────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen text-white flex" style={{ background: '#0f0f0f' }}>

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.12] flex-shrink-0 h-screen sticky top-0" style={{ background: '#1a1a1a' }}>

        {/* Workspace switcher */}
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

        {/* Nav */}
        <nav className="flex-1 px-4 pb-2 space-y-1 overflow-y-auto">
          {[
            {
              label: 'Overview', href: '/dashboard',
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
            },
            {
              label: 'Subscribers', href: '/dashboard',
              active: true,
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
            },
            {
              label: 'At Risk', href: '/dashboard?tab=at-risk',
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
            },
            {
              label: 'Tools', href: '/dashboard?tab=tools',
              icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>,
            },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${
                item.active
                  ? 'bg-white/[0.1] text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${item.active ? 'text-white' : 'text-white/35'}`}>{item.icon}</span>
              {item.label}
            </Link>
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

        {/* User */}
        <UserMenu session={session} initials={initials} />
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* TOP BAR */}
        <header className="h-14 border-b border-white/[0.06] px-4 md:px-6 flex items-center gap-3 flex-shrink-0 sticky top-0 backdrop-blur z-10" style={{ background: 'rgba(15,15,15,0.9)' }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-white/[0.12]">/</span>
          <span className="text-xs text-[#e8eaed] truncate">
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
                        className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#e8eaed] hover:text-white px-3 py-2.5 rounded-lg transition-colors"
                      >
                        {copied ? '✓ Copied' : '📋 Copy email'}
                      </button>
                      <a
                        href={`mailto:${sub.email}`}
                        className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#e8eaed] hover:text-white px-3 py-2.5 rounded-lg transition-colors"
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
                    <div className="text-xs text-[#e8eaed] mb-2">{m.label}</div>
                    <div className={`text-2xl font-bold mb-0.5 ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-[#8e918f]">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* ── CHURN RISK DETAIL ───────────────────────────────────── */}
              {score !== undefined && score !== null && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-sm font-semibold mb-1">Churn risk breakdown</h2>
                      <p className="text-xs text-[#e8eaed]">
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
                  <div className="mt-4 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-xs text-[#8e918f] leading-relaxed">
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
                          <span className="text-xs text-[#8e918f] flex items-center gap-1.5">
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
                            className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#e8eaed] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
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
                        className="text-[#8e918f] hover:text-white/60 text-sm px-2 py-1 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    </div>

                    {/* Tone selector */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#e8eaed] uppercase tracking-widest font-medium">Tone</span>
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
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8e918f] w-14 flex-shrink-0">Subject</span>
                        <input
                          type="text"
                          value={winbackEmail.subject}
                          onChange={e => setWinbackEmail(prev => prev ? { ...prev, subject: e.target.value } : prev)}
                          className="flex-1 text-sm font-medium text-white bg-transparent border-b border-white/[0.08] focus:border-emerald-500/40 focus:outline-none py-0.5 transition-colors"
                        />
                      </div>

                      {/* Body */}
                      <div className="px-5 py-4">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#8e918f] mb-3">Body</div>
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
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#8e918f] mb-3">Follow-up talking points</div>
                          <ul className="space-y-2">
                            {winbackEmail.talkingPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[#8e918f]">
                                <span className="text-emerald-400 flex-shrink-0 mt-0.5">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Regenerate */}
                      <div className="px-5 py-3 flex items-center justify-between">
                        <span className="text-[10px] text-[#8e918f]">Generated by AI · always review before sending</span>
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

              {/* ── ACTIVITY TIMELINE ──────────────────────────────────── */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-4">Activity timeline</h2>
                <div className="space-y-0 divide-y divide-white/[0.05]">

                  {/* Last login */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-white/50">Last login</span>
                    {sub.lastActiveAt ? (
                      <span className={`text-xs font-medium ${
                        days !== null && days > 30 ? 'text-red-400' :
                        days !== null && days > 14 ? 'text-amber-400' : 'text-white/80'
                      }`}>
                        {days === 0 ? 'Today' : days === 1 ? 'Yesterday' : days !== null ? `${days} days ago` : fmt(sub.lastActiveAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-white/25">No data</span>
                    )}
                  </div>

                  {/* Signed up */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-white/50">Signed up</span>
                    {sub.startedAt ? (
                      <span className="text-xs font-medium text-white/80">
                        {(() => {
                          const m = tenureMonths(sub.startedAt)
                          if (m === null) return fmt(sub.startedAt)
                          if (m === 0) return 'This month'
                          return `${m} ${m === 1 ? 'month' : 'months'} ago`
                        })()}
                      </span>
                    ) : (
                      <span className="text-xs text-white/25">No data</span>
                    )}
                  </div>

                  {/* Last payment */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-white/50">Last payment</span>
                    {sub.status === 'past_due' ? (
                      <span className="text-xs font-medium text-red-400">
                        Failed {sub.updatedAt ? `${daysAgo(sub.updatedAt)} days ago` : 'recently'}
                      </span>
                    ) : sub.status === 'cancelled' ? (
                      <span className="text-xs font-medium text-red-400">
                        Cancelled {sub.cancelledAt ? fmt(sub.cancelledAt) : ''}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-400">Up to date</span>
                    )}
                  </div>

                  {/* Features used */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-white/50">Features used</span>
                    {sub.metadata?.featuresUsed !== undefined ? (
                      <span className={`text-xs font-medium ${
                        sub.metadata.featuresUsed <= 1 ? 'text-red-400' :
                        sub.metadata.featuresUsed <= 3 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {sub.metadata.featuresUsed} of {sub.metadata.totalFeatures ?? 6}
                      </span>
                    ) : (
                      <span className="text-xs text-white/25">No data</span>
                    )}
                  </div>

                  {/* Cancelled */}
                  {sub.cancelledAt && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-xs text-white/50">Cancelled</span>
                      <span className="text-xs font-medium text-red-400">{fmt(sub.cancelledAt)}</span>
                    </div>
                  )}

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
                      <dt className="text-xs text-[#e8eaed] mb-1">{label}</dt>
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
