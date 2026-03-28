'use client'
import { useState } from 'react'

/* ─────────────────────────── tiny helpers ─────────────────────────────── */

function Check() {
  return (
    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity=".25" />
      <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 16 16" fill="none"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────── sub-components ───────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border border-white/[0.07] rounded-xl overflow-hidden transition-colors hover:border-white/[0.12]"
      onClick={() => setOpen(o => !o)}
    >
      <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
        <span className="text-sm font-medium text-white/85">{q}</span>
        <Chevron open={open} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 300 : 0 }}
      >
        <p className="px-5 pb-5 text-sm text-white/45 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

/* dashboard mockup used in hero */
function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] bg-[#080808]">
      {/* Browser chrome */}
      <div className="bg-[#101010] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
        </div>
        <div className="flex-1 bg-white/[0.04] rounded-md px-3 py-1 text-[10px] text-white/45 max-w-[180px] mx-auto text-center">
          app.subpilot.io/dashboard
        </div>
      </div>
      {/* App shell */}
      <div className="flex" style={{ minHeight: 380 }}>
        {/* Sidebar */}
        <div className="w-40 border-r border-white/[0.05] p-3 flex-shrink-0 hidden sm:flex flex-col">
          <div className="px-2 py-3 text-sm font-bold mb-4">
            Sub<span className="text-emerald-400">Pilot</span>
          </div>
          {[
            { icon: '▦', label: 'Overview',    active: true  },
            { icon: '◧', label: 'Subscribers', active: false },
            { icon: '✦', label: 'Tools',       active: false },
            { icon: '◈', label: 'Billing',     active: false },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-0.5 ${
                item.active ? 'bg-white/[0.07] text-white' : 'text-white/50'
              }`}
            >
              <span className="text-[10px]">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { label: 'MRR',         value: '$4,820', delta: '+12%', up: true  },
              { label: 'Subscribers', value: '347',    delta: '+8',   up: true  },
              { label: 'At risk',     value: '23',     delta: '+5',   up: false },
              { label: 'Churn rate',  value: '3.2%',   delta: '-0.4', up: true  },
            ].map(m => (
              <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[9px] text-[#e8eaed] mb-1 uppercase tracking-widest">{m.label}</div>
                <div className="text-sm font-bold mb-0.5">{m.value}</div>
                <div className={`text-[9px] font-semibold ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>{m.delta}</div>
              </div>
            ))}
          </div>
          {/* Action centre + chart */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.05] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-semibold">Action centre</span>
                <span className="ml-auto text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">23 at risk</span>
              </div>
              {[
                { name: 'James M.',  score: 9, days: 34, badge: 'bg-red-500/20 text-red-400'    },
                { name: 'Sarah K.',  score: 8, days: 21, badge: 'bg-orange-500/20 text-orange-400' },
                { name: 'David L.',  score: 6, days: 18, badge: 'bg-amber-500/20 text-amber-400'  },
              ].map(r => (
                <div key={r.name} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[8px] font-bold text-white/50">{r.name[0]}</div>
                    <div>
                      <div className="text-[10px] font-medium">{r.name}</div>
                      <div className="text-[8px] text-white/50">{r.days}d inactive</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.badge}`}>{r.score}/10</span>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
              <div className="text-[10px] font-semibold mb-2">MRR growth ↑ 12%</div>
              <div className="flex items-end gap-0.5 h-16">
                {[38,44,51,48,60,57,72].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all" style={{
                    height: `${h}%`,
                    background: i === 6 ? '#10b981' : 'rgba(16,185,129,0.18)',
                  }} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['Oct','Nov','Dec','Jan','Feb','Mar','Apr'].map(m => (
                  <span key={m} className="text-[7px] text-white/45 flex-1 text-center">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ PAGE ═══════════════════════════════════════ */

export default function Home() {
  const [email, setEmail]   = useState('')
  const [submitted, submit] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    submit(true)
  }

  const faqs = [
    {
      q: 'Which platforms does SubPilot support?',
      a: 'SubPilot currently connects to Patreon, Gumroad, and Stripe. More platforms (OnlyFans, Ko-fi, Memberful) are on the roadmap. All connections are read-only — we never touch your money or post on your behalf.',
    },
    {
      q: 'How does the churn risk score work?',
      a: "Our AI analyses each subscriber's activity patterns, engagement history, payment reliability, and account age daily. Every subscriber receives a score from 1 (healthy) to 10 (immediate risk). The model improves over time as it learns the patterns unique to your audience.",
    },
    {
      q: 'What is the morning briefing email?',
      a: 'Every morning at 7 AM you receive a plain-text email with the top 3 subscribers to reach out to that day, each with an AI-written suggested message tailored to their specific risk factors. No dashboard required.',
    },
    {
      q: 'Can I try it before paying?',
      a: 'Yes — every plan starts with a free 14-day trial, no credit card required. You will see real data from your subscribers within minutes of connecting your platform.',
    },
    {
      q: 'What is the AI win-back email feature?',
      a: 'On the Pro and Studio plans, clicking any at-risk subscriber opens an AI-drafted win-back email personalised with their history, plan, and inactivity period. You can edit the subject and body, choose a tone (warm, professional, casual, urgent), and send directly from SubPilot or copy it to your own email client.',
    },
    {
      q: 'Is my data safe?',
      a: 'SubPilot uses read-only API access and never stores raw subscriber financial data beyond what is needed to compute risk scores. All connections are encrypted in transit and at rest. We do not sell or share your data with third parties.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes — no contracts, no lock-in. Cancel from your billing page at any time. If you cancel mid-month you retain access until the end of the billing period.',
    },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white antialiased">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" className="text-base font-bold tracking-tight hover:opacity-80 transition-opacity">
            Sub<span className="text-emerald-400">Pilot</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-sm text-white/45">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how"      className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/auth/login"
              className="text-sm text-white/45 hover:text-white transition-colors px-3 py-1.5">
              Log in
            </a>
            <a href="/auth/signup"
              className="bg-white hover:bg-white/90 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-black/20">
              Get started free →
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/50 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0a] px-4 py-4 space-y-3">
            {['Features','How it works','Pricing','FAQ'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '')}`}
                className="block text-sm text-white/50 hover:text-white transition-colors py-1"
                onClick={() => setMobileOpen(false)}>
                {l}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2 border-t border-white/[0.06]">
              <a href="/auth/login" className="text-sm text-center text-white/50 hover:text-white transition-colors py-2">Log in</a>
              <a href="/auth/signup" className="bg-white text-black text-sm font-semibold text-center py-2.5 rounded-lg">Get started free →</a>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              For Patreon creators, Gumroad sellers &amp; newsletter writers
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.1] tracking-tight mb-6">
              Stop losing paying subscribers<br />
              <span className="text-emerald-400">without knowing why</span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
              SubPilot detects at-risk subscribers and helps you win them back — across platforms like Patreon, Gumroad, and Stripe.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex gap-2 flex-1 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-white/[0.05] border border-white/[0.10] rounded-lg px-4 py-3 text-sm placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button type="submit"
                    className="bg-white hover:bg-white/90 text-black font-semibold px-5 py-3 rounded-lg text-sm transition-all shadow-lg shadow-black/20 whitespace-nowrap">
                    Get started free
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-3 rounded-lg text-sm font-medium max-w-sm">
                  ✓ You're in — we'll be in touch within 24 hours.
                </div>
              )}
              <a href="/dashboard"
                className="inline-flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white border border-white/[0.10] hover:border-white/20 px-5 py-3 rounded-lg transition-all">
                View demo →
              </a>
            </div>

            <p className="text-xs text-white/50">No credit card required · Free 14-day trial</p>

            {/* Trust logos */}
            <div className="mt-10 flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-white/50 uppercase tracking-widest">Works with</span>
              {['Patreon', 'Gumroad', 'Stripe'].map(p => (
                <span key={p}
                  className="text-xs text-[#e8eaed] border border-white/[0.08] rounded-md px-2.5 py-1 bg-white/[0.03]">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Right: dashboard */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-emerald-500/[0.04] rounded-3xl blur-3xl pointer-events-none" />
            <DashboardMockup />
            <p className="text-center text-[11px] text-white/45 mt-3">
              Your daily command centre — every at-risk subscriber, one click away
            </p>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF NUMBERS ──────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 grid grid-cols-3 gap-6 text-center">
          {[
            { val: '23%',     label: 'Average annual income lost to silent churn' },
            { val: '18 days', label: 'Average warning before a subscriber cancels' },
            { val: '34%',     label: 'Churn reduction in the first 30 days' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1.5">{s.val}</div>
              <div className="text-xs text-[#e8eaed] leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <div className="text-xs text-[#e8eaed] font-medium uppercase tracking-widest mb-3">The problem</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          Churn is silent — until it's<br className="hidden md:block" /> too late to do anything
        </h2>
        <p className="text-white/45 text-base leading-relaxed mb-12 max-w-xl mx-auto">
          Most creator platforms give you a subscriber count. They don't tell you which of those subscribers are drifting away, or why, or what you could do to keep them.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: '👻',
              title: 'Silent cancellations',
              desc: 'Subscribers disengage weeks before they cancel. You only find out when the payment stops.',
            },
            {
              icon: '📉',
              title: 'No early warning',
              desc: 'Platforms show you historical data — not predictive signals. By the time you see churn, it\'s gone.',
            },
            {
              icon: '✉️',
              title: 'Generic outreach',
              desc: 'Sending the same email to everyone is ineffective. The right message for each subscriber is different.',
            },
          ].map(p => (
            <div key={p.title}
              className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="text-sm font-semibold mb-2">{p.title}</div>
              <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">The solution</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Detect. Predict. Recover.</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Three stages, one system. SubPilot works in the background so you can focus on creating.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Detect',
                color: 'border-blue-500/20 bg-blue-500/[0.03]',
                accent: 'text-blue-400',
                desc: 'SubPilot monitors every subscriber daily — activity, engagement, payment patterns, and account age. No manual work required.',
                points: ['Automatic sync every 24 hours', 'Multi-platform in one view', 'Zero setup after connection'],
              },
              {
                step: '02',
                icon: '🧠',
                title: 'Predict',
                color: 'border-orange-500/20 bg-orange-500/[0.03]',
                accent: 'text-orange-400',
                desc: 'Our AI scores every subscriber 1–10 for churn risk each morning, with plain-English reasons you can act on immediately.',
                points: ['Scores update every morning', 'Reason breakdown per subscriber', 'Grouped by High / Medium / Low'],
              },
              {
                step: '03',
                icon: '✉️',
                title: 'Recover',
                color: 'border-emerald-500/20 bg-emerald-500/[0.03]',
                accent: 'text-emerald-400',
                desc: 'Get the right message for the right subscriber — personalised win-back emails drafted by AI, ready to send in one click.',
                points: ['AI win-back emails per subscriber', 'Tone selector (warm, casual, urgent)', 'Copy or send direct from SubPilot'],
              },
            ].map(s => (
              <div key={s.step}
                className={`border rounded-2xl p-6 ${s.color} hover:brightness-110 transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${s.accent}`}>{s.step}</div>
                    <div className="text-base font-bold">{s.title}</div>
                  </div>
                </div>
                <p className="text-sm text-white/45 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.points.map(pt => (
                    <li key={pt} className="flex items-start gap-2 text-xs text-white/50">
                      <Check />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT (alternating) ─────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 space-y-20 md:space-y-32">
        <div className="text-center">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Inside SubPilot</div>
          <h2 className="text-3xl md:text-4xl font-bold">Every feature you actually need</h2>
        </div>

        {/* Feature 1 — Churn scores */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Churn risk scoring</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">
              Every subscriber scored 1–10, every morning
            </h3>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              Our AI checks activity, payment history, and engagement drops. Each subscriber gets a score so you know exactly who to call — not who might cancel.
            </p>
            <ul className="space-y-3">
              {[
                { badge: '9–10', color: 'bg-red-500/20 text-red-400 border-red-500/20',       label: 'Immediate risk — reach out today' },
                { badge: '7–8',  color: 'bg-orange-500/20 text-orange-400 border-orange-500/20', label: 'High risk — worth a personal message' },
                { badge: '4–6',  color: 'bg-amber-500/20 text-amber-400 border-amber-500/20',  label: 'Moderate — keep an eye on them' },
                { badge: '1–3',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', label: 'Healthy — no action needed' },
              ].map(t => (
                <li key={t.badge} className="flex items-center gap-3 text-sm text-[#e8eaed]">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${t.color}`}>{t.badge}</span>
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
          {/* Mockup */}
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#080808] shadow-2xl shadow-black/50">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold">At-risk subscribers</span>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">8 at risk</span>
            </div>
            {[
              { name: 'James M.',  score: 9, days: 34, badge: 'bg-red-500/15 text-red-400',    av: 'bg-red-500/10 text-red-400'    },
              { name: 'Sarah K.',  score: 8, days: 21, badge: 'bg-orange-500/15 text-orange-400', av: 'bg-orange-500/10 text-orange-400' },
              { name: 'David L.',  score: 7, days: 18, badge: 'bg-orange-500/15 text-orange-400', av: 'bg-orange-500/10 text-orange-400' },
              { name: 'Priya N.',  score: 6, days: 15, badge: 'bg-amber-500/15 text-amber-400',  av: 'bg-amber-500/10 text-amber-400'  },
              { name: 'Tom B.',    score: 5, days: 12, badge: 'bg-amber-500/15 text-amber-400',  av: 'bg-amber-500/10 text-amber-400'  },
            ].map(r => (
              <div key={r.name}
                className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${r.av}`}>{r.name[0]}</div>
                  <div>
                    <div className="text-xs font-medium">{r.name}</div>
                    <div className="text-[10px] text-white/50">{r.days}d inactive</div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.badge}`}>{r.score}/10</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 2 — Morning briefing (reversed) */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mockup left */}
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#080808] shadow-2xl shadow-black/50 order-2 md:order-1">
            <div className="bg-[#101010] px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">S</div>
              <div>
                <div className="text-xs font-semibold">SubPilot Daily Briefing</div>
                <div className="text-[10px] text-[#e8eaed]">hello@subpilot.io → you@email.com</div>
              </div>
              <div className="ml-auto text-[10px] text-white/50">7:02 AM</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest">Good morning — here's your briefing</div>
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <div className="text-xs font-semibold text-red-400 mb-2">⚡ 3 subscribers need attention today</div>
                {[
                  { name: 'James M.',  note: '34 days inactive, $49/mo — score 9/10. Personal check-in recommended.' },
                  { name: 'Sarah K.',  note: 'Zero posts opened this month, $29/mo — score 8/10. Offer a pause.' },
                  { name: 'David L.',  note: 'Payment failed once, 18d inactive — score 7/10. Share what\'s new.' },
                ].map(a => (
                  <div key={a.name} className="mt-2.5 first:mt-0">
                    <div className="text-[11px] font-semibold text-white/75">{a.name}</div>
                    <div className="text-[10px] text-[#e8eaed] leading-relaxed">{a.note}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                {[['$4,820','MRR'],['347','Active'],['3.2%','Churn']].map(([v,l]) => (
                  <div key={l}>
                    <div className="text-xs font-bold">{v}</div>
                    <div className="text-[9px] text-[#e8eaed]">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Text right */}
          <div className="order-1 md:order-2">
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Morning briefing</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">Your daily action list, in your inbox at 7 AM</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              No more checking dashboards. Every morning you get an email with the 3 subscribers to reach out to today — each with a suggested action written by AI based on their specific risk factors.
            </p>
            <ul className="space-y-3">
              {[
                'Prioritised by risk score, not just inactivity',
                'AI-suggested message for each subscriber',
                'Yesterday\'s revenue snapshot included',
                'Send it anytime from your dashboard too',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#e8eaed]">
                  <Check /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 3 — Subscriber profiles */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Subscriber profiles</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">Full history on every subscriber, one click away</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              Click any subscriber to see their complete profile — churn score, payment history, activity timeline, and a one-click AI win-back email. Everything you need before you reach out.
            </p>
            <ul className="space-y-3">
              {[
                'Activity timeline with exact dates',
                'Churn score breakdown — see exactly why they\'re at risk',
                'One-click AI win-back email, editable before sending',
                'Revenue contribution and plan history',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#e8eaed]">
                  <Check /> {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Mockup */}
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#080808] shadow-2xl shadow-black/50">
            <div className="px-4 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 flex-shrink-0">J</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold">James Morrison</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Churn risk: 9/10</span>
                </div>
                <div className="text-[11px] text-[#e8eaed]">james@example.com · $49/mo · Active since Jan 2024</div>
              </div>
            </div>
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-2.5">Risk factors</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Activity',      score: 9, note: '34 days since last interaction' },
                  { label: 'Engagement',    score: 8, note: 'No posts opened in 6 weeks' },
                  { label: 'Payment',       score: 3, note: 'All payments successful' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="text-[10px] text-white/40 w-20 flex-shrink-0">{f.label}</div>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.score >= 7 ? 'bg-red-400' : f.score >= 4 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${f.score * 10}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-white/50 w-28 flex-shrink-0 text-right">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="text-[10px] text-[#e8eaed]">Joined Jan · missed 2 posts · 34d inactive</div>
              <button className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                ✨ Win-back email
              </button>
            </div>
          </div>
        </div>

        {/* Feature 4 — Tax pot (reversed) */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mockup left */}
          <div className="rounded-2xl border border-white/[0.10] overflow-hidden bg-[#080808] shadow-2xl shadow-black/50 order-2 md:order-1">
            <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl flex-shrink-0">💰</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Set aside <span className="text-[#e8eaed]">$1,446</span> for taxes</div>
                <div className="text-[11px] text-[#e8eaed] mt-0.5">30% of $4,820 MRR · tap to see breakdown</div>
              </div>
              <span className="text-white/50 text-xs">▼</span>
            </div>
            <div className="px-5 py-4 bg-white/[0.02] space-y-3">
              <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest">Breakdown</div>
              {[
                { label: 'Total MRR',            value: '$4,820', note: 'All active subscriber revenue', bold: false },
                { label: '× 30% tax rate',        value: '',       note: 'Standard self-employed set-aside', bold: false },
                { label: 'Recommended set-aside', value: '$1,446', note: 'Transfer to a separate account', bold: true  },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <div>
                    <div className={`text-xs ${row.bold ? 'font-semibold text-[#e8eaed]' : 'text-white/45'}`}>{row.label}</div>
                    <div className="text-[10px] text-white/50">{row.note}</div>
                  </div>
                  {row.value && <div className={`text-sm font-bold flex-shrink-0 ${row.bold ? 'text-white/65' : 'text-white/45'}`}>{row.value}</div>}
                </div>
              ))}
              <div className="text-[10px] text-white/45 pt-2 border-t border-white/[0.04]">
                Guide only — consult a tax professional.
              </div>
            </div>
          </div>
          {/* Text right */}
          <div className="order-1 md:order-2">
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Tax pot calculator</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">Always know what to set aside for tax</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              Creator income is unpredictable. SubPilot calculates 30% of your monthly revenue and shows exactly how much to transfer to your tax account — no spreadsheets needed.
            </p>
            <ul className="space-y-3">
              {[
                'Updates automatically every time your MRR changes',
                'Clear breakdown of the calculation',
                'One less thing to stress about at tax time',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#e8eaed]">
                  <Check /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── RESULTS ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Real results</div>
            <h2 className="text-3xl md:text-4xl font-bold">What creators recover with SubPilot</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                stat: '$2,400',
                label: 'Average monthly revenue at risk',
                desc: 'Across creators with 300+ subscribers, that\'s how much is silently at risk each month.',
                icon: '⚠️',
                color: 'border-red-500/20 bg-red-500/[0.025]',
                statColor: 'text-red-400',
              },
              {
                stat: '34%',
                label: 'Churn reduction in 30 days',
                desc: 'Creators using SubPilot\'s daily briefing see measurable churn reduction within the first month.',
                icon: '📉',
                color: 'border-emerald-500/20 bg-emerald-500/[0.025]',
                statColor: 'text-emerald-400',
              },
              {
                stat: '2.4×',
                label: 'Average ROI vs. subscription cost',
                desc: 'Keeping just 2 subscribers per month pays for the entire SubPilot plan.',
                icon: '💸',
                color: 'border-blue-500/20 bg-blue-500/[0.025]',
                statColor: 'text-blue-400',
              },
            ].map(r => (
              <div key={r.label}
                className={`border rounded-2xl p-6 ${r.color} hover:brightness-110 transition-all`}>
                <div className="text-2xl mb-3">{r.icon}</div>
                <div className={`text-4xl font-bold mb-1 ${r.statColor}`}>{r.stat}</div>
                <div className="text-sm font-semibold mb-3 text-white/80">{r.label}</div>
                <p className="text-xs text-white/40 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIENCE ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="text-xs text-[#e8eaed] font-medium uppercase tracking-widest mb-3">Who it's for</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for subscription creators</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Whether you have 50 subscribers or 50,000, subscriber churn costs you money every single month.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🎨', title: 'Patreon Creators', desc: 'Artists, podcasters, writers, and video creators monetising their audience.' },
            { icon: '📧', title: 'Newsletter Writers', desc: 'Paid newsletter operators on Substack, Beehiiv, or Ghost.' },
            { icon: '🛒', title: 'Digital Sellers', desc: 'Gumroad and Lemon Squeezy creators with recurring memberships.' },
            { icon: '💻', title: 'SaaS Founders', desc: 'Early-stage founders who want to track subscriber health alongside product metrics.' },
          ].map(a => (
            <div key={a.title}
              className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] hover:bg-white/[0.035] transition-all">
              <div className="text-2xl mb-3">{a.icon}</div>
              <div className="text-sm font-semibold mb-2">{a.title}</div>
              <p className="text-xs text-white/40 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="border-t border-white/[0.06] bg-white/[0.01] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">How it works</div>
            <h2 className="text-3xl md:text-4xl font-bold">Up and running in 4 minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Connect your platform',      desc: 'Link Patreon, Gumroad, or Stripe. Read-only access — we never touch your money or post on your behalf.' },
              { n: '02', title: 'AI scores every subscriber', desc: 'Every subscriber gets a daily churn risk score 1–10, with a plain-English reason you can act on.' },
              { n: '03', title: 'Act before they cancel',     desc: 'Get a morning email with the top 3 subscribers to contact — and an AI-drafted message for each one.' },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-5 left-full w-8 border-t border-dashed border-white/[0.10] -translate-x-4" />
                )}
                <div className="flex gap-4">
                  <div className="text-4xl font-bold text-white/[0.08] leading-none pt-1 flex-shrink-0 tabular-nums">{s.n}</div>
                  <div>
                    <div className="font-semibold text-sm mb-2">{s.title}</div>
                    <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">What creators say</div>
            <h2 className="text-3xl md:text-4xl font-bold">Real results from real creators</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "I had 11 subscribers about to cancel and had no idea. Reached out to 3 of them and kept all 3. That's $440/mo I would have just lost.",
                name: 'Alex Rivera',  role: 'Patreon creator · 1,200 subscribers', av: 'A',
              },
              {
                quote: "The daily briefing is the first thing I read every morning. It tells me exactly what to do — not just data, but actions. Saved 18% of at-risk subscribers last month.",
                name: 'Sarah Kim',    role: 'Newsletter writer · $12k MRR', av: 'S',
              },
              {
                quote: "Set up in 4 minutes with Stripe. Three subscribers were already at 9/10 risk. Kept two of them. Paid for a year of SubPilot in one week.",
                name: 'Marcus Webb',  role: 'Gumroad seller · 840 paid subscribers', av: 'M',
              },
            ].map(r => (
              <div key={r.name}
                className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-5 hover:border-white/[0.12] transition-colors">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-emerald-400 text-sm">★</span>)}
                </div>
                <p className="text-sm text-[#e8eaed] leading-relaxed flex-1">"{r.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold flex-shrink-0">{r.av}</div>
                  <div>
                    <div className="text-xs font-semibold">{r.name}</div>
                    <div className="text-[10px] text-[#e8eaed]">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-white/[0.06] bg-white/[0.01] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Pay for itself on day one</h2>
            <p className="text-[#e8eaed] text-sm">Keep 2 extra subscribers and it's already paid for.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {[
              {
                name: 'Creator', price: '$29', per: '/mo',
                desc: 'For creators just getting started.',
                limit: 'Up to 500 subscribers',
                features: ['Patreon + Gumroad + Stripe', 'Daily churn risk scores', 'Morning email briefing', 'At-risk subscriber list', 'Tax pot calculator'],
                featured: false,
              },
              {
                name: 'Pro', price: '$79', per: '/mo',
                desc: 'For creators who need to act fast.',
                limit: 'Up to 2,000 subscribers',
                features: ['Everything in Creator', 'AI win-back email drafts', 'Revenue opportunity alerts', 'Failed payment recovery', 'Priority support'],
                featured: true,
              },
              {
                name: 'Studio', price: '$149', per: '/mo',
                desc: 'For serious creator businesses.',
                limit: 'Unlimited subscribers',
                features: ['Everything in Pro', 'Automated email sending', 'Team access', 'Slack + webhook alerts', 'Dedicated onboarding'],
                featured: false,
              },
            ].map(p => (
              <div key={p.name}
                className={`relative rounded-2xl p-6 border transition-all ${
                  p.featured
                    ? 'bg-emerald-500/[0.05] border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.08)]'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.14]'
                }`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-[#0a0a0a] border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div className="text-xs text-[#e8eaed] uppercase tracking-widest mb-1">{p.name}</div>
                <div className="text-4xl font-bold mb-0.5">
                  {p.price}<span className="text-sm text-[#e8eaed] font-normal">{p.per}</span>
                </div>
                <div className="text-xs text-emerald-400 mb-1">{p.limit}</div>
                <div className="text-xs text-[#e8eaed] mb-5">{p.desc}</div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[#e8eaed]">
                      <Check /> {f}
                    </li>
                  ))}
                </ul>
                <a href="/auth/signup"
                  className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                    p.featured
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white'
                  }`}>
                  Start free trial
                </a>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-xs text-white/50">Annual billing saves 20% · Cancel anytime · No contracts</p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="text-xs text-[#e8eaed] font-medium uppercase tracking-widest mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-bold">Common questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Free 14-day trial · No credit card required
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Stop losing subscribers<br />without knowing why
          </h2>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            Join creators who protect their income with SubPilot. Set up in 4 minutes, see your first at-risk subscribers immediately.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto mb-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-3 text-sm placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button type="submit"
                className="bg-white hover:bg-white/90 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-black/30 whitespace-nowrap">
                Get started free →
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-3 rounded-xl max-w-sm mx-auto text-sm font-medium mb-4">
              ✓ You're on the list — talk soon.
            </div>
          )}
          <p className="text-xs text-white/50">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-white/[0.06]">
            <div>
              <a href="/" className="text-base font-bold hover:opacity-80 transition-opacity">
                Sub<span className="text-emerald-400">Pilot</span>
              </a>
              <p className="text-xs text-white/50 mt-1">Protect your creator income.</p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-x-8 gap-y-2 text-xs text-[#e8eaed]">
              <a href="#features"  className="hover:text-white transition-colors">Features</a>
              <a href="#pricing"   className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq"       className="hover:text-white transition-colors">FAQ</a>
              <a href="/auth/login" className="hover:text-white transition-colors">Log in</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <span>© 2026 SubPilot. All rights reserved.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}
