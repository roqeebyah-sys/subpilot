'use client'

import { useState } from 'react'

type SyncResult = {
  success: boolean
  synced: number
  errors: number
  metrics: {
    mrr: number
    activeSubscribers: number
    totalCharges: number
  }
}

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState('')

  const handleSync = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/stripe/sync', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }

      setResult(data)
    } catch (err) {
      setError('Could not connect. Check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full px-4">

      {/* Button — full width on mobile, auto on desktop */}
      <button
        onClick={handleSync}
        disabled={loading}
        className="w-full sm:w-auto bg-[#635bff] hover:bg-[#5851e6] disabled:opacity-50 text-white font-medium px-8 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Syncing your data...
          </>
        ) : (
          'Connect & sync Stripe →'
        )}
      </button>

      {/* Error state */}
      {error && (
        <div className="mt-4 w-full max-w-lg bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 text-center">
          ⚠ {error}
        </div>
      )}

      {/* Success state */}
      {result?.success && (
        <div className="mt-6 w-full max-w-lg space-y-4">

          {/* Success banner */}
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-black font-bold">✓</div>
            <div>
              <div className="text-sm font-medium text-emerald-400">Stripe connected successfully</div>
              <div className="text-xs text-white/40 mt-0.5">
                {result.synced} {result.synced === 1 ? 'subscriber' : 'subscribers'} imported from your Stripe account
              </div>
            </div>
          </div>

          {/* Metrics cards — stack on mobile, 3 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                ${result.metrics.mrr.toLocaleString()}
              </div>
              <div className="text-xs text-white/40">Monthly revenue</div>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {result.metrics.activeSubscribers}
              </div>
              <div className="text-xs text-white/40">Active subscribers</div>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {result.synced}
              </div>
              <div className="text-xs text-white/40">Records imported</div>
            </div>
          </div>

          {/* Next step */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="text-sm font-medium">Your dashboard is ready</div>
              <div className="text-xs text-white/40 mt-0.5">SubPilot is now watching your subscribers for churn risk</div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              View dashboard →
            </button>
          </div>

        </div>
      )}
    </div>
  )
}