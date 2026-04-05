'use client'
import { useState } from 'react'
import MarketingHeader from '@/app/components/marketing-header'
import MarketingFooter from '@/app/components/marketing-footer'

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
        <p className="px-5 pb-5 text-base text-white/45 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

/* full dashboard preview */
function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] bg-[#080c14]">
      {/* Browser chrome */}
      <div className="bg-[#0d1117] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
        </div>
        <div className="flex-1 bg-white/[0.04] rounded-md px-3 py-1 text-[10px] text-white/45 max-w-[200px] mx-auto text-center">
          app.userretain.io/dashboard
        </div>
      </div>
      {/* App shell */}
      <div className="flex" style={{ minHeight: 520 }}>
        {/* Sidebar */}
        <div className="w-44 border-r border-white/[0.05] p-3 flex-shrink-0 hidden lg:flex flex-col">
          <div className="px-2 py-3 text-sm font-bold mb-5">
            User<span className="text-emerald-400">Retain</span>
          </div>
          {[
            { icon: '▦', label: 'Overview',    active: true  },
            { icon: '◧', label: 'Subscribers', active: false },
            { icon: '✦', label: 'AI Tools',    active: false },
            { icon: '◈', label: 'Billing',     active: false },
          ].map(item => (
            <div key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-0.5 ${
                item.active ? 'bg-white/[0.07] text-white' : 'text-white/40'}`}>
              <span className="text-[10px]">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden min-w-0">

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'MRR',             value: '$4,820', sub: '+$340 this month', color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
              { label: 'Revenue at risk', value: '$1,260', sub: '4 subscribers',    color: 'text-red-400',     bg: 'bg-red-500/5 border-red-500/15' },
              { label: 'Churn rate',      value: '3.2%',   sub: '-0.4% vs last mo', color: 'text-amber-400',   bg: 'bg-amber-500/5 border-amber-500/15' },
              { label: 'Active',          value: '347',    sub: '12 new this month', color: 'text-blue-400',    bg: 'bg-blue-500/5 border-blue-500/15' },
            ].map(k => (
              <div key={k.label} className={`border rounded-xl p-3 ${k.bg}`}>
                <div className="text-[10px] text-white/40 mb-1">{k.label}</div>
                <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* 70/30 main grid */}
          <div className="grid lg:grid-cols-[1fr_260px] gap-3 mb-3">

            {/* High risk panel */}
            <div className="border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold">High Risk Subscribers</span>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">4 at risk</span>
              </div>
              {[
                { name: 'James M.',  plan: 'Pro $49/mo',    score: 9, days: 34, risk: 'Critical', rc: 'text-red-400 bg-red-500/10 border-red-500/20' },
                { name: 'Sarah K.',  plan: 'Growth $29/mo', score: 8, days: 21, risk: 'High',     rc: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                { name: 'David L.',  plan: 'Pro $49/mo',    score: 7, days: 18, risk: 'High',     rc: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                { name: 'Priya N.',  plan: 'Starter $9/mo', score: 6, days: 15, risk: 'Medium',   rc: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              ].map(r => (
                <div key={r.name} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${r.rc}`}>{r.name[0]}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{r.name}</div>
                      <div className="text-[10px] text-white/40">{r.plan} · {r.days}d inactive</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.rc}`}>{r.score}/10</span>
                    <button className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-medium">
                      ✦ Send
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI insights panel */}
            <div className="border border-white/[0.07] rounded-xl overflow-hidden hidden lg:block">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500/20 rounded flex items-center justify-center text-[9px]">✦</div>
                <span className="text-xs font-semibold">AI Insights</span>
              </div>
              <div className="p-3 space-y-3">
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
                  <div className="text-[9px] text-emerald-400 uppercase tracking-widest mb-1.5">Today's briefing</div>
                  <p className="text-[10px] text-white/60 leading-relaxed">4 subscribers show elevated churn risk. Immediate action on James M. could protect $49/mo. He never completed onboarding.</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-3 flex gap-2">
                  <span className="text-[9px] mt-0.5 flex-shrink-0 text-amber-400">!</span>
                  <div>
                    <div className="text-[9px] text-amber-400 mb-0.5 font-medium">Top priority</div>
                    <div className="text-[10px] text-white/55 leading-relaxed">Reach out to James M. today. 34 days inactive, never used core feature.</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[9px] text-white/35 uppercase tracking-widest">Revenue opportunities</div>
                  {['Offer onboarding call to 2 users stuck at setup', 'Pro upgrade candidate: Sarah K. hitting plan limits'].map(o => (
                    <div key={o} className="flex gap-1.5 items-start">
                      <span className="text-emerald-400 text-[9px] mt-0.5">↑</span>
                      <span className="text-[10px] text-white/50 leading-relaxed">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MRR chart (simplified bar chart) */}
          <div className="border border-white/[0.07] rounded-xl p-3">
            <div className="text-[10px] text-white/40 mb-3 uppercase tracking-widest">MRR, last 6 months</div>
            <div className="flex items-end gap-2 h-16">
              {[
                { month: 'Oct', h: 52 }, { month: 'Nov', h: 58 }, { month: 'Dec', h: 61 },
                { month: 'Jan', h: 70 }, { month: 'Feb', h: 80 }, { month: 'Mar', h: 100 },
              ].map(b => (
                <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-emerald-500/20 rounded-t hover:bg-emerald-500/30 transition-colors"
                    style={{ height: `${b.h}%` }}
                  />
                  <div className="text-[9px] text-white/30">{b.month}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* dashboard mockup used in hero */
function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] bg-[#080c14]">
      {/* Browser chrome */}
      <div className="bg-[#0d1117] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
        </div>
        <div className="flex-1 bg-white/[0.04] rounded-md px-3 py-1 text-[10px] text-white/45 max-w-[180px] mx-auto text-center">
          app.userretain.io/dashboard
        </div>
      </div>
      {/* App shell */}
      <div className="flex" style={{ minHeight: 380 }}>
        {/* Sidebar */}
        <div className="w-40 border-r border-white/[0.05] p-3 flex-shrink-0 hidden sm:flex flex-col">
          <div className="px-2 py-3 text-sm font-bold mb-4">
            User<span className="text-emerald-400">Retain</span>
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`
  }

  const faqs = [
    {
      q: 'How does UserRetain connect to my data?',
      a: 'UserRetain connects directly to Stripe via read-only API access, or you can import users via CSV. We never write to your Stripe account, charge your users, or store raw payment data beyond what is needed to compute risk scores.',
    },
    {
      q: 'How does the churn risk score work?',
      a: "Our AI analyses each user's activity patterns, product engagement, payment reliability, and account age daily. Every user receives a score from 1 (healthy) to 10 (immediate risk). The model improves over time as it learns the behavioural patterns unique to your product.",
    },
    {
      q: 'What is the morning briefing email?',
      a: 'Every morning at 7 AM you receive a plain-text email with the top 3 users to reach out to that day, each with an AI-written suggested message tailored to their specific risk factors. No dashboard required.',
    },
    {
      q: 'Can I try it before paying?',
      a: 'Yes, every plan starts with a free 14-day trial, no credit card required. You will see real data from your users within minutes of connecting Stripe or uploading a CSV.',
    },
    {
      q: 'What is the AI win-back email feature?',
      a: 'On the Pro and Scale plans, clicking any at-risk user opens an AI-drafted win-back email personalised with their history, plan, and inactivity period. You can edit the subject and body, choose a tone (warm, professional, casual, urgent), and send directly from UserRetain or copy it to your own email client.',
    },
    {
      q: 'Is my data safe?',
      a: 'UserRetain uses read-only API access and never stores raw user financial data beyond what is needed to compute risk scores. All connections are encrypted in transit and at rest. We do not sell or share your data with third parties.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes, no contracts, no lock-in. Cancel from your billing page at any time. If you cancel mid-month you retain access until the end of the billing period.',
    },
  ]

  return (
    <main className="min-h-screen bg-[#080c14] text-white antialiased" style={{ overflowX: 'clip' }}>

      {/* ── AMBIENT GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-60 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
      <MarketingHeader />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-80px)] flex items-center">
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-10 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <span>For SaaS founders losing MRR to silent churn</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[46px] font-bold leading-[1.1] tracking-tight mb-5">
              Catch churn before it{' '}
              <span className="text-emerald-400">shows up in your MRR</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-7 max-w-lg">
              UserRetain monitors every user for behavioural churn signals: inactivity, missed activation, payment drops. It tells you who to reach out to before they cancel.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-5">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
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
                  ✓ You're in. We'll be in touch within 24 hours.
                </div>
              )}
              <a href="/demo"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-3 rounded-lg transition-all w-full sm:w-auto max-w-sm">
                View demo →
              </a>
            </div>

            <p className="text-xs text-white/50">No credit card required · Free 14-day trial</p>

            {/* Trust logos */}
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-white/50 uppercase tracking-widest">Works with</span>
              {['Stripe', 'CSV import'].map(p => (
                <span key={p}
                  className="text-xs text-[#e8eaed] border border-white/[0.08] rounded-md px-2.5 py-1 bg-white/[0.03]">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Right: dashboard — hidden on small, shown md+ */}
          <div className="relative hidden md:block">
            <DashboardMockup />
            <p className="text-center text-[11px] text-white/45 mt-3">
              Your revenue recovery control centre. Every at-risk user, one click away.
            </p>
          </div>
        </div>
      </div>
      </section>

      {/* ── SOCIAL PROOF NUMBERS ──────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-8 md:py-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center">
          {[
            { val: '23%',     label: 'Average MRR lost annually to silent churn' },
            { val: '18 days', label: 'Average warning window before a user cancels' },
            { val: '34%',     label: 'Churn reduction in the first 30 days' },
          ].map((s, i) => (
            <div key={s.label} className={i > 0 ? 'sm:border-l sm:border-white/[0.06] sm:pl-4 md:pl-0' : ''}>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1.5">{s.val}</div>
              <div className="text-xs text-[#e8eaed] leading-relaxed max-w-[180px] mx-auto sm:max-w-none">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ────────────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">The product</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Your revenue recovery control centre</h2>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto">
            Every at-risk user, their churn score, and a personalised AI message. All in one place.
          </p>
        </div>
        <div className="relative">
          <DashboardPreview />
        </div>
        {/* Feature callouts below the preview */}
        <div className="grid sm:grid-cols-3 gap-5 mt-8">
          {[
            { icon: '⚡', label: 'Live churn scores', desc: 'Every subscriber scored 1–10 each morning based on real behavioural signals.' },
            { icon: '✦', label: 'One-click AI emails', desc: 'Hit "Send" and Claude writes a personalised win-back email for that exact user.' },
            { icon: '📈', label: 'MRR trend tracker', desc: 'Watch your MRR recover month by month as you act on the at-risk list.' },
          ].map(c => (
            <div key={c.label} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-base flex-shrink-0">{c.icon}</div>
              <div>
                <div className="text-sm font-semibold mb-1">{c.label}</div>
                <p className="text-sm text-white/45 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-16 lg:py-20 text-center">
        <div className="text-xs text-[#e8eaed] font-medium uppercase tracking-widest mb-3">The problem</div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 leading-tight">
          Churn is silent until it's too late to do anything
        </h2>
        <p className="text-white/45 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Most SaaS analytics tools show you aggregate metrics. They don't tell you which specific users are drifting away, why they stopped engaging, or what you could do right now to keep them.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: '👻',
              title: 'Silent cancellations',
              desc: 'Users disengage weeks before they cancel. You only find out when the payment stops. By then it\'s too late.',
            },
            {
              icon: '📉',
              title: 'No early warning',
              desc: 'Your analytics show historical data, not predictive signals. By the time churn shows in your MRR, it\'s already gone.',
            },
            {
              icon: '✉️',
              title: 'Generic outreach',
              desc: 'Sending the same email blast to everyone doesn\'t work. Each at-risk user needs a different message at the right moment.',
            },
          ].map(p => (
            <div key={p.title}
              className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 hover:bg-white/[0.08] transition-colors">
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="text-sm font-semibold mb-2">{p.title}</div>
              <p className="text-sm text-white/40 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-10 md:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-10 md:mb-14">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">The solution</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Detect. Predict. Recover.</h2>
            <p className="text-white/40 text-base max-w-md mx-auto">
              Three stages, one system. UserRetain works in the background so you can focus on building.
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
                desc: 'UserRetain monitors every user daily: login activity, feature usage, payment patterns, onboarding completion, and account age. No manual work required.',
                points: ['Automatic Stripe sync every 24 hours', 'Behavioural signals tracked per user', 'Flags users who never hit activation'],
              },
              {
                step: '02',
                icon: '🧠',
                title: 'Predict',
                color: 'border-orange-500/20 bg-orange-500/[0.03]',
                accent: 'text-orange-400',
                desc: 'Our AI scores every user 1–10 for churn risk each morning, with plain-English reasons tied to their specific product behaviour.',
                points: ['Scores update every morning', 'Reason breakdown per user', 'Grouped by High / Medium / Low'],
              },
              {
                step: '03',
                icon: '✉️',
                title: 'Recover',
                color: 'border-emerald-500/20 bg-emerald-500/[0.03]',
                accent: 'text-emerald-400',
                desc: 'Get the right message for the right user. Personalised win-back emails drafted by AI, ready to send in one click.',
                points: ['AI win-back emails per user', 'Tone selector (warm, casual, urgent)', 'Copy or send direct from UserRetain'],
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
                <p className="text-base text-white/45 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.points.map(pt => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-white/50">
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
      <section id="features" className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-16 lg:py-20 space-y-12 md:space-y-18 lg:space-y-24">
        <div className="text-center">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Inside UserRetain</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Every feature you actually need</h2>
        </div>

        {/* Feature 1 — Churn scores */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Churn risk scoring</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-snug">
              Every user scored 1–10, every morning
            </h3>
            <p className="text-white/45 text-base leading-relaxed mb-6">
              Our AI checks login activity, feature adoption, onboarding completion, and payment history. Each user gets a risk score so you know exactly who to reach out to before they decide to cancel.
            </p>
            <ul className="space-y-3">
              {[
                { badge: '9–10', color: 'bg-red-500/20 text-red-400 border-red-500/20',       label: 'Immediate risk. Reach out today.' },
                { badge: '7–8',  color: 'bg-orange-500/20 text-orange-400 border-orange-500/20', label: 'High risk. Worth a personal message.' },
                { badge: '4–6',  color: 'bg-amber-500/20 text-amber-400 border-amber-500/20',  label: 'Moderate. Monitor closely.' },
                { badge: '1–3',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', label: 'Healthy. No action needed.' },
              ].map(t => (
                <li key={t.badge} className="flex items-center gap-3 text-base text-[#e8eaed]">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${t.color}`}>{t.badge}</span>
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
          {/* Mockup */}
          <div className="relative">
            <div className="absolute -inset-6 bg-emerald-500/15 rounded-3xl blur-[60px] pointer-events-none" />
            <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-[#080c14] shadow-2xl shadow-black/50">
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
            </div>{/* close relative inner */}
          </div>{/* close relative wrapper */}
        </div>

        {/* Feature 2 — Morning briefing (reversed) */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Mockup left */}
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-6 bg-blue-500/15 rounded-3xl blur-[60px] pointer-events-none" />
            <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-[#080c14] shadow-2xl shadow-black/50">
            <div className="bg-[#0d1117] px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">S</div>
              <div>
                <div className="text-xs font-semibold">UserRetain Daily Briefing</div>
                <div className="text-[10px] text-[#e8eaed]">hello@userretain.io → you@email.com</div>
              </div>
              <div className="ml-auto text-[10px] text-white/50">7:02 AM</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest">Good morning. Here's your briefing.</div>
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <div className="text-xs font-semibold text-red-400 mb-2">⚡ 3 users need attention today</div>
                {[
                  { name: 'James M.',  note: '34 days inactive, $49/mo. Score 9/10. Never completed onboarding.' },
                  { name: 'Sarah K.',  note: 'Hasn\'t used core feature in 3 weeks, $29/mo. Score 8/10. Offer a check-in call.' },
                  { name: 'David L.',  note: 'Payment failed once, 18 days inactive. Score 7/10. Re-engage with a product update.' },
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
            </div>{/* close relative inner */}
          </div>{/* close relative wrapper */}
          {/* Text right */}
          <div className="order-1 md:order-2">
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Morning briefing</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-snug">Your daily action list, in your inbox at 7 AM</h3>
            <p className="text-white/45 text-base leading-relaxed mb-6">
              No more digging through dashboards. Every morning you get an email with the 3 users to reach out to today, each with a suggested action written by AI based on their specific product behaviour and risk signals.
            </p>
            <ul className="space-y-3">
              {[
                'Prioritised by churn risk score, not just inactivity',
                'AI-suggested message tailored to each user',
                'Yesterday\'s MRR snapshot included',
                'Trigger anytime from your dashboard too',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-base text-[#e8eaed]">
                  <Check /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 3 — Subscriber profiles */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">User profiles</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-snug">Full product history on every user, one click away</h3>
            <p className="text-white/45 text-base leading-relaxed mb-6">
              Click any user to see their complete profile: churn score, payment history, product activity timeline, and a one-click AI win-back email. Everything you need before you reach out.
            </p>
            <ul className="space-y-3">
              {[
                'Activity timeline with exact dates and feature usage',
                'Churn score breakdown: see exactly why they\'re at risk',
                'Onboarding completion status and activation milestone tracking',
                'One-click AI win-back email, editable before sending',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-base text-[#e8eaed]">
                  <Check /> {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Mockup */}
          <div className="relative">
            <div className="absolute -inset-6 bg-violet-500/15 rounded-3xl blur-[60px] pointer-events-none" />
            <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-[#080c14] shadow-2xl shadow-black/50">
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
                  { label: 'Engagement',    score: 8, note: 'Never used core feature' },
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
              <div className="text-[10px] text-[#e8eaed]">Joined Jan · never completed onboarding · 34d inactive</div>
              <button className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                ✨ Win-back email
              </button>
            </div>
            </div>{/* close relative inner */}
          </div>{/* close relative wrapper */}
        </div>

        {/* Feature 4 — Tax pot (reversed) */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Mockup left */}
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-[60px] pointer-events-none" />
            <div className="relative rounded-2xl border border-white/[0.10] overflow-hidden bg-[#080c14] shadow-2xl shadow-black/50">
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
                Guide only. Consult a tax professional.
              </div>
            </div>
            </div>{/* close relative inner */}
          </div>{/* close relative wrapper */}
          {/* Text right */}
          <div className="order-1 md:order-2">
            <div className="text-[10px] text-[#e8eaed] uppercase tracking-widest mb-3">Tax pot calculator</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-snug">Always know what to set aside for tax</h3>
            <p className="text-white/45 text-base leading-relaxed mb-6">
              SaaS revenue fluctuates. UserRetain calculates 30% of your monthly MRR and shows exactly how much to transfer to your tax account. No spreadsheets needed.
            </p>
            <ul className="space-y-3">
              {[
                'Updates automatically every time your MRR changes',
                'Clear breakdown of the calculation',
                'One less thing to stress about at tax time',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-base text-[#e8eaed]">
                  <Check /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── RESULTS ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-10 md:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-10 md:mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Real results</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">What SaaS founders recover with UserRetain</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                stat: '$2,400',
                label: 'Average MRR silently at risk per month',
                desc: 'Across SaaS teams with 300+ users, that\'s how much is quietly at risk each month from disengaged accounts.',
                icon: '⚠️',
                color: 'border-red-500/20 bg-red-500/[0.025]',
                statColor: 'text-red-400',
              },
              {
                stat: '34%',
                label: 'Churn reduction in 30 days',
                desc: 'SaaS teams using UserRetain\'s daily briefing see measurable churn reduction within the first month of use.',
                icon: '📉',
                color: 'border-emerald-500/20 bg-emerald-500/[0.025]',
                statColor: 'text-emerald-400',
              },
              {
                stat: '2.4×',
                label: 'Average ROI vs. subscription cost',
                desc: 'Retaining just 2 users per month pays for the entire UserRetain plan. Most teams save far more.',
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
                <p className="text-sm text-white/40 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIENCE ──────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-16 lg:py-20">
        <div className="text-center mb-10 md:mb-12">
          <div className="text-xs text-[#e8eaed] font-medium uppercase tracking-widest mb-3">Who it's for</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Built for SaaS teams</h2>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Whether you have 50 users or 5,000, silent churn is quietly compounding against your MRR every month.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🚀', title: 'Early-stage founders', desc: 'Pre-Series A teams who need to protect every paying user and can\'t afford a dedicated CS team.' },
            { icon: '📦', title: 'B2B SaaS', desc: 'Monthly subscription products where one churned account can represent thousands in lost ARR.' },
            { icon: '🛠️', title: 'Product-led growth', desc: 'Teams where users self-serve but need a signal when someone is drifting before they cancel.' },
            { icon: '💳', title: 'Stripe-billed products', desc: 'Any team billing through Stripe who wants to act on churn signals before they hit the numbers.' },
          ].map(a => (
            <div key={a.title}
              className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] hover:bg-white/[0.035] transition-all">
              <div className="text-2xl mb-3">{a.icon}</div>
              <div className="text-sm font-semibold mb-2">{a.title}</div>
              <p className="text-sm text-white/40 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-10 md:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-10 md:mb-14">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">How it works</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Up and running in 4 minutes</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8">
            {[
              { n: '01', title: 'Connect Stripe or import CSV', desc: 'Link Stripe for automatic sync or upload a CSV. Read-only access. We never write to your account or charge your users.' },
              { n: '02', title: 'AI scores every user',        desc: 'Every user gets a daily churn risk score 1–10, with a plain-English reason based on their product behaviour.' },
              { n: '03', title: 'Act before they cancel',      desc: 'Get a morning email with the top 3 users to contact, with an AI-drafted message personalised to each one.' },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-5 left-full w-8 border-t border-dashed border-white/[0.10] -translate-x-4" />
                )}
                <div className="flex gap-4">
                  <div className="text-4xl font-bold text-white/[0.08] leading-none pt-1 flex-shrink-0 tabular-nums">{s.n}</div>
                  <div>
                    <div className="font-semibold text-base mb-2">{s.title}</div>
                    <p className="text-white/40 text-base leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-10 md:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-10 md:mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">Pay for itself on day one</h2>
            <p className="text-[#e8eaed] text-sm">Retain 2 extra users a month and it's already paid for.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 items-start">
            {[
              {
                name: 'Starter', price: '$29', per: '/mo',
                desc: 'For early-stage SaaS teams getting started.',
                limit: 'Up to 500 users',
                features: ['Stripe + CSV import', 'Daily churn risk scores', 'Morning email briefing', 'At-risk user list', 'Tax pot calculator'],
                featured: false,
              },
              {
                name: 'Pro', price: '$79', per: '/mo',
                desc: 'For growing SaaS teams protecting MRR.',
                limit: 'Up to 2,000 users',
                features: ['Everything in Starter', 'AI win-back email drafts', 'Onboarding completion tracking', 'Failed payment recovery', 'Priority support'],
                featured: true,
              },
              {
                name: 'Scale', price: '$149', per: '/mo',
                desc: 'For scaling SaaS businesses.',
                limit: 'Unlimited users',
                features: ['Everything in Pro', 'Automated email sending', 'Team seats', 'Slack + webhook alerts', 'Dedicated onboarding'],
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-[#080c14] border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap">
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
      <section id="faq" className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-16 lg:py-20">
        <div className="text-center mb-10 md:mb-12">
          <div className="text-xs text-[#e8eaed] font-medium uppercase tracking-widest mb-3">FAQ</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Common questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-10 md:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Free 14-day trial · No credit card required
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Stop losing MRR<br />before it hits your dashboard
          </h2>
          <p className="text-white/40 text-base mb-8 leading-relaxed">
            Join SaaS founders who protect their MRR with UserRetain. Set up in 4 minutes, see your first at-risk users immediately.
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
              ✓ You're on the list. Talk soon.
            </div>
          )}
          <p className="text-xs text-white/50">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

      <MarketingFooter />

      </div>{/* end relative z-10 wrapper */}
    </main>
  )
}
