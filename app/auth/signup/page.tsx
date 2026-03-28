'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      // Call our signup API route
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

      // Account created — redirect to login
      router.push('/auth/login?signup=success')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0f0f0f] border-r border-white/10 p-12">
        <Link href="/" className="text-xl font-semibold">
          Sub<span className="text-emerald-400">Pilot</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Stop losing subscribers<br />
            <span className="text-emerald-400">before it's too late</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Join subscription businesses that catch churn before it happens.
          </p>
          <div className="space-y-4">
            {[
              { stat: '34%', label: 'average churn reduction' },
              { stat: '18 days', label: 'average early warning' },
              { stat: '$2,400', label: 'average monthly revenue recovered' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <div className="text-emerald-400 font-bold text-lg w-20">{s.stat}</div>
                <div className="text-white/40 text-sm">{s.label}</div>
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

          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-white/40 text-sm mb-8">
            Already have one?{' '}
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
              <label className="block text-sm text-[#e8eaed] mb-2">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/45 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#e8eaed] mb-2">Work email</label>
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
              <label className="block text-sm text-[#e8eaed] mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/45 focus:outline-none focus:border-emerald-500 transition-colors"
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

          <p className="text-white/45 text-xs text-center mt-6">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}