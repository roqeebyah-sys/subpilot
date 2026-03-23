'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-semibold">
          Sub<span className="text-emerald-400">Pilot</span>
        </span>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#examples" className="hover:text-white transition-colors">Examples</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#waitlist" className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-2 rounded-lg transition-colors">
            Get early access
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Built for course creators, SaaS founders, and agencies
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Stop losing subscribers
          <br />
          <span className="text-emerald-400">without knowing why</span>
        </h1>

        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-6 leading-relaxed">
          See which Clients are about to cancel — and exactly what to do to keep them.
          SubPilot watches your subscribers 24/7 so you don't have to.
        </p>

        <div className="inline-block bg-white/5 border border-white/10 rounded-lg px-5 py-3 mb-10 text-sm text-white/70">
          💡 If SubPilot helps you retain just <span className="text-white font-semibold">2 customers</span>, it pays for itself.
        </div>

        {!submitted ? (
          <div id="waitlist" className="flex flex-col items-center gap-3">
            <form onSubmit={handleWaitlist} className="flex gap-3 max-w-md w-full mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                See my churn risk →
              </button>
            </form>
            <p className="text-white/30 text-xs">Free 14-day trial · No credit card · Read-only access to your data</p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-lg max-w-md mx-auto text-sm">
            ✓ You're on the list — we'll reach out within 24 hours.
          </div>
        )}
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 py-10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 gap-8 text-center">
          {[
            { val: '34%', label: 'Average churn reduction in first 30 days' },
            { val: '18 days', label: 'Average warning before a subscriber cancels' },
            { val: '$2,400', label: 'Average monthly revenue recovered per user' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-emerald-400 mb-2">{s.val}</div>
              <div className="text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY THIS EXISTS */}
      <section className="max-w-3xl mx-auto px-8 py-24 text-center">
        <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-4">Why SubPilot exists</div>
        <h2 className="text-3xl font-bold mb-6">
          Most tools show you dashboards.<br />
          <span className="text-white/50">They don't tell you who's about to leave.</span>
        </h2>
        <p className="text-white/50 leading-relaxed text-lg">
          You open your analytics, see a churn rate, and think "that seems okay."
          Then three high-value customers cancel the same week and your MRR drops
          by $4,000. SubPilot tells you <span className="text-white">before it happens</span> —
          with a clear action to take.
        </p>
      </section>

      {/* MOCK DASHBOARD */}
      <section id="examples" className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Real insights. Real actions.</div>
          <h2 className="text-3xl font-bold">This is what SubPilot shows you every morning</h2>
          <p className="text-white/50 mt-3 text-sm">Not a dashboard to stare at. A briefing that tells you what to do.</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">Sub<span className="text-emerald-400">Pilot</span></span>
              <span className="text-xs text-white/30">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/40">Live · Updated 2 mins ago</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'MRR', val: '$12,840', delta: '+8%', up: true },
                { label: 'Active subscribers', val: '284', delta: '+12', up: true },
                { label: 'Churn rate', val: '3.2%', delta: '-0.4%', up: true },
                { label: 'Revenue at risk', val: '$2,400', delta: '8 subscribers', up: false },
              ].map((m) => (
                <div key={m.label} className="bg-white/[0.04] rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-2">{m.label}</div>
                  <div className="text-xl font-bold mb-1">{m.val}</div>
                  <div className={`text-xs ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>{m.delta}</div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">✦ Today's AI alerts</div>
              <div className="space-y-3">
                {[
                  { level: 'high', title: '3 high-value customers likely to cancel this week', desc: '$2,400/mo at risk · Last login 21+ days ago · Plan: Pro', action: 'Send win-back email' },
                  { level: 'medium', title: '6 failed payments need recovery', desc: '$588/mo at risk · Cards on file · Retry window closing', action: 'Retry payments now' },
                  { level: 'opportunity', title: '11 users ready to upgrade from Starter', desc: 'Hit subscriber limit 3 months in a row · High engagement', action: 'Send upgrade offer' },
                ].map((a) => (
                  <div key={a.title} className={`flex items-center justify-between p-4 rounded-xl border ${
                    a.level === 'high' ? 'bg-red-500/5 border-red-500/20' :
                    a.level === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-emerald-500/5 border-emerald-500/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        a.level === 'high' ? 'bg-red-400' :
                        a.level === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <div>
                        <div className="text-sm font-medium mb-1">{a.title}</div>
                        <div className="text-xs text-white/40">{a.desc}</div>
                      </div>
                    </div>
                    <button className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap ml-4 ${
                      a.level === 'high' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                      a.level === 'medium' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    } transition-colors`}>
                      {a.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">At-risk subscribers</div>
              <div className="space-y-2">
                {[
                  { name: 'Sarah K.', plan: 'Pro · $99/mo', risk: 9, days: '24 days ago' },
                  { name: 'James T.', plan: 'Growth · $79/mo', risk: 7, days: '18 days ago' },
                  { name: 'Mia L.', plan: 'Pro · $99/mo', risk: 6, days: '14 days ago' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-4 py-3 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">{s.name[0]}</div>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-white/30">{s.plan}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-white/30">Last seen {s.days}</div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        s.risk >= 8 ? 'bg-red-500/20 text-red-400' :
                        s.risk >= 6 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>Risk {s.risk}/10</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-4">Preview — your real data will look like this after connecting Stripe</p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white/[0.02] border-y border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">How it works</div>
            <h2 className="text-3xl font-bold">Up and running in 60 seconds</h2>
            <p className="text-white/50 mt-3 text-sm">No CSV uploads. No manual entry. No engineers needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { n: '01', title: 'Connect Stripe', desc: 'One-click OAuth. SubPilot gets read-only access to your subscriber data. We never touch your money or your customers.' },
              { n: '02', title: "AI identifies who's at risk", desc: 'SubPilot scores every subscriber for churn risk daily — flagging login drops, payment failures, and engagement dips before they cancel.' },
              { n: '03', title: 'You act, we track results', desc: 'Get a clear action list every morning. Send a win-back email, retry a payment, offer an upgrade. SubPilot tracks what works.' },
            ].map((s) => (
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

      {/* WHO IT'S FOR */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Who it's for</div>
          <h2 className="text-3xl font-bold">Built for subscription businesses that can't afford to lose customers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎓', type: 'Course creators', pain: 'Students drop off after month 2 and you have no idea why.', fix: 'SubPilot tells you which students are disengaging and what to send them.' },
            { icon: '⚙️', type: 'SaaS founders', pain: "Churn is killing your growth but your analytics don't tell you who or why.", fix: 'SubPilot scores every user for churn risk and gives you a daily action list.' },
            { icon: '📊', type: 'Agencies', pain: 'Clients cancel retainers without warning, destroying your revenue forecast.', fix: 'SubPilot flags at-risk clients 3 weeks early so you can save the relationship.' },
          ].map((w) => (
            <div key={w.type} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl mb-4">{w.icon}</div>
              <div className="font-semibold text-sm mb-3 text-emerald-400">{w.type}</div>
              <div className="text-xs text-white/40 mb-3 leading-relaxed"><span className="text-white/60">The problem:</span> {w.pain}</div>
              <div className="text-xs text-white/70 leading-relaxed"><span className="text-emerald-400">SubPilot:</span> {w.fix}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-white/10 bg-white/[0.02] py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🔒', title: 'Read-only access', desc: 'We connect to Stripe in read-only mode. We can never move money, create charges, or modify your account.' },
              { icon: '🏦', title: 'Bank-level security', desc: 'All data encrypted in transit and at rest. OAuth authentication — we never see your Stripe login.' },
              { icon: '🚫', title: 'We never sell your data', desc: 'Your subscriber data is yours. We use it only to generate your insights. Full stop.' },
            ].map((t) => (
              <div key={t.title}>
                <div className="text-2xl mb-3">{t.icon}</div>
                <div className="text-sm font-semibold mb-2">{t.title}</div>
                <div className="text-xs text-white/40 leading-relaxed">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Pricing</div>
          <h2 className="text-3xl font-bold">Simple, flat pricing. No transaction fees.</h2>
          <p className="text-white/50 mt-3 text-sm">If SubPilot saves you 2 subscribers, it pays for itself. Every month.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: '$29', per: '/mo', desc: 'For early-stage subscription businesses.', limit: 'Up to 100 subscribers', features: ['Stripe connect', 'Daily churn risk scores', 'Morning email briefing', 'At-risk subscriber list'], featured: false },
            { name: 'Growth', price: '$79', per: '/mo', desc: 'For growing businesses that need to act fast.', limit: 'Up to 500 subscribers', features: ['Everything in Starter', 'AI action recommendations', 'Win-back email drafts', 'Failed payment recovery', 'Revenue opportunity alerts'], featured: true },
            { name: 'Pro', price: '$149', per: '/mo', desc: 'Full automation for serious operators.', limit: 'Unlimited subscribers', features: ['Everything in Growth', 'Automated email sending', 'Slack + webhook alerts', 'Team access', 'Priority support'], featured: false },
          ].map((p) => (
            <div key={p.name} className={`rounded-xl p-6 border relative ${p.featured ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/[0.03] border-white/10'}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">Most popular</div>
              )}
              <div className="text-xs text-white/50 uppercase tracking-widest mb-2">{p.name}</div>
              <div className="text-4xl font-bold mb-1">{p.price}<span className="text-sm text-white/40 font-normal">{p.per}</span></div>
              <div className="text-xs text-white/40 mb-1">{p.desc}</div>
              <div className="text-xs text-emerald-400 mb-5">{p.limit}</div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="text-emerald-400 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${p.featured ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                Start free trial
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 text-xs text-white/30">
          Annual billing available at 20% discount · Cancel anytime · No contracts
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-emerald-500 py-20 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-black mb-4">Find out who's about to cancel — before they do</h2>
          <p className="text-black/70 mb-8">Join subscription businesses already reducing churn with SubPilot. Free 14-day trial. No credit card required.</p>
          {!submitted ? (
            <form onSubmit={handleWaitlist} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-black/20 border border-black/20 rounded-lg px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black/40"
              />
              <button type="submit" className="bg-black text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-black/80 transition-colors whitespace-nowrap">
                Get early access →
              </button>
            </form>
          ) : (
            <div className="bg-black/20 text-black px-6 py-4 rounded-lg max-w-md mx-auto text-sm font-medium">✓ You're on the list — talk soon.</div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-8 py-8 flex items-center justify-between text-xs text-white/30">
        <div>
          <span className="text-white/60 font-medium">Sub<span className="text-emerald-400">Pilot</span></span>
          <span className="ml-4">© 2026 · Retain more. Earn more.</span>
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