'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/auth/login?signup=success')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-[#0d0d0d] border-r border-white/[0.06] p-12 overflow-hidden">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-emerald-400 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="9" viewBox="0 0 15 11" fill="none">
              <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight">User<span className="text-emerald-400">Retain</span></span>
        </Link>

        {/* Main content */}
        <div className="space-y-8">

          {/* Headline */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Free 14-day trial, no card needed</span>
            </div>
            <h2 className="text-2xl font-bold leading-snug mb-3">
              Know who's about to cancel<br />
              <span className="text-emerald-400">before they do</span>
            </h2>
            <p className="text-[#e8eaed] text-sm leading-relaxed">
              UserRetain watches every subscriber 24/7 and tells you exactly who to reach out to — with a personalised message already written.
            </p>
          </div>

          {/* Mini dashboard preview */}
          <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-white/70">At-risk subscribers</span>
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">3 need action</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { name: 'Sarah K.', plan: 'Growth · $79/mo', score: 9, badge: 'bg-red-500/20 text-red-400', note: '34 days inactive' },
                { name: 'James T.', plan: 'Starter · $29/mo', score: 8, badge: 'bg-orange-500/20 text-orange-400', note: 'Failed payment' },
                { name: 'Mia L.',   plan: 'Growth · $79/mo', score: 7, badge: 'bg-amber-500/20 text-amber-400',  note: 'Low feature usage' },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/70">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{u.name}</div>
                      <div className="text-[10px] text-white/40">{u.plan}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">{u.note}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${u.badge}`}>{u.score}/10</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-[68%] bg-emerald-400 rounded-full" />
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">AI messages ready</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: '⚡', title: 'Live churn scores', desc: 'Every user scored daily based on activity, payments, and behaviour' },
              { icon: '✉️', title: 'AI win-back emails', desc: 'One-click personalised messages drafted for each at-risk user' },
              { icon: '☀️', title: 'Morning briefing', desc: 'Daily email with exactly who to contact and what to say' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="text-base mt-0.5">{f.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-white/45 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-[#e8eaed] leading-relaxed mb-3">
              &quot;Set up in 4 minutes. Three users were already at 9/10 risk. Kept two of them. Paid for a year in one week.&quot;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">A</div>
              <span className="text-[10px] text-white/40">Alex R., founder · SaaS startup</span>
            </div>
          </div>

        </div>

        <p className="text-white/20 text-xs">© 2026 UserRetain. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL - FORM ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-[24px] h-[24px] rounded-[5px] bg-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg width="12" height="9" viewBox="0 0 15 11" fill="none">
                  <path d="M1 9L4.5 5L7.5 7L11 3L14 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[15px] font-bold tracking-tight">User<span className="text-emerald-400">Retain</span></span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1">Start your free trial</h1>
          <p className="text-white/40 text-sm mb-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
              Log in
            </Link>
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Work email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
            >
              {loading ? 'Creating account...' : 'Create free account →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <div className="flex flex-col gap-2">
              {['Free 14-day trial, no credit card required', 'Connect Stripe in 60 seconds', 'See your first at-risk users immediately'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/40">
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
