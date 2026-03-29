'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Invalid link</h1>
        <p className="text-[#e8eaed] text-sm mb-6">
          This reset link is missing or invalid.
        </p>
        <Link href="/auth/forgot-password" className="text-emerald-400 hover:text-emerald-300 text-sm">
          Request a new one →
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      // Password reset — auto sign in with new password
      // We don't have the email here, so redirect to login with a success message
      router.push('/auth/login?reset=success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
      <p className="text-[#e8eaed] text-sm mb-8">Must be at least 8 characters.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
            minLength={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Updating...' : 'Update password →'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-semibold block mb-12">
          Sub<span className="text-emerald-400">Pilot</span>
        </Link>
        <Suspense fallback={<div className="text-white/40 text-sm">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
