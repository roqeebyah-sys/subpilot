'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const justSignedUp = searchParams.get('signup') === 'success'
  const justReset = searchParams.get('reset') === 'success'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // signIn() is from NextAuth — it handles the login request
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false, // don't redirect automatically — we'll handle it
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // Login successful — go to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* LEFT PANEL */}
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
        <div className="space-y-7">

          <div>
            <h2 className="text-2xl font-bold leading-snug mb-2">
              Welcome back.<br />
              <span className="text-emerald-400">Your subscribers missed you.</span>
            </h2>
            <p className="text-[#e8eaed] text-sm leading-relaxed">
              Here&apos;s what UserRetain has been watching while you were away.
            </p>
          </div>

          {/* Live alerts */}
          <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-white/70">Today&apos;s alerts</span>
              </div>
              <span className="text-[10px] text-white/30 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">Sample data</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { level: 'high',   icon: '🔴', text: '3 subscribers likely to cancel this week', sub: '$2,400/mo at risk', action: 'Send win-back email' },
                { level: 'medium', icon: '🟡', text: '6 failed payments need recovery', sub: '$588/mo at risk', action: 'Retry payments' },
                { level: 'good',   icon: '🟢', text: '11 users ready to upgrade', sub: '+$700/mo opportunity', action: 'Send upgrade offer' },
              ].map((a) => (
                <div key={a.text} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-xs mt-0.5 flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{a.text}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{a.sub}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md border font-medium flex-shrink-0 ${
                    a.level === 'high'   ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    a.level === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>{a.action} →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: '34%', label: 'Churn reduction' },
              { val: '18d', label: 'Early warning' },
              { val: '$2.4k', label: 'Avg. recovered/mo' },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-3 text-center">
                <div className="text-base font-bold text-emerald-400">{s.val}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-2.5">
            {[
              'Daily churn scores for every subscriber',
              'AI-drafted win-back emails in one click',
              'Morning briefing with who to contact today',
              'Stripe sync and CSV import',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-xs text-[#e8eaed]">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {f}
              </div>
            ))}
          </div>

        </div>

        <p className="text-white/20 text-xs">© 2026 UserRetain. All rights reserved.</p>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
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

          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300">
              Sign up free
            </Link>
          </p>

          {justSignedUp && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-6">
              ✓ Account created! Log in to get started.
            </div>
          )}

          {justReset && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-6">
              ✓ Password updated! Log in with your new password.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Email</label>
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
              <div className="flex justify-between mb-2">
                <label className="text-sm text-white/60">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
            >
              {loading ? 'Logging in...' : 'Log in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}