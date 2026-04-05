'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="border-t border-white/[0.06]" />
}

// ── Check ─────────────────────────────────────────────────────────────────────
function Check() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Pill ──────────────────────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-white/[0.08] text-white/50 text-[11px] font-medium px-2.5 py-1 rounded-full">
      {children}
    </span>
  )
}

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ score }: { score: number }) {
  const cls =
    score >= 9 ? 'text-red-400'    :
    score >= 7 ? 'text-orange-400' :
    score >= 5 ? 'text-amber-400'  : 'text-emerald-400'
  return <span className={`font-mono text-xs font-bold tabular-nums ${cls}`}>{score}/10</span>
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-5 border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-6 text-left group"
      >
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{q}</span>
        <span className={`text-white/30 text-lg leading-none flex-shrink-0 transition-transform mt-0.5 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <p className="mt-3 text-sm text-white/40 leading-relaxed max-w-2xl">{a}</p>}
    </div>
  )
}

// ═══════════════════════════════ PAGE ════════════════════════════════════════

export default function Preview2() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`
  }

  const faqs = [
    { q: 'How does UserRetain connect to my data?',   a: 'UserRetain connects to Stripe via read-only OAuth. We never write to your account, charge your users, or store raw payment data beyond what is needed to compute risk scores. You can also import via CSV.' },
    { q: 'How is the churn risk score calculated?',   a: "We analyse login activity, feature adoption, onboarding completion, and payment reliability daily. Each user gets a score from 1 to 10. The model is specific to your product's behavioural patterns." },
    { q: 'What is the morning briefing?',             a: 'At 7 AM you receive a plain-text email with the top 3 users to contact today, each with an AI-written message personalised to their risk signals. No dashboard required.' },
    { q: 'Is there a free trial?',                    a: 'Yes. Every plan starts with 14 days free, no credit card required. You will see real data within minutes of connecting Stripe or uploading a CSV.' },
    { q: 'Can I cancel anytime?',                     a: 'Yes. No contracts, no lock-in. Cancel from your billing page at any time. Access continues until the end of the billing period.' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased font-sans">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-400 flex items-center justify-center">
              <svg width="10" height="7" viewBox="0 0 12 9" fill="none">
                <path d="M1 7L3.5 4L5.5 6L8.5 2.5L11 1" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">UserRetain</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] text-white/40">
            <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-white/80 transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-white/80 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/signup" className="text-[13px] font-medium bg-emerald-400 hover:bg-emerald-300 text-black px-3.5 py-1.5 rounded-md transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[13px] text-emerald-400 font-medium">Now in early access</span>
          </div>

          <h1 className="text-[2.75rem] font-bold leading-[1.1] tracking-tight mb-5">
            Know which subscribers are about to cancel.
          </h1>

          <p className="text-base text-white/45 leading-relaxed mb-10 max-w-xl">
            UserRetain scores every user for churn risk nightly and delivers your top 3 at-risk contacts each morning — with an AI-written message ready to send.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 bg-white/[0.04] border border-white/[0.10] rounded-md px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-medium px-4 py-2.5 rounded-md transition-colors flex-shrink-0"
            >
              Start free trial
            </button>
          </form>
          <p className="text-xs text-white/25 mt-3">14 days free. No credit card.</p>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden">
          {[
            { v: '94%',  l: 'Prediction accuracy' },
            { v: '2.4×', l: 'Average ROI' },
            { v: '7 min',l: 'Setup time' },
            { v: '$0',   l: 'For 14 days' },
          ].map(s => (
            <div key={s.v} className="bg-[#0a0a0a] px-6 py-5">
              <div className="text-2xl font-bold tracking-tight text-white mb-1">{s.v}</div>
              <div className="text-xs text-white/35">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-14">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-2xl font-bold tracking-tight">Everything you need. Nothing you don't.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden">
          {[
            {
              title: 'Nightly churn scoring',
              desc:  'Every subscriber scored 1–10 each night based on login activity, feature adoption, onboarding, and payment reliability.',
              tag:   'Automated',
            },
            {
              title: 'Morning briefing email',
              desc:  'At 7 AM: your top 3 at-risk users, each with an AI-written outreach message tailored to their specific signals.',
              tag:   'Daily',
            },
            {
              title: 'AI win-back emails',
              desc:  'One click generates a personalised email for any user — draft, edit, and send without leaving the dashboard.',
              tag:   'AI',
            },
            {
              title: 'Stripe sync',
              desc:  'Read-only OAuth connection. Live subscriber data in minutes. No CSV wrangling, no manual exports.',
              tag:   'Instant',
            },
            {
              title: 'Subscriber profiles',
              desc:  'Click any user to see their activity timeline, churn score breakdown, payment history, and onboarding status.',
              tag:   'Detail',
            },
            {
              title: 'Tax pot calculator',
              desc:  'Calculates 30% of MRR automatically each month and tells you exactly how much to set aside for tax.',
              tag:   'Finance',
            },
          ].map(f => (
            <div key={f.title} className="bg-[#0a0a0a] px-7 py-7 group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest flex-shrink-0 mt-0.5">{f.tag}</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-14">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-2xl font-bold tracking-tight">Three steps.</h2>
        </div>

        <div className="space-y-0 border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
          {[
            { n: '01', title: 'Connect', body: 'Link Stripe via read-only OAuth or upload a CSV. Takes under 7 minutes.' },
            { n: '02', title: 'Score',   body: 'We score every user nightly. You wake up knowing exactly who to contact and why.' },
            { n: '03', title: 'Retain',  body: 'Open the AI-drafted email, edit if needed, send. One saved subscriber pays for months of UserRetain.' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-8 px-7 py-6 bg-[#0a0a0a] hover:bg-white/[0.02] transition-colors">
              <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0 w-6">{step.n}</span>
              <div>
                <div className="text-sm font-semibold mb-1.5">{step.title}</div>
                <div className="text-sm text-white/40 leading-relaxed">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── DEMO PREVIEW ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Dashboard preview</p>
          <h2 className="text-2xl font-bold tracking-tight">What you'll see every morning.</h2>
        </div>

        <div className="border border-white/[0.08] rounded-xl overflow-hidden">
          {/* Browser chrome */}
          <div className="bg-[#111111] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            </div>
            <div className="flex-1 bg-white/[0.04] rounded px-3 py-1 text-[11px] text-white/30 max-w-[180px] mx-auto text-center">
              app.userretain.io
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 divide-x divide-white/[0.06] border-b border-white/[0.06]">
            {[
              { label: 'MRR',          value: '$4,820', delta: '+6.2%',  up: true  },
              { label: 'Subscribers',  value: '347',    delta: '+12',    up: true  },
              { label: 'At risk',      value: '4',      delta: 'critical', up: false },
              { label: 'Churn rate',   value: '3.2%',   delta: '-0.4%',  up: true  },
            ].map(k => (
              <div key={k.label} className="px-5 py-4 bg-[#0a0a0a]">
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{k.label}</div>
                <div className="text-lg font-bold tabular-nums">{k.value}</div>
                <div className={`text-[11px] mt-0.5 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* At-risk table */}
          <div className="bg-[#0a0a0a]">
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-medium text-white/60">High risk subscribers</span>
              <span className="text-[11px] text-emerald-400 font-medium">4 need attention</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Name', 'Plan', 'MRR', 'Inactive', 'Score'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {[
                  { name: 'James Mitchell',  plan: 'Pro',     mrr: '$49', days: '34d', score: 9 },
                  { name: 'Sarah Chen',      plan: 'Growth',  mrr: '$29', days: '21d', score: 8 },
                  { name: 'Marcus Johnson',  plan: 'Starter', mrr: '$9',  days: '18d', score: 7 },
                  { name: 'Priya Sharma',    plan: 'Pro',     mrr: '$49', days: '15d', score: 7 },
                ].map(r => (
                  <tr key={r.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium text-white/80">{r.name}</td>
                    <td className="px-5 py-3 text-white/40">{r.plan}</td>
                    <td className="px-5 py-3 font-mono text-white/60">{r.mrr}</td>
                    <td className="px-5 py-3 font-mono text-white/40">{r.days}</td>
                    <td className="px-5 py-3"><RiskBadge score={r.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── PRICING ── */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-14">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl font-bold tracking-tight">Simple pricing.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: 'Starter',
              price: '$29',
              desc: 'For founders just getting started.',
              features: ['Up to 500 subscribers', 'Nightly churn scoring', 'Morning briefing email', 'CSV import'],
              highlight: false,
            },
            {
              name: 'Growth',
              price: '$79',
              desc: 'For teams scaling past 1,000 users.',
              features: ['Up to 5,000 subscribers', 'Everything in Starter', 'AI win-back emails', 'Stripe sync', 'Priority support'],
              highlight: true,
            },
            {
              name: 'Pro',
              price: '$149',
              desc: 'For established products with high volume.',
              features: ['Unlimited subscribers', 'Everything in Growth', 'Custom alert rules', 'API access', 'Dedicated support'],
              highlight: false,
            },
          ].map(plan => (
            <div
              key={plan.name}
              className={`border rounded-xl p-6 flex flex-col ${
                plan.highlight
                  ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                  : 'border-white/[0.08] bg-white/[0.02]'
              }`}
            >
              {plan.highlight && (
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-4">Most popular</div>
              )}
              <div className="text-sm font-semibold mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-white/30">/mo</span>
              </div>
              <p className="text-xs text-white/35 mb-6 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/50">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`text-center text-sm font-medium py-2.5 rounded-md transition-colors ${
                  plan.highlight
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                    : 'border border-white/[0.10] hover:border-white/[0.20] text-white/70 hover:text-white'
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/20 mt-5">All plans include a 14-day free trial. No credit card required.</p>
      </section>

      <Divider />

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-2xl font-bold tracking-tight">Common questions.</h2>
        </div>
        <div className="max-w-2xl">
          {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      <Divider />

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Ready to stop losing subscribers?</h2>
          <p className="text-sm text-white/40 leading-relaxed mb-8">
            One saved subscriber covers three months of UserRetain. Start your trial in under 7 minutes.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 bg-white/[0.04] border border-white/[0.10] rounded-md px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-medium px-4 py-2.5 rounded-md transition-colors flex-shrink-0"
            >
              Get started
            </button>
          </form>
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ── */}
      <footer className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-400 flex items-center justify-center">
            <svg width="10" height="7" viewBox="0 0 12 9" fill="none">
              <path d="M1 7L3.5 4L5.5 6L8.5 2.5L11 1" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">UserRetain</span>
        </div>
        <div className="flex items-center gap-6 text-[13px] text-white/25">
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          <Link href="/terms"   className="hover:text-white/50 transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-white/50 transition-colors">Cookies</Link>
          <a href="mailto:support@userretain.io" className="hover:text-white/50 transition-colors">Contact</a>
        </div>
        <span className="text-[13px] text-white/20">© 2025 UserRetain</span>
      </footer>

    </div>
  )
}
