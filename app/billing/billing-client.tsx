'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen bg-[#080808] text-white flex">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[216px] border-r border-white/[0.06] flex-shrink-0 h-screen sticky top-0">
        <div className="px-5 h-14 flex items-center border-b border-white/[0.06]">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity">
            Sub<span className="text-emerald-400">Pilot</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: '▦', label: 'Overview', href: '/dashboard' },
            { icon: '✦', label: 'Tools',    href: '/dashboard?tab=tools' },
            { icon: '◈', label: 'Billing',  href: '/billing', active: true },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-white/[0.07] text-white'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
              }`}
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
              <div className="text-[10px] text-white/30 truncate">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <span className="lg:hidden text-sm font-semibold">
              Sub<span className="text-emerald-400">Pilot</span>
            </span>
            <span className="text-xs text-white/30">Billing &amp; Plans</span>
          </div>
          {/* Manage subscription button — only show if not on starter */}
          {currentPlan !== 'starter' && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
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
                  <div className="text-xs text-white/50 mt-0.5">
                    Your plan is now active. It may take a moment for your limits to update.
                  </div>
                </div>
              </div>
            )}
            {cancelled && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-white/30 text-lg">↩</span>
                <div className="text-sm text-white/50">Checkout cancelled. You haven't been charged.</div>
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
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/[0.06] border border-white/[0.10] px-2.5 py-1 rounded-full">
                          Current plan
                        </span>
                      </div>
                    )}

                    {/* Plan name & price */}
                    <div className="mb-5">
                      <h2 className="text-base font-bold mb-1">{plan.name}</h2>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-sm text-white/30">/month</span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-white/60">
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
                        className="w-full py-2.5 rounded-lg text-sm font-medium border border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/[0.10] transition-colors disabled:opacity-40"
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
                  <div className="text-xs text-white/35">
                    Update payment method, view invoices, or cancel your plan.
                  </div>
                </div>
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
                >
                  {portalLoading ? 'Opening…' : 'Open billing portal →'}
                </button>
              </div>
            )}

            {/* ── FAQ ────────────────────────────────────────────────────── */}
            <div className="border-t border-white/[0.06] pt-8">
              <h2 className="text-sm font-semibold mb-4 text-white/60">Frequently asked questions</h2>
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
