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

  // Check if they just signed up successfully
  const justSignedUp = searchParams.get('signup') === 'success'

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
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0f0f0f] border-r border-white/10 p-12">
        <Link href="/" className="text-xl font-semibold">
          Sub<span className="text-emerald-400">Pilot</span>
        </Link>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <div className="text-xs text-emerald-400 uppercase tracking-widest mb-4">✦ Live alert example</div>
          <div className="space-y-3">
            {[
              { level: 'high', text: '3 subscribers likely to cancel this week', sub: '$2,400/mo at risk' },
              { level: 'medium', text: '6 failed payments need recovery', sub: '$588/mo at risk' },
              { level: 'good', text: '11 users ready to upgrade', sub: '+$700/mo opportunity' },
            ].map((a) => (
              <div key={a.text} className={`flex gap-3 p-3 rounded-lg border ${
                a.level === 'high' ? 'bg-red-500/5 border-red-500/20' :
                a.level === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  a.level === 'high' ? 'bg-red-400' :
                  a.level === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div>
                  <div className="text-xs font-medium">{a.text}</div>
                  <div className="text-xs text-[#e8eaed] mt-0.5">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/45 text-xs">© 2026 SubPilot</p>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-xl font-semibold">
              Sub<span className="text-emerald-400">Pilot</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm mb-8">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300">
              Sign up free
            </Link>
          </p>

          {justSignedUp && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-6">
              ✓ Account created! Log in to get started.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#e8eaed] mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/45 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-[#e8eaed]">Password</label>
                <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/45 focus:outline-none focus:border-emerald-500 transition-colors"
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