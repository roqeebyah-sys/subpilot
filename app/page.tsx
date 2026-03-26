'use client'
import { useState } from 'react'

export default function Home() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur z-50">
        <a href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
          Sub<span className="text-emerald-400">Pilot</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <a href="#how"       className="hidden md:block hover:text-white transition-colors">How it works</a>
          <a href="#platforms" className="hidden md:block hover:text-white transition-colors">Integrations</a>
          <a href="#pricing"   className="hidden md:block hover:text-white transition-colors">Pricing</a>
          <a href="/auth/login" className="hover:text-white transition-colors">Log in</a>
          <a href="/auth/signup" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-xs">
            Start free trial
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Built for Patreon creators, Gumroad sellers, and independent builders
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
          Know who's about to leave
          <br />
          <span className="text-emerald-400">before they're gone</span>
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-6 leading-relaxed">
          SubPilot connects to Patreon, Gumroad, and Stripe — scores every subscriber for churn risk daily — and tells you exactly who to contact before your income drops.
        </p>
        <div className="inline-block bg-white/5 border border-white/10 rounded-lg px-5 py-3 mb-10 text-sm text-white/60">
          💡 The average creator loses <span className="text-white font-semibold">23% of their income</span> to silent churn every year. SubPilot stops that.
        </div>
        {!submitted ? (
          <div id="waitlist" className="flex flex-col items-center gap-3">
            <form onSubmit={handleWaitlist} className="flex gap-3 max-w-md w-full mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap">
                See who's at risk →
              </button>
            </form>
            <p className="text-white/30 text-xs">Free 14-day trial · No credit card · Connects in 60 seconds</p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-lg max-w-md mx-auto text-sm">
            ✓ You're on the list — we'll reach out within 24 hours.
          </div>
        )}
      </section>

      {/* ── DASHBOARD SCREENSHOT MOCKUP ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60">
          {/* Browser chrome */}
          <div className="bg-[#111] border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 bg-white/[0.04] rounded-md px-3 py-1 text-xs text-white/25 max-w-xs mx-auto text-center">
              app.subpilot.io/dashboard
            </div>
          </div>
          {/* Dashboard UI mockup */}
          <div className="bg-[#080808] flex" style={{ minHeight: 480 }}>
            {/* Sidebar */}
            <div className="w-48 border-r border-white/[0.06] flex-shrink-0 p-3 hidden md:block">
              <div className="px-2 py-3 mb-4 text-sm font-semibold">
                Sub<span className="text-emerald-400">Pilot</span>
              </div>
              {['▦  Overview', '✦  Tools', '◈  Billing'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-0.5 ${i === 0 ? 'bg-white/[0.07] text-white' : 'text-white/30'}`}>
                  {item}
                </div>
              ))}
              <div className="mt-auto pt-8">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400">A</div>
                  <div className="text-[10px] text-white/30">alex@email.com</div>
                </div>
              </div>
            </div>
            {/* Main content */}
            <div className="flex-1 p-5 overflow-hidden">
              {/* Metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'MRR',         value: '$4,820',  delta: '+12%',  pos: true  },
                  { label: 'Subscribers', value: '347',     delta: '+8',    pos: true  },
                  { label: 'At risk',     value: '23',      delta: '↑ 5',   pos: false },
                  { label: 'Churn rate',  value: '3.2%',    delta: '↓ 0.4', pos: true  },
                ].map(m => (
                  <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <div className="text-[10px] text-white/30 mb-1">{m.label}</div>
                    <div className="text-lg font-bold mb-0.5">{m.value}</div>
                    <div className={`text-[10px] font-medium ${m.pos ? 'text-emerald-400' : 'text-red-400'}`}>{m.delta}</div>
                  </div>
                ))}
              </div>
              {/* At-risk panel + chart side by side */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* At-risk list */}
                <div className="bg-white/[0.02] border border-orange-500/20 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-semibold text-orange-400">⚡ Action centre</span>
                    <span className="text-[10px] text-white/25">23 at risk</span>
                  </div>
                  {[
                    { name: 'James M.',   score: 9, plan: 'Pro',     days: 34 },
                    { name: 'Sarah K.',   score: 8, plan: 'Creator', days: 21 },
                    { name: 'David L.',   score: 7, plan: 'Pro',     days: 18 },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-[10px] font-bold text-orange-400">{r.name[0]}</div>
                        <div>
                          <div className="text-xs font-medium">{r.name}</div>
                          <div className="text-[10px] text-white/25">{r.days}d inactive · {r.plan}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.score >= 9 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{r.score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* MRR chart */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <div className="text-xs font-semibold mb-3">MRR trend</div>
                  <div className="flex items-end gap-1.5 h-24">
                    {[38, 45, 52, 48, 61, 58, 72].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-sm ${i === 6 ? 'bg-emerald-400' : 'bg-emerald-500/30'}`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Oct','Nov','Dec','Jan','Feb','Mar','Apr'].map(m => (
                      <span key={m} className="text-[9px] text-white/20 flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-white/25 mt-4">Your daily command centre — see every at-risk subscriber and act before they cancel</p>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 py-10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 gap-8 text-center">
          {[
            { val: '23%',     label: 'Average annual income lost to silent churn' },
            { val: '18 days', label: 'Average early warning before a subscriber cancels' },
            { val: '34%',     label: 'Average churn reduction in the first 30 days' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-emerald-400 mb-2">{s.val}</div>
              <div className="text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-8 py-24 text-center">
        <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-4">The problem</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Your income drops and you have
          <br />
          <span className="text-white/40">no idea why — or who left</span>
        </h2>
        <p className="text-white/50 leading-relaxed text-lg">
          You check your Patreon dashboard, see your subscriber count dropped by 8, and have no way to know who they were, why they left, or what you could have done differently. SubPilot gives you <span className="text-white">the names, the reasons, and the message to send</span> — before they cancel.
        </p>
      </section>

      {/* ── SUBSCRIBER DETAIL SCREENSHOT ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Subscriber profiles</div>
            <h2 className="text-3xl font-bold mb-4">Click any subscriber — see everything</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Every subscriber has a full profile. Churn score breakdown, payment history, tenure, last active date, and a one-click win-back email. No more guessing who to contact.
            </p>
            <ul className="space-y-3">
              {[
                'Churn risk score with factor breakdown',
                'Full subscription timeline',
                'One-click alert to your inbox',
                'Copy email or open in mail client',
              ].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Subscriber card mockup */}
          <div className="bg-[#080808] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="bg-[#111] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[10px] text-white/20 ml-2">← Dashboard / James Mitchell</span>
            </div>
            <div className="p-5">
              {/* Profile header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl font-bold text-orange-400 flex-shrink-0">J</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">James Mitchell</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Past due</span>
                  </div>
                  <div className="text-xs text-white/35 mb-2">james@company.io</div>
                  <div className="flex gap-2">
                    <button className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-lg">⚡ Send win-back alert</button>
                    <button className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/40 px-2.5 py-1 rounded-lg">📋 Copy email</button>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'MRR',         value: '$149', color: 'text-white' },
                  { label: 'Tenure',      value: '8mo',  color: 'text-white' },
                  { label: 'Churn score', value: '9/10', color: 'text-red-400' },
                  { label: 'Last active', value: '34d',  color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
                    <div className="text-[9px] text-white/25 mb-1">{s.label}</div>
                    <div className={`text-xs font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              {/* Churn breakdown */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                <div className="text-[10px] font-semibold mb-2 text-white/60">Churn risk breakdown</div>
                {[
                  { label: 'Activity',   val: 9 },
                  { label: 'Payment',    val: 8 },
                  { label: 'Tenure',     val: 5 },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] text-white/30 w-14">{f.label}</span>
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${f.val * 10}%` }} />
                    </div>
                    <span className="text-[9px] text-white/40 w-4">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ────────────────────────────────────────────────────────── */}
      <section id="platforms" className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Integrations</div>
          <h2 className="text-3xl font-bold">Connects to every platform you use</h2>
          <p className="text-white/50 mt-3 text-sm">One dashboard for all your income streams — no spreadsheets, no manual exports.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Patreon',      desc: 'OAuth connect — pulls all patron tiers and churn data',     icon: '🎨', status: 'Native' },
            { name: 'Gumroad',      desc: 'Direct API — sales, refunds, and customer data',            icon: '🛍', status: 'Native' },
            { name: 'Stripe',       desc: 'Read-only sync — subscribers, MRR, failed payments',        icon: '💳', status: 'Native' },
            { name: 'Any platform', desc: 'Upload any CSV — SubPilot auto-detects your columns',       icon: '📂', status: 'CSV import' },
          ].map(p => (
            <div key={p.name} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="font-semibold text-sm mb-1">{p.name}</div>
              <div className="text-xs text-white/40 mb-3 leading-relaxed">{p.desc}</div>
              <div className="text-xs text-emerald-400 font-medium">{p.status}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" className="border-y border-white/10 bg-white/[0.02] py-24">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">How it works</div>
            <h2 className="text-3xl font-bold">From connection to action in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { n: '01', title: 'Connect your platforms',  desc: 'Link Patreon, Gumroad, or Stripe in one click. SubPilot pulls your subscriber data automatically — read-only, always secure.' },
              { n: '02', title: 'AI scores every subscriber', desc: 'SubPilot analyses activity, payment history, and engagement daily. Every subscriber gets a churn risk score from 1–10 with an explanation.' },
              { n: '03', title: 'Act before they leave',   desc: "Get a daily briefing with your top 3 actions. SubPilot writes the win-back message for you — personalised to each subscriber's situation." },
            ].map(s => (
              <div key={s.n} className="flex gap-5">
                <div className="text-4xl font-bold text-emerald-500/20 leading-none pt-1 flex-shrink-0">{s.n}</div>
                <div>
                  <div className="font-semibold text-sm mb-2">{s.title}</div>
                  <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">What you get</div>
          <h2 className="text-3xl font-bold">Everything you need to protect your income</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎯', title: 'Churn risk scores',         desc: 'Every subscriber scored 1–10 daily. See who is about to leave weeks before they cancel.' },
            { icon: '✉️', title: 'AI win-back emails',        desc: 'Claude writes a personalised message for each at-risk subscriber. Copy and send in one click.' },
            { icon: '📊', title: 'Unified income dashboard',  desc: 'All your platforms in one place. MRR, subscriber count, churn rate — updated every 24 hours.' },
            { icon: '🔔', title: 'Daily briefing to inbox',   desc: 'Wake up to a 3-sentence summary of your business health and the one thing to do today.' },
            { icon: '💰', title: 'Tax pot calculator',        desc: 'Set aside the right amount for taxes automatically. No more end-of-year surprises.' },
            { icon: '📈', title: 'Revenue opportunities',     desc: 'SubPilot identifies subscribers ready to upgrade and tells you exactly how to approach them.' },
          ].map(f => (
            <div key={f.title} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-emerald-500/20 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="font-semibold text-sm mb-2">{f.title}</div>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.02] py-24">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Who it's for</div>
            <h2 className="text-3xl font-bold">Built for independent creators who depend on recurring income</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎨', type: 'Patreon creators',    pain: "Subscriber count drops and you have no idea who left or why.",               fix: 'SubPilot names every at-risk subscriber and tells you what to say to keep them.' },
              { icon: '🛍', type: 'Gumroad sellers',     pain: "Customers buy once and never come back — you can't tell who might subscribe.", fix: 'SubPilot tracks buyer behaviour and flags warm leads for your membership offer.' },
              { icon: '✍️', type: 'Newsletter writers',  pain: 'Paid subscribers quietly cancel and your open rates are the only warning sign.', fix: 'SubPilot catches disengaging readers before they hit the cancel button.' },
            ].map(w => (
              <div key={w.type} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                <div className="text-3xl mb-4">{w.icon}</div>
                <div className="font-semibold text-sm mb-3 text-emerald-400">{w.type}</div>
                <div className="text-xs text-white/40 mb-3 leading-relaxed"><span className="text-white/60">The problem:</span> {w.pain}</div>
                <div className="text-xs text-white/70 leading-relaxed"><span className="text-emerald-400">SubPilot:</span> {w.fix}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Reviews</div>
          <h2 className="text-3xl font-bold">Creators protecting their income every day</h2>
          <p className="text-white/40 mt-3 text-sm">Here's what early users say about SubPilot.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote: "I had no idea 11 subscribers were about to cancel until SubPilot flagged them. Reached out to 3 of them and kept all 3. That's $440 a month I would have just lost.",
              name:  'Alex Rivera',
              role:  'Patreon creator · 1,200 subscribers',
              stars: 5,
              avatar: 'A',
              color: 'bg-purple-500/20 text-purple-400',
            },
            {
              quote: "The daily email briefing is the first thing I read every morning. It tells me exactly what to do — not just data, but actual actions. I saved 18% of my at-risk subscribers last month.",
              name:  'Sarah Kim',
              role:  'Gumroad seller · $12k MRR',
              stars: 5,
              avatar: 'S',
              color: 'bg-blue-500/20 text-blue-400',
            },
            {
              quote: "Set it up in literally 4 minutes with my Stripe account. The churn scores were accurate from day one. Three subscribers I would never have noticed were already at a 9/10 risk.",
              name:  'Marcus Webb',
              role:  'Newsletter writer · 840 paid subscribers',
              stars: 5,
              avatar: 'M',
              color: 'bg-emerald-500/20 text-emerald-400',
            },
            {
              quote: "I tried building something like this myself in Notion. Gave up after a week. SubPilot does everything I wanted and more — and the subscriber detail page is genuinely beautiful.",
              name:  'Priya Nair',
              role:  'Course creator · Kajabi',
              stars: 5,
              avatar: 'P',
              color: 'bg-rose-500/20 text-rose-400',
            },
            {
              quote: "The win-back email SubPilot drafted for one subscriber was so good I barely changed a word. She replied within 2 hours and re-subscribed at the annual plan. Worth it alone.",
              name:  'Tom Eriksson',
              role:  'SaaS founder · Stripe billing',
              stars: 5,
              avatar: 'T',
              color: 'bg-amber-500/20 text-amber-400',
            },
            {
              quote: "I was losing $600–900 a month to churn and had no system to catch it. First week with SubPilot I identified 7 at-risk subscribers. Kept 4 of them. Already paid for a year.",
              name:  'Jade Okonkwo',
              role:  'Membership community owner',
              stars: 5,
              avatar: 'J',
              color: 'bg-cyan-500/20 text-cyan-400',
            },
          ].map(r => (
            <div key={r.name} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4 hover:border-white/[0.12] transition-colors">
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed flex-1">"{r.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${r.color}`}>
                  {r.avatar}
                </div>
                <div>
                  <div className="text-xs font-semibold">{r.name}</div>
                  <div className="text-[10px] text-white/30">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST ────────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.02] py-16">
        <div className="max-w-4xl mx-auto px-8 grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🔒', title: 'Read-only access',     desc: 'We connect to your platforms in read-only mode. We can never move money, post content, or modify your account.' },
            { icon: '🏦', title: 'Bank-level security',  desc: 'All data encrypted in transit and at rest. OAuth authentication — we never see your platform passwords.' },
            { icon: '🚫', title: 'Your data stays yours', desc: 'We use your subscriber data only to generate your insights. We never sell it. Full stop.' },
          ].map(t => (
            <div key={t.title}>
              <div className="text-2xl mb-3">{t.icon}</div>
              <div className="text-sm font-semibold mb-2">{t.title}</div>
              <div className="text-xs text-white/40 leading-relaxed">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-3xl font-bold">Simple pricing. No transaction fees. No surprises.</h2>
            <p className="text-white/50 mt-3 text-sm">If SubPilot helps you keep just 2 subscribers, it pays for itself every month.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Creator', price: '$29', per: '/mo',
                desc: 'For independent creators just getting started.',
                limit: 'Up to 500 subscribers',
                features: ['Patreon + Gumroad connect', 'Daily churn risk scores', 'Morning email briefing', 'At-risk subscriber list', 'Tax pot calculator'],
                featured: false,
              },
              {
                name: 'Pro', price: '$79', per: '/mo',
                desc: 'For growing creators who need to act fast.',
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
              <div key={p.name} className={`rounded-xl p-6 border relative ${p.featured ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/[0.03] border-white/10'}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">Most popular</div>
                )}
                <div className="text-xs text-white/50 uppercase tracking-widest mb-2">{p.name}</div>
                <div className="text-4xl font-bold mb-1">{p.price}<span className="text-sm text-white/40 font-normal">{p.per}</span></div>
                <div className="text-xs text-white/40 mb-1">{p.desc}</div>
                <div className="text-xs text-emerald-400 mb-5">{p.limit}</div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                      <span className="text-emerald-400 flex-shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/auth/signup" className={`block w-full py-2.5 rounded-lg text-sm font-medium transition-colors text-center ${p.featured ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                  Start free trial
                </a>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-xs text-white/30">
            Annual billing available at 20% discount · Cancel anytime · No contracts
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-emerald-500 py-20 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-black mb-4">Stop losing subscribers without knowing why</h2>
          <p className="text-black/70 mb-8">Join creators already protecting their income with SubPilot. Free 14-day trial. No credit card required.</p>
          {!submitted ? (
            <form onSubmit={handleWaitlist} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-black/20 border border-black/20 rounded-lg px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black/40"
              />
              <button type="submit" className="bg-black text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-black/80 transition-colors whitespace-nowrap">
                Get started →
              </button>
            </form>
          ) : (
            <div className="bg-black/20 text-black px-6 py-4 rounded-lg max-w-md mx-auto text-sm font-medium">✓ You're on the list — talk soon.</div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-8 py-8 flex items-center justify-between text-xs text-white/30">
        <div>
          <a href="/" className="text-white/60 font-medium hover:text-white transition-colors">
            Sub<span className="text-emerald-400">Pilot</span>
          </a>
          <span className="ml-4">© 2026 · Protect your creator income.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

    </main>
  )
}
