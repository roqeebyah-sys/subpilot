'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Plan = 'starter' | 'growth' | 'pro'

type PlanConfig = {
  id: Plan
  name: string
  price: number
  limit: string
  description: string
  features: string[]
  highlight: boolean
}

// ─── Plan definitions ──────────────────────────────────────────────────────────

function getPlans(): PlanConfig[] {
  return [
    {
      id:          'starter',
      name:        'Creator',
      price:       29,
      limit:       'Up to 500 supporters',
      description: 'For independent creators just getting started.',
      highlight:   false,
      features: [
        'Patreon + Gumroad connect',
        'Daily churn risk scores',
        'Morning email briefing',
        'At-risk supporter list',
        'Tax pot calculator',
      ],
    },
    {
      id:          'growth',
      name:        'Pro',
      price:       79,
      limit:       'Up to 2,000 supporters',
      description: 'For growing creators who need to act fast.',
      highlight:   true,
      features: [
        'Everything in Creator',
        'AI win-back email drafts',
        'Revenue opportunity alerts',
        'Failed payment recovery',
        'Priority support',
      ],
    },
    {
      id:          'pro',
      name:        'Studio',
      price:       149,
      limit:       'Unlimited supporters',
      description: 'For serious creator businesses.',
      highlight:   false,
      features: [
        'Everything in Pro',
        'Automated email sending',
        'Team access',
        'Slack + webhook alerts',
        'Dedicated onboarding',
      ],
    },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_ORDER: Plan[] = ['starter', 'growth', 'pro']

function isUpgrade(current: Plan, target: Plan) {
  return PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current)
}

// ─── User menu ─────────────────────────────────────────────────────────────────

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

export default function BillingClient({
  session,
  currentPlan,
  success,
  cancelled,
}: {
  session: any
  currentPlan: Plan
  success: boolean
  cancelled: boolean
}) {
  const router = useRouter()
  const [loading, setLoading]         = useState<Plan | null>(null) // plan id being loaded
  const [error, setError]             = useState<string | null>(null)
  const [portalLoading, setPortal]    = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const initials = session?.user?.name?.[0]?.toUpperCase() || 'U'
  const plans    = getPlans()

  async function startCheckout(planId: Plan) {
    setLoading(planId)
    setError(null)
    try {
      const res  = await fetch('/api/billing/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the plan name — the API resolves the Stripe price ID server-side
        body:    JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  async function openPortal() {
    setPortal(true)
    setPortalError(null)
    try {
      const res  = await fetch('/api/billing/portal')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setPortalError(err.message || 'Failed to open billing portal')
    } finally {
      setPortal(false)
    }
  }

  return (
    <div className="min-h-screen text-white flex" style={{ background: '#0f0f0f' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <span className="flex-shrink-0 text-white/35">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="mt-6 mb-2 border-t border-white/[0.08]" />

          <Link href="/billing" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] bg-white/[0.1] text-white font-semibold transition-all">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 backdrop-blur z-10" style={{ background: 'rgba(15,15,15,0.9)' }}>
          <div className="flex items-center gap-3">
            <span className="lg:hidden text-sm font-semibold">
              Sub<span className="text-emerald-400">Pilot</span>
            </span>
            <span className="text-xs text-[#8e918f]">Billing &amp; Plans</span>
          </div>
          {/* Manage subscription button — only show if not on starter */}
          {currentPlan !== 'starter' && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#e8eaed] hover:text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              {portalLoading ? (
                <><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />Loading…</>
              ) : '⚙ Manage subscription'}
            </button>
          )}
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 md:px-6 md:py-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── SUCCESS / CANCELLED BANNERS ─────────────────────────────── */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-emerald-400 text-lg">✓</span>
                <div>
                  <div className="text-sm font-semibold text-emerald-400">Subscription activated!</div>
                  <div className="text-xs text-[#8e918f] mt-0.5">
                    Your plan is now active. It may take a moment for your limits to update.
                  </div>
                </div>
              </div>
            )}
            {cancelled && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-[#8e918f] text-lg">↩</span>
                <div className="text-sm text-[#8e918f]">Checkout cancelled. You haven't been charged.</div>
              </div>
            )}

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Simple, transparent pricing</h1>
              <p className="text-sm text-white/40">
                Upgrade or downgrade at any time. Cancel anytime with no lock-in.
              </p>
            </div>

            {/* ── PLAN CARDS ─────────────────────────────────────────────── */}
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map(plan => {
                const isActive    = currentPlan === plan.id
                const canUpgrade  = isUpgrade(currentPlan, plan.id)
                const isDowngrade = !isActive && !canUpgrade

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border p-4 md:p-6 transition-all ${
                      plan.highlight
                        ? 'border-white/[0.15] bg-white/[0.06]'
                        : isActive
                        ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                        : 'border-white/[0.08] bg-white/[0.02]'
                    }`}
                  >
                    {/* Most popular badge */}
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                          Most popular
                        </span>
                      </div>
                    )}

                    {/* Current plan badge */}
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e8eaed] bg-white/[0.06] border border-white/[0.10] px-2.5 py-1 rounded-full">
                          Current plan
                        </span>
                      </div>
                    )}

                    {/* Plan name & price */}
                    <div className="mb-5">
                      <h2 className="text-base font-bold mb-1">{plan.name}</h2>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-sm text-[#8e918f]">/month</span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-[#e8eaed]">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isActive ? (
                      <div className="w-full text-center py-2.5 rounded-lg text-sm font-medium border border-white/[0.10] text-white/40 bg-white/[0.03]">
                        Current plan
                      </div>
                    ) : canUpgrade ? (
                      <button
                        onClick={() => startCheckout(plan.id)}
                        disabled={loading === plan.id}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 ${
                          plan.highlight
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                            : 'bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.10] text-white'
                        }`}
                      >
                        {loading === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Redirecting…
                          </span>
                        ) : `Upgrade to ${plan.name}`}
                      </button>
                    ) : (
                      <button
                        onClick={openPortal}
                        disabled={portalLoading}
                        className="w-full py-2.5 rounded-lg text-sm font-medium border border-white/[0.06] text-[#8e918f] hover:text-[#8e918f] hover:border-white/[0.10] transition-colors disabled:opacity-40"
                      >
                        {portalLoading ? 'Loading…' : `Downgrade to ${plan.name}`}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── ERRORS ─────────────────────────────────────────────────── */}
            {(error || portalError) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm text-red-400">
                {error || portalError}
              </div>
            )}

            {/* ── MANAGE SUBSCRIPTION ────────────────────────────────────── */}
            {currentPlan !== 'starter' && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="text-sm font-medium mb-0.5">Manage your subscription</div>
                  <div className="text-xs text-[#e8eaed]">
                    Update payment method, view invoices, or cancel your plan.
                  </div>
                </div>
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#e8eaed] hover:text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
                >
                  {portalLoading ? 'Opening…' : 'Open billing portal →'}
                </button>
              </div>
            )}

            {/* ── FAQ ────────────────────────────────────────────────────── */}
            <div className="border-t border-white/[0.06] pt-8">
              <h2 className="text-sm font-semibold mb-4 text-[#e8eaed]">Frequently asked questions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    q: 'Can I cancel anytime?',
                    a: 'Yes. Cancel from the billing portal and you keep access until the end of your billing period.',
                  },
                  {
                    q: 'What happens when I hit my subscriber limit?',
                    a: 'You\'ll see the oldest subscribers up to your limit. Upgrade to unlock more.',
                  },
                  {
                    q: 'Is there a free trial?',
                    a: 'Not yet, but we\'re considering adding one. Reach out if you need to evaluate the product.',
                  },
                  {
                    q: 'Do you store my Stripe data?',
                    a: 'We read subscriber data via the Stripe API and store it in your SubPilot account. We never store card details.',
                  },
                ].map(item => (
                  <div key={item.q} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="text-xs font-semibold mb-1.5">{item.q}</div>
                    <div className="text-xs text-white/40 leading-relaxed">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
