'use client'

import { useState } from 'react'
import Link from 'next/link'

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-base font-medium text-gray-900">{q}</span>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <p className="pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function PreviewPage() {
  const [email, setEmail] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`
  }

  const faqs = [
    { q: 'How does UserRetain connect to my data?', a: 'UserRetain connects directly to Stripe via read-only API access, or you can import users via CSV. We never write to your Stripe account, charge your users, or store raw payment data beyond what is needed to compute risk scores.' },
    { q: 'Is there a free trial?', a: 'Yes, every plan starts with a free 14-day trial, no credit card required. You will see real data from your users within minutes of connecting Stripe or uploading a CSV.' },
    { q: 'What is the morning briefing email?', a: 'Every morning at 7 AM you receive a plain-text email with the top 3 users to reach out to that day, each with an AI-written suggested message tailored to their specific risk factors. No dashboard required.' },
    { q: 'What is the AI win-back email feature?', a: 'Clicking any at-risk user opens an AI-drafted win-back email personalised with their history, plan, and inactivity period. You can edit the subject and body, choose a tone, and send directly from UserRetain or copy it to your own email client.' },
    { q: 'Is my data secure?', a: 'UserRetain uses read-only API access and never stores raw user financial data beyond what is needed to compute risk scores. All connections are encrypted in transit and at rest. We do not sell or share your data with third parties.' },
    { q: 'Can I cancel anytime?', a: 'Yes, no contracts, no lock-in. Cancel from your billing page at any time. If you cancel mid-month you retain access until the end of the billing period.' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg width="13" height="9" viewBox="0 0 15 11" fill="none">
                <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-gray-900">User<span className="text-violet-600">Retain</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/auth/signup" className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Get started free
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              {mobileOpen
                ? <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                : <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              }
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
            {['Features','How it works','Pricing','FAQ'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} className="block text-sm text-gray-600 hover:text-gray-900">{l}</a>
            ))}
            <Link href="/auth/signup" className="block w-full text-center bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg mt-2">
              Get started free
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
            For SaaS founders losing MRR to silent churn
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold leading-[1.1] tracking-tight text-gray-900 mb-5">
            Catch churn before it<br className="hidden sm:block" />
            <span className="text-violet-600"> shows up in your MRR</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            UserRetain scores every subscriber daily for churn risk, then tells you exactly who to reach out to and what to say. Set up in 4 minutes.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto mb-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
              See my churn risk →
            </button>
          </form>
          <p className="text-xs text-gray-400">Free 14-day trial. No credit card. Cancel anytime.</p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-5xl mx-auto mt-14 rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/80 overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white border border-gray-200 rounded-md px-4 py-1 text-xs text-gray-400">app.userretain.io/dashboard</div>
            </div>
          </div>
          <div className="bg-[#080808] p-4">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'MRR', val: '$4,820', sub: '+$340 this month', color: 'text-white' },
                { label: 'Revenue at risk', val: '$1,260', sub: '4 subscribers', color: 'text-red-400' },
                { label: 'Churn rate', val: '3.2%', sub: '-0.4% vs last mo', color: 'text-amber-400' },
                { label: 'Active', val: '347', sub: '12 new this month', color: 'text-violet-400' },
              ].map(k => (
                <div key={k.label} className="bg-white/[0.04] rounded-lg p-3">
                  <div className="text-[10px] text-white/40 mb-1">{k.label}</div>
                  <div className={`text-base font-bold ${k.color}`}>{k.val}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{k.sub}</div>
                </div>
              ))}
            </div>
            {/* Main area */}
            <div className="grid grid-cols-[1fr_220px] gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-white">High Risk Subscribers</span>
                  <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">4 at risk</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'James M.', plan: 'Pro $49/mo', days: '34d inactive', score: 9, color: 'bg-red-500/20 text-red-400' },
                    { name: 'Sarah K.', plan: 'Growth $29/mo', days: '21d inactive', score: 8, color: 'bg-orange-500/20 text-orange-400' },
                    { name: 'David L.', plan: 'Pro $49/mo', days: '18d inactive', score: 7, color: 'bg-orange-500/20 text-orange-400' },
                    { name: 'Priya N.', plan: 'Starter $9/mo', days: '15d inactive', score: 6, color: 'bg-amber-500/20 text-amber-400' },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white">{r.name[0]}</div>
                        <div>
                          <div className="text-xs font-medium text-white">{r.name}</div>
                          <div className="text-[10px] text-white/40">{r.plan} · {r.days}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.color}`}>{r.score}/10</span>
                        <span className="text-[9px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded font-medium">+ Send</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-widest">AI Insights</span>
                </div>
                <div className="bg-red-500/10 rounded p-2.5">
                  <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Today's briefing</div>
                  <div className="text-[10px] text-white/80 leading-relaxed">4 subscribers show elevated churn risk. Immediate action on James M. could protect $49/mo.</div>
                </div>
                <div className="bg-amber-500/10 rounded p-2.5">
                  <div className="text-[10px] text-amber-400 mb-1 font-medium">Top priority</div>
                  <div className="text-[10px] text-white/70 leading-relaxed">Reach out to James M. today. 34 days inactive, never used core feature.</div>
                </div>
                <div className="bg-white/[0.03] rounded p-2.5">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Revenue opportunities</div>
                  <div className="text-[10px] text-white/60 space-y-1">
                    <div>↑ Offer onboarding call to 2 users stuck at setup</div>
                    <div>↑ Pro upgrade candidate: Sarah K. hitting plan limits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-gray-200 bg-gray-50 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { val: '23%', label: 'Average MRR lost annually to silent churn' },
            { val: '18 days', label: 'Average warning window before a user cancels' },
            { val: '34%', label: 'Churn reduction in the first 30 days' },
          ].map(s => (
            <div key={s.val}>
              <div className="text-3xl font-bold text-violet-600 mb-1">{s.val}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs text-violet-600 font-semibold uppercase tracking-widest mb-3">Why UserRetain exists</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
            Most SaaS analytics tools show you dashboards.<br className="hidden sm:block" />
            They don&apos;t tell you who&apos;s about to leave.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            You open your analytics, see a churn rate, and think &quot;that seems okay.&quot; Then three high-value customers cancel the same week and your MRR drops by $4,000. UserRetain tells you before it happens — with a clear action to take.
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-violet-600 font-semibold uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything you need to stop churn</h2>
          </div>

          <div className="space-y-20">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block text-xs text-violet-600 font-semibold uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full mb-4">Churn scores</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Know exactly who is about to cancel</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Our AI checks login activity, feature adoption, onboarding completion, and payment history. Each user gets a risk score so you know exactly who to reach out to before they decide to cancel.
                </p>
                <div className="space-y-2">
                  {[
                    { badge: '9–10', color: 'bg-red-100 text-red-700', label: 'Immediate risk. Reach out today.' },
                    { badge: '7–8', color: 'bg-orange-100 text-orange-700', label: 'High risk. Worth a personal message.' },
                    { badge: '4–6', color: 'bg-amber-100 text-amber-700', label: 'Moderate. Monitor closely.' },
                    { badge: '1–3', color: 'bg-emerald-100 text-emerald-700', label: 'Healthy. No action needed.' },
                  ].map(t => (
                    <div key={t.badge} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${t.color}`}>{t.badge}</span>
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-widest">At-risk subscribers</div>
                <div className="space-y-2">
                  {[
                    { name: 'James M.', sub: 'Pro $49/mo · 34d inactive', score: 9, color: 'bg-red-100 text-red-700' },
                    { name: 'Sarah K.', sub: 'Growth $29/mo · 21d inactive', score: 8, color: 'bg-orange-100 text-orange-700' },
                    { name: 'David L.', sub: 'Pro $49/mo · 18d inactive', score: 7, color: 'bg-orange-100 text-orange-700' },
                    { name: 'Priya N.', sub: 'Starter $9/mo · 15d inactive', score: 6, color: 'bg-amber-100 text-amber-700' },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{r.name[0]}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-400">{r.sub}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.score}/10</span>
                        <button className="text-xs bg-violet-600 text-white px-2.5 py-1 rounded-md font-medium">Send →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm md:order-first order-last">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-900">UserRetain Daily Briefing</div>
                  <div className="text-[10px] text-gray-400">hello@userretain.io</div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs text-gray-500 font-medium">Good morning. Here&apos;s your briefing.</div>
                  {[
                    { name: 'James M.', note: '34 days inactive, $49/mo — score 9/10. Never completed onboarding.' },
                    { name: 'Sarah K.', note: "Hasn't used core feature in 3 weeks, $29/mo — score 8/10. Offer a check-in call." },
                    { name: 'David L.', note: 'Payment failed once, 18d inactive — score 7/10. Re-engage with a product update.' },
                  ].map(u => (
                    <div key={u.name} className="border border-gray-100 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-900 mb-1">{u.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{u.note}</div>
                      <button className="mt-2 text-[10px] bg-violet-50 text-violet-700 px-2 py-1 rounded font-medium">Send AI message →</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="inline-block text-xs text-violet-600 font-semibold uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full mb-4">Morning briefing</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Wake up knowing exactly who to call</h3>
                <p className="text-gray-500 leading-relaxed">
                  No more digging through dashboards. Every morning you get an email with the 3 users to reach out to today, each with a suggested action written by AI based on their specific product behaviour and risk signals.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block text-xs text-violet-600 font-semibold uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full mb-4">AI win-back emails</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">One-click emails personalised to each user</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Click any at-risk user and get a complete win-back email drafted by AI, personalised with their history, plan, and inactivity period. Edit, choose a tone, and send in seconds.
                </p>
                <div className="space-y-2">
                  {['AI win-back emails per user', 'Tone selector (warm, casual, urgent)', 'Copy or send direct from UserRetain'].map(p => (
                    <div key={p} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-violet-600 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">AI-drafted email</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex gap-2"><span className="text-gray-400 w-12 flex-shrink-0">To:</span><span>james@acme.com</span></div>
                  <div className="flex gap-2"><span className="text-gray-400 w-12 flex-shrink-0">Subject:</span><span className="text-gray-900 font-medium">Quick check-in from UserRetain</span></div>
                  <div className="border-t border-gray-100 pt-3 leading-relaxed text-gray-600">
                    Hey James, I noticed you haven&apos;t logged in for a few weeks. Wanted to reach out personally — is there anything blocking you from getting value from the product? Happy to jump on a quick call.
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="bg-violet-600 text-white text-xs px-3 py-1.5 rounded-md font-medium">Send →</button>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-md">Edit tone</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs text-violet-600 font-semibold uppercase tracking-widest mb-3">How it works</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-14">Up and running in 60 seconds</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Connect Stripe or import CSV', desc: 'Link Stripe for automatic sync or upload a CSV. Read-only access. We never write to your account.' },
              { n: '02', title: 'AI identifies who is at risk', desc: 'UserRetain scores every subscriber for churn risk daily — flagging major drops, payment failures, and engagement declines.' },
              { n: '03', title: 'Act before they cancel', desc: 'Get a morning email with the top 3 users to contact and an AI-drafted message personalised to each one.' },
            ].map(s => (
              <div key={s.n} className="text-left">
                <div className="text-4xl font-black text-gray-100 mb-4">{s.n}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs text-violet-600 font-semibold uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Simple, flat pricing. No transaction fees.</h2>
            <p className="text-gray-500 text-sm">If UserRetain saves you 2 subscribers, it pays for itself. Every month.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: '$29', period: '/mo',
                desc: 'For early-stage SaaS businesses with up to 250 subscribers.',
                features: ['Stripe connected', 'Daily churn scores', 'Morning email briefing', 'At-risk subscriber list'],
                cta: 'Start free trial', highlight: false,
              },
              {
                name: 'Growth', price: '$79', period: '/mo',
                desc: 'For growing SaaS teams that need AI and action recommendations.',
                features: ['Everything in Starter', 'AI action recommendations', 'One-click AI emails', 'Failed payment recovery', 'Revenue opportunity alerts'],
                cta: 'Start free trial', highlight: true,
              },
              {
                name: 'Pro', price: '$149', period: '/mo',
                desc: 'Full automation for serious operators with up to 5,000 subscribers.',
                features: ['Everything in Growth', 'Automated email sending', 'Slack and webhook alerts', 'Team access', 'Priority support'],
                cta: 'Start free trial', highlight: false,
              },
            ].map(p => (
              <div key={p.name} className={`rounded-xl p-6 ${p.highlight ? 'bg-violet-600 text-white shadow-xl shadow-violet-200' : 'bg-white border border-gray-200 shadow-sm'}`}>
                {p.highlight && <div className="text-xs font-semibold text-violet-200 uppercase tracking-widest mb-3">Most popular</div>}
                <h3 className={`text-base font-bold mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className={`text-3xl font-black ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{p.period}</span>
                </div>
                <p className={`text-xs mb-5 leading-relaxed ${p.highlight ? 'text-violet-200' : 'text-gray-500'}`}>{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-xs ${p.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                      <svg className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${p.highlight ? 'text-violet-200' : 'text-violet-600'}`} viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                  p.highlight
                    ? 'bg-white text-violet-600 hover:bg-violet-50'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs text-violet-600 font-semibold uppercase tracking-widest mb-3">FAQ</div>
            <h2 className="text-3xl font-bold text-gray-900">Common questions</h2>
          </div>
          <div>{faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-violet-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Find out who&apos;s about to cancel — before they do</h2>
          <p className="text-violet-200 text-base mb-8">Join SaaS founders already protecting their MRR. Free 14-day trial, no credit card required.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-violet-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button type="submit" className="bg-white text-violet-600 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-50 transition-colors whitespace-nowrap">
              Get early access →
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <svg width="11" height="8" viewBox="0 0 15 11" fill="none">
                  <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">User<span className="text-violet-600">Retain</span></span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
              <Link href="/auth/login" className="hover:text-gray-900 transition-colors">Log in</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>© 2026 UserRetain. All rights reserved.</span>
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-gray-700 transition-colors">Cookies</Link>
              <a href="mailto:support@userretain.io" className="hover:text-gray-700 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
