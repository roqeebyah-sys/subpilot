'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-semibold block mb-12">
          Sub<span className="text-emerald-400">Pilot</span>
        </Link>

        {sent ? (
          <div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-[#e8eaed] text-sm mb-8">
              If <span className="text-white font-medium">{email}</span> is linked to an account,
              you&apos;ll receive a reset link shortly. It expires in 1 hour.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
            <p className="text-[#e8eaed] text-sm mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </form>

            <p className="mt-6 text-sm text-white/40">
              Remembered it?{' '}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
                Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
