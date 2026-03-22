'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // We'll wire this to a real DB in Week 2
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
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-2 rounded-lg transition-colors">
            Get early access
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          AI-powered subscription intelligence
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Know who's about to cancel
          <span className="text-emerald-400"> before they do</span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          SubPilot connects to Stripe, watches your subscribers 24/7, and tells you
          exactly who to contact, what to say, and when — before churn hits your MRR.
        </p>

        {/* WAITLIST FORM */}
        {!submitted ? (
          <form onSubmit={handleWaitlist} className="flex gap-3 max-w-md mx-auto">
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
              Join waitlist
            </button>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-lg max-w-md mx-auto text-sm">
            ✓ You're on the list — we'll be in touch soon.
          </div>
        )}

        <p className="text-white/30 text-xs mt-4">
          Free 14-day trial · No credit card required · Cancel anytime
        </p>
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 py-10">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 gap-8 text-center">
          {[
            { val: '34%', label: 'Average churn reduction' },
            { val: '18 days', label: 'Average warning before churn' },
            { val: '10x', label: 'ROI vs subscription cost' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-emerald-400 mb-1">{s.val}</div>
              <div className="text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">What SubPilot does</div>
          <h2 className="text-3xl font-bold">From data to action in seconds</h2>
          <p className="text-white/50 mt-3 text-sm max-w-xl mx-auto">No dashboards to stare at. SubPilot watches everything and only surfaces what matters.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔌',
              title: 'Connect Stripe',
              desc: 'One-click OAuth. SubPilot pulls your subscribers, MRR, and payment history instantly. No CSV uploads, no manual entry.',
            },
            {
              icon: '🧠',
              title: 'AI predicts churn',
              desc: 'Scores every subscriber 1–10 for churn risk daily. Flags patterns humans miss — login drops, payment failures, engagement dips.',
            },
            {
              icon: '⚡',
              title: 'Tells you what to do',
              desc: 'Not just insights — actions. "Email these 3 people today. Here\'s the exact message." One click to send.',
            },
            {
              icon: '📈',
              title: 'Revenue intelligence',
              desc: 'Spots upgrade opportunities automatically. "14 users hit your plan limit 3 months running — they\'re ready to upgrade."',
            },
            {
              icon: '💳',
              title: 'Payment recovery',
              desc: 'Catches failed payments before they churn. Retries intelligently and drafts recovery emails automatically.',
            },
            {
              icon: '📬',
              title: 'Daily briefing',
              desc: 'Every morning, a plain-English summary of your subscription business lands in your inbox. No login required.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <div className="font-semibold mb-2 text-sm">{f.title}</div>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white/[0.02] border-y border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">How it works</div>
            <h2 className="text-3xl font-bold">Up and running in 60 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Connect Stripe', desc: 'OAuth in one click. No API keys to copy, no config to touch.' },
              { n: '02', title: 'AI analyses your data', desc: 'SubPilot scores every subscriber and builds your churn risk profile overnight.' },
              { n: '03', title: 'Act on what matters', desc: 'Get a prioritised action list every morning. Do the work, skip the analysis.' },
            ].map((s) => (
              <div key={s.n} className="flex gap-5">
                <div className="text-3xl font-bold text-emerald-500/20 leading-none pt-1">{s.n}</div>
                <div>
                  <div className="font-semibold text-sm mb-2">{s.title}</div>
                  <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-3">Pricing</div>
          <h2 className="text-3xl font-bold">Simple, honest pricing</h2>
          <p className="text-white/50 mt-3 text-sm">No transaction fees. No revenue share. Just a flat monthly fee.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '$29',
              per: '/mo',
              desc: 'For early-stage subscription businesses.',
              limit: 'Up to 100 subscribers',
              features: ['Stripe connect', 'Daily AI briefing', 'Churn risk scores', 'Email alerts'],
              featured: false,
            },
            {
              name: 'Growth',
              price: '$79',
              per: '/mo',
              desc: 'For growing businesses that need more.',
              limit: 'Up to 500 subscribers',
              features: ['Everything in Starter', 'Action recommendations', 'Win-back email drafts', 'Payment recovery'],
              featured: true,
            },
            {
              name: 'Pro',
              price: '$149',
              per: '/mo',
              desc: 'Full automation for serious operators.',
              limit: 'Unlimited subscribers',
              features: ['Everything in Growth', 'Automated email sending', 'Slack alerts', 'Priority support'],
              featured: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-6 border relative ${
                p.featured
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="text-xs text-white/50 uppercase tracking-widest mb-2">{p.name}</div>
              <div className="text-4xl font-bold mb-1">
                {p.price}<span className="text-sm text-white/40 font-normal">{p.per}</span>
              </div>
              <div className="text-xs text-white/40 mb-1">{p.desc}</div>
              <div className="text-xs text-emerald-400 mb-5">{p.limit}</div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  p.featured
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                Start free trial
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-500 py-20 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Stop losing subscribers you could have saved
          </h2>
          <p className="text-black/70 mb-8 text-sm">
            Join hundreds of subscription businesses that catch churn before it happens.
          </p>
          <button className="bg-black text-white font-semibold px-8 py-3 rounded-lg hover:bg-black/80 transition-colors">
            Start your free trial
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-8 py-8 flex items-center justify-between text-xs text-white/30">
        <span>Sub<span className="text-emerald-400">Pilot</span> © 2026</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

    </main>
  )
}