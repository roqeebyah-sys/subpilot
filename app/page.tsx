'use client'
import { useState } from 'react'

export default function Home() {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5 border-b border-white/[0.07] sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-50">
        <a href="/" className="text-lg font-bold hover:opacity-80 transition-opacity">
          Sub<span className="text-emerald-400">Pilot</span>
        </a>
        <div className="flex items-center gap-5 text-sm text-white/50">
          <a href="#how"     className="hidden md:block hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hidden md:block hover:text-white transition-colors">Pricing</a>
          <a href="/auth/login"   className="hover:text-white transition-colors">Log in</a>
          <a href="/auth/signup"  className="bg-white hover:bg-white/90 text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-xs">
            Start free →
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10 md:px-8 md:pt-20 md:pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          For Patreon creators, Gumroad sellers &amp; newsletter writers
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5">
          Know who's about to cancel
          <br />
          <span className="text-emerald-400">before they do</span>
        </h1>

        <p className="text-lg text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
          SubPilot scores every subscriber for churn risk daily and tells you exactly who to reach out to — before your income drops.
        </p>

        {!submitted ? (
          <div className="flex flex-col items-center gap-3">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm w-full mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button type="submit" className="bg-white hover:bg-white/90 text-black font-semibold px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap">
                Get early access
              </button>
            </form>
            <p className="text-xs text-white/25">Free 14-day trial · No credit card</p>
          </div>
        ) : (
          <div className="bg-white/[0.06] border border-white/[0.12] text-white px-5 py-3 rounded-lg max-w-sm mx-auto text-sm">
            ✓ You're in — we'll be in touch within 24 hours.
          </div>
        )}
      </section>

      {/* ── DASHBOARD MOCKUP ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-12 md:px-8 md:pb-20">
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/70">
          {/* Browser chrome */}
          <div className="bg-[#111] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
            </div>
            <div className="flex-1 bg-white/[0.04] rounded px-3 py-1 text-[11px] text-white/20 max-w-xs mx-auto text-center">
              app.subpilot.io/dashboard
            </div>
          </div>
          {/* App UI */}
          <div className="bg-[#080808] flex" style={{ minHeight: 440 }}>
            {/* Sidebar */}
            <div className="w-44 border-r border-white/[0.05] p-3 flex-shrink-0 hidden md:block">
              <div className="px-2 py-3 text-sm font-bold mb-4">
                Sub<span className="text-emerald-400">Pilot</span>
              </div>
              {['▦  Overview', '✦  Tools', '◈  Billing'].map((item, i) => (
                <div key={item} className={`px-3 py-2 rounded-lg text-xs mb-0.5 ${i === 0 ? 'bg-white/[0.07] text-white' : 'text-white/25'}`}>
                  {item}
                </div>
              ))}
            </div>
            {/* Content */}
            <div className="flex-1 p-5">
              {/* Metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'MRR',         value: '$4,820', delta: '↑ 12%', pos: true  },
                  { label: 'Subscribers', value: '347',    delta: '↑ 8',   pos: true  },
                  { label: 'At risk',     value: '23',     delta: '↑ 5',   pos: false },
                  { label: 'Churn rate',  value: '3.2%',   delta: '↓ 0.4', pos: true  },
                ].map(m => (
                  <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <div className="text-[10px] text-white/30 mb-1">{m.label}</div>
                    <div className="text-base font-bold mb-1">{m.value}</div>
                    <div className={`text-[10px] font-semibold ${m.pos ? 'text-emerald-400' : 'text-red-400'}`}>{m.delta}</div>
                  </div>
                ))}
              </div>
              {/* Tax pot */}
              <div className="bg-white/[0.03] border border-white/[0.10] rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                <span className="text-base">💰</span>
                <div>
                  <span className="text-xs font-semibold">Set aside </span>
                  <span className="text-xs font-bold text-white/60">$1,446</span>
                  <span className="text-xs font-semibold"> this month for taxes</span>
                  <span className="text-[10px] text-white/30 ml-2">30% of $4,820 MRR</span>
                </div>
              </div>
              {/* Grid: at-risk + chart */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/[0.05] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[11px] font-semibold">Action centre</span>
                    <span className="ml-auto text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">23 at risk</span>
                  </div>
                  {[
                    { name: 'James M.',  score: 9, days: 34 },
                    { name: 'Sarah K.',  score: 8, days: 21 },
                    { name: 'David L.',  score: 7, days: 18 },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-[9px] font-bold text-white/60">{r.name[0]}</div>
                        <div>
                          <div className="text-[11px] font-medium">{r.name}</div>
                          <div className="text-[9px] text-white/25">{r.days}d inactive</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.score >= 9 ? 'bg-red-500/20 text-red-400' : r.score >= 7 ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.score}/10</span>
                    </div>
                  ))}
                </div>
                {/* Chart bars */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                  <div className="text-[11px] font-semibold mb-3">MRR growth ↑ 12%</div>
                  <div className="flex items-end gap-1 h-20">
                    {[38, 44, 51, 48, 60, 57, 72].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{
                        height: `${h}%`,
                        background: i === 6 ? '#10b981' : 'rgba(16,185,129,0.20)',
                      }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Oct','Nov','Dec','Jan','Feb','Mar','Apr'].map(m => (
                      <span key={m} className="text-[8px] text-white/20 flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-white/20 mt-3">Your daily command centre — every at-risk subscriber, one click away</p>
      </section>

      {/* ── SOCIAL PROOF NUMBERS ─────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.07] py-8 bg-white/[0.015]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 grid grid-cols-3 gap-3 md:gap-6 text-center">
          {[
            { val: '23%',     label: 'Average income lost to silent churn per year' },
            { val: '18 days', label: 'Average warning before a subscriber cancels' },
            { val: '34%',     label: 'Churn reduction in the first 30 days' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-emerald-400 mb-1">{s.val}</div>
              <div className="text-xs text-white/40 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-20 space-y-16 md:space-y-24">

        <div className="text-center mb-4">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-2">Inside SubPilot</div>
          <h2 className="text-3xl font-bold">Every feature you actually need</h2>
        </div>

        {/* Feature 1 — Churn scores */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Churn risk scoring</div>
            <h3 className="text-2xl font-bold mb-4 leading-snug">Every subscriber scored 1–10, every morning</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Our AI checks activity, payment history, engagement drops and more. Each subscriber gets a score — so instead of guessing who might cancel, you know exactly who to call.
            </p>
            <ul className="space-y-2.5">
              {[
                { badge: '9–10', color: 'bg-red-500/20 text-red-400', label: 'Immediate risk — reach out today' },
                { badge: '7–8',  color: 'bg-orange-500/20 text-orange-400', label: 'High risk — worth a personal message' },
                { badge: '4–6',  color: 'bg-amber-500/20 text-amber-400', label: 'Moderate — keep an eye on them' },
                { badge: '1–3',  color: 'bg-emerald-500/20 text-emerald-400', label: 'Healthy — no action needed' },
              ].map(t => (
                <li key={t.badge} className="flex items-center gap-3 text-sm text-white/60">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${t.color} border-transparent flex-shrink-0`}>{t.badge}</span>
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
          {/* Mockup: subscriber list */}
          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#080808]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold">At-risk subscribers</span>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">8 at risk</span>
            </div>
            {[
              { name: 'James M.',  email: 'james@…',   score: 9, days: 34, color: 'bg-red-500/10 text-red-400',    badge: 'bg-red-500/20 text-red-400' },
              { name: 'Sarah K.',  email: 'sarah@…',   score: 8, days: 21, color: 'bg-orange-500/10 text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
              { name: 'David L.',  email: 'david@…',   score: 7, days: 18, color: 'bg-orange-500/10 text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
              { name: 'Priya N.',  email: 'priya@…',   score: 6, days: 15, color: 'bg-amber-500/10 text-amber-400',  badge: 'bg-amber-500/20 text-amber-400' },
              { name: 'Tom B.',    email: 'tom@…',     score: 5, days: 12, color: 'bg-amber-500/10 text-amber-400',  badge: 'bg-amber-500/20 text-amber-400' },
            ].map(r => (
              <div key={r.name} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${r.color}`}>{r.name[0]}</div>
                  <div>
                    <div className="text-xs font-medium">{r.name}</div>
                    <div className="text-[10px] text-white/25">{r.days}d inactive · {r.email}</div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.badge}`}>{r.score}/10</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 2 — Morning briefing */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Mockup: email card */}
          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#080808] order-2 md:order-1">
            <div className="bg-[#111] px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">S</div>
                <div>
                  <div className="text-xs font-semibold">SubPilot Daily Briefing</div>
                  <div className="text-[10px] text-white/30">hello@subpilot.io → you@email.com</div>
                </div>
                <div className="ml-auto text-[10px] text-white/25">7:02 AM</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-xs text-white/40 uppercase tracking-widest">Good morning — here's your briefing</div>
              <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
                <div className="text-xs font-semibold text-red-400 mb-1">⚡ 3 subscribers need attention today</div>
                {[
                  { name: 'James M.',  note: '34 days inactive, $49/mo — score 9/10. Consider a personal check-in email.' },
                  { name: 'Sarah K.',  note: 'Opened 0 posts this month, $29/mo — score 8/10. Offer a pause option.' },
                  { name: 'David L.',  note: 'Payment failed once, 18d inactive — score 7/10. Share what\'s new this month.' },
                ].map(a => (
                  <div key={a.name} className="mt-2">
                    <div className="text-[11px] font-semibold text-white/80">{a.name}</div>
                    <div className="text-[10px] text-white/40 leading-relaxed">{a.note}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <div className="text-xs font-semibold mb-1">📊 Yesterday's snapshot</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['$4,820','MRR'],['347','Active'],['3.2%','Churn']].map(([v,l]) => (
                    <div key={l}>
                      <div className="text-xs font-bold text-white">{v}</div>
                      <div className="text-[9px] text-white/30">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Morning briefing</div>
            <h3 className="text-2xl font-bold mb-4 leading-snug">Your daily action list, in your inbox at 7am</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              No more checking dashboards. Every morning you get an email with the 3 subscribers to reach out to today — each with a suggested action written by AI based on their specific risk factors.
            </p>
            <ul className="space-y-2.5">
              {[
                'Prioritised by risk score, not just inactivity',
                'AI-suggested message for each subscriber',
                'Yesterday\'s revenue snapshot',
                'Send it anytime from your dashboard',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 3 — Subscriber profile */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Subscriber profiles</div>
            <h3 className="text-2xl font-bold mb-4 leading-snug">Full history on every subscriber, one click away</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Click any subscriber to see their complete profile — churn score, payment history, activity timeline, and a one-click win-back email. Everything you need before you reach out.
            </p>
            <ul className="space-y-2.5">
              {[
                'Activity timeline with exact dates',
                'Churn score breakdown — see exactly why they\'re at risk',
                'One-click AI win-back email draft',
                'Revenue contribution and plan history',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Mockup: subscriber profile */}
          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#080808]">
            {/* Header */}
            <div className="px-4 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 flex-shrink-0">J</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold">James Morrison</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Churn risk: 9/10</span>
                </div>
                <div className="text-[11px] text-white/35">james@example.com · $49/mo · Active since Jan 2024</div>
              </div>
            </div>
            {/* Score breakdown */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="text-[10px] text-white/35 uppercase tracking-widest mb-2">Risk factors</div>
              <div className="space-y-2">
                {[
                  { label: 'Activity',         score: 9, note: '34 days since last interaction' },
                  { label: 'Engagement',        score: 8, note: 'No posts opened in 6 weeks' },
                  { label: 'Payment health',    score: 4, note: 'All payments successful' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="text-[11px] text-white/50 w-24 flex-shrink-0">{f.label}</div>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${f.score >= 7 ? 'bg-red-400' : f.score >= 4 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${f.score * 10}%` }} />
                    </div>
                    <div className="text-[10px] text-white/25 w-20 flex-shrink-0 text-right">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Action */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="text-[11px] text-white/40">Timeline: joined Jan · missed 2 posts · 34d inactive</div>
              <button className="text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg">
                ✉ Send win-back
              </button>
            </div>
          </div>
        </div>

        {/* Feature 4 — Tax pot */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Mockup: tax pot card */}
          <div className="rounded-xl border border-white/[0.10] overflow-hidden bg-[#080808] order-2 md:order-1">
            <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-lg flex-shrink-0">💰</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Set aside <span className="text-white/60">$1,446</span> this month for taxes</div>
                <div className="text-[11px] text-white/35 mt-0.5">30% of $4,820 MRR · tap to see breakdown</div>
              </div>
              <span className="text-white/30 text-xs">▼</span>
            </div>
            <div className="px-5 py-4 bg-white/[0.02] space-y-3">
              <div className="text-[10px] text-white/35 uppercase tracking-widest">Breakdown</div>
              {[
                { label: 'Total MRR',             value: '$4,820', note: 'All active subscriber revenue' },
                { label: '× 30% tax rate',         value: '',       note: 'Standard self-employed set-aside' },
                { label: 'Recommended set-aside',  value: '$1,446', note: 'Transfer to a separate account', bold: true },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <div>
                    <div className={`text-xs ${row.bold ? 'font-semibold text-white/60' : 'text-white/50'}`}>{row.label}</div>
                    <div className="text-[10px] text-white/25">{row.note}</div>
                  </div>
                  {row.value && <div className={`text-sm font-bold flex-shrink-0 ${row.bold ? 'text-white/70' : 'text-white/50'}`}>{row.value}</div>}
                </div>
              ))}
              <div className="text-[10px] text-white/20 pt-2 border-t border-white/[0.04]">
                Guide only — consult a tax professional for your jurisdiction.
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Tax pot calculator</div>
            <h3 className="text-2xl font-bold mb-4 leading-snug">Always know exactly what to set aside for tax</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Creator income is unpredictable. SubPilot calculates 30% of your monthly revenue and shows you exactly how much to transfer to your tax account — no spreadsheets needed.
            </p>
            <ul className="space-y-2.5">
              {[
                'Updates automatically every time your MRR changes',
                'Clear breakdown of the calculation',
                'One less thing to stress about at tax time',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" className="max-w-4xl mx-auto px-4 py-12 md:px-8 md:py-20">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-2">How it works</div>
          <h2 className="text-3xl font-bold">Up and running in 4 minutes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Connect your platform',    desc: 'Link Patreon, Gumroad, or Stripe. Read-only — we never touch your money.' },
            { n: '02', title: 'AI scores every subscriber', desc: 'Every subscriber gets a daily churn risk score 1–10, with reasons.' },
            { n: '03', title: 'Act before they cancel',   desc: 'Get a morning email with the 3 subscribers to contact today — and what to say.' },
          ].map(s => (
            <div key={s.n} className="flex gap-4">
              <div className="text-3xl font-bold text-white/[0.10] leading-none pt-1 flex-shrink-0">{s.n}</div>
              <div>
                <div className="font-semibold text-sm mb-1.5">{s.title}</div>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.07] bg-white/[0.015] py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-2">What creators say</div>
            <h2 className="text-3xl font-bold">Real results from real creators</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote:  "I had 11 subscribers about to cancel and had no idea. Reached out to 3 of them and kept all 3. That's $440/mo I would have just lost.",
                name:   'Alex Rivera',
                role:   'Patreon creator · 1,200 subscribers',
                avatar: 'A',
                color:  'bg-white/[0.08] text-white/70',
              },
              {
                quote:  "The daily briefing email is the first thing I read every morning. It tells me exactly what to do — not just data, but actions. Saved 18% of my at-risk subscribers last month.",
                name:   'Sarah Kim',
                role:   'Newsletter writer · $12k MRR',
                avatar: 'S',
                color:  'bg-white/[0.08] text-white/70',
              },
              {
                quote:  "Set up in 4 minutes with my Stripe account. Three subscribers I'd never have noticed were already at 9/10 risk. Kept two of them. Paid for a year of SubPilot in one week.",
                name:   'Marcus Webb',
                role:   'Gumroad seller · 840 paid subscribers',
                avatar: 'M',
                color:  'bg-white/[0.08] text-white/70',
              },
            ].map(r => (
              <div key={r.name} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-emerald-400 text-sm">★</span>)}
                </div>
                <p className="text-sm text-white/65 leading-relaxed flex-1">"{r.quote}"</p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.05]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${r.color}`}>{r.avatar}</div>
                  <div>
                    <div className="text-xs font-semibold">{r.name}</div>
                    <div className="text-[10px] text-white/30">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-20">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-2">Pricing</div>
          <h2 className="text-3xl font-bold">Pay for itself on day one</h2>
          <p className="text-white/40 mt-2 text-sm">Keep 2 extra subscribers and it's already paid for.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
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
            <div key={p.name} className={`rounded-xl p-4 md:p-6 border relative ${p.featured ? 'bg-emerald-500/[0.04] border-emerald-500/30' : 'bg-white/[0.02] border-white/[0.08]'}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{p.name}</div>
              <div className="text-4xl font-bold mb-0.5">{p.price}<span className="text-sm text-white/30 font-normal">{p.per}</span></div>
              <div className="text-xs text-emerald-400 mb-4">{p.limit}</div>
              <ul className="space-y-2 mb-5">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                    <span className="text-emerald-400 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/auth/signup"
                className={`block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${
                  p.featured ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white'
                }`}
              >
                Start free trial
              </a>
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-xs text-white/25">Annual billing at 20% off · Cancel anytime · No contracts</p>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 text-center">
        <div className="max-w-xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-black mb-3">Stop losing subscribers without knowing why</h2>
          <p className="text-black/60 mb-7 text-sm">Free 14-day trial. No credit card required.</p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-black/20 border border-black/20 rounded-lg px-4 py-2.5 text-sm text-black placeholder:text-black/35 focus:outline-none"
              />
              <button type="submit" className="bg-black text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-black/80 transition-colors whitespace-nowrap">
                Get started →
              </button>
            </form>
          ) : (
            <div className="bg-black/15 text-black px-5 py-3 rounded-lg max-w-sm mx-auto text-sm font-medium">✓ You're on the list — talk soon.</div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] px-4 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-0 justify-between text-xs text-white/25">
        <div className="flex items-center gap-4">
          <a href="/" className="text-white/50 font-bold hover:text-white transition-colors">
            Sub<span className="text-emerald-400">Pilot</span>
          </a>
          <span>© 2026 · Protect your creator income.</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

    </main>
  )
}
