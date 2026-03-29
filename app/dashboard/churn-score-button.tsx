'use client'

import { useState } from 'react'

type ChurnFactors = {
  activity: number
  payment: number
  tenure: number
  value: number
}

type SubscriberResult = {
  id: string
  name: string
  email: string
  amount: number
  plan: string
  score: number
  label: 'Low' | 'Medium' | 'High' | 'Critical'
  factors: ChurnFactors
  reason: string
  predictedChurnWindow: string
}

type ScoreResult = {
  success: boolean
  scored: number
  critical: number
  high: number
  medium: number
  low: number
  results: SubscriberResult[]
}

const cfg = {
  Critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  High:     { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
  Medium:   { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
  Low:      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
}

function FactorBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  const color = value >= 7 ? 'bg-red-400' : value >= 4 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#e8eaed] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/40 w-6 text-right">{value}</span>
    </div>
  )
}

export default function ChurnScoreButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleScore = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/churn/score', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const actionSubscribers = result?.results.filter(r => r.label !== 'Low') || []

  return (
    <div className="w-full">
      <button
        onClick={handleScore}
        disabled={loading}
        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Analysing your subscribers...
          </>
        ) : '✦ Run churn analysis →'}
      </button>

      {result?.success && (
        <div className="mt-5 space-y-4">

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Act now', count: result.critical, key: 'Critical' },
              { label: 'Check in', count: result.high, key: 'High' },
              { label: 'Monitor', count: result.medium, key: 'Medium' },
              { label: 'Healthy', count: result.low, key: 'Low' },
            ].map(r => {
              const c = cfg[r.key as keyof typeof cfg]
              return (
                <div key={r.label} className={`border rounded-xl p-3 text-center ${c.bg} ${c.border}`}>
                  <div className={`text-2xl font-bold ${c.text}`}>{r.count}</div>
                  <div className="text-xs text-white/40 mt-0.5">{r.label}</div>
                </div>
              )
            })}
          </div>

          {/* Action list */}
          {actionSubscribers.length > 0 && (
            <div>
              <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                Who to act on right now
              </div>
              <div className="space-y-3">
                {actionSubscribers.map(r => {
                  const c = cfg[r.label]
                  const isOpen = expanded === r.id
                  return (
                    <div key={r.id} className={`border rounded-xl overflow-hidden ${c.bg} ${c.border}`}>

                      {/* Header row */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${c.badge}`}>
                            {r.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{r.name}</div>
                            <div className="text-xs text-[#e8eaed]">{r.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-full text-center ${c.badge}`}>
                              {r.score}/10
                            </div>
                            <div className={`text-xs mt-1 text-center ${c.text}`}>{r.label}</div>
                          </div>
                          <span className="text-white/45 text-xs">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">

                          {/* Factor breakdown */}
                          <div className="space-y-2">
                            <div className="text-xs text-[#e8eaed] mb-2">Risk breakdown</div>
                            <FactorBar label="Activity" value={r.factors.activity} />
                            <FactorBar label="Payment" value={r.factors.payment} />
                            <FactorBar label="Tenure" value={r.factors.tenure} />
                            <FactorBar label="Plan value" value={r.factors.value} />
                          </div>

                          {/* Predicted window */}
                          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                            <span className="text-xs text-white/40">Predicted churn</span>
                            <span className={`text-xs font-medium ${c.text}`}>{r.predictedChurnWindow}</span>
                          </div>

                          {/* Revenue + action */}
                          <div className={`rounded-lg px-3 py-2.5 border ${c.bg} ${c.border}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-[#e8eaed]">{r.plan || 'Unknown plan'}</span>
                              <span className={`text-xs font-semibold ${c.text}`}>${r.amount}/mo at risk</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className={`text-xs flex-shrink-0 mt-0.5 ${c.text}`}>→</span>
                              <span className="text-xs text-[#e8eaed] leading-relaxed">
                                <span className="font-medium text-white">What to do: </span>
                                {r.label === 'Critical'
                                  ? 'Contact them personally today. Every day you wait reduces recovery odds by ~15%.'
                                  : r.label === 'High'
                                  ? 'Send a personalised check-in email this week. Ask how they\'re getting on.'
                                  : 'Send a helpful tip or re-engagement offer. Keep them warm.'}
                              </span>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* All healthy */}
          {actionSubscribers.length === 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm font-medium text-emerald-400">All subscribers look healthy</div>
              <div className="text-xs text-white/40 mt-1">No action needed — check back tomorrow</div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}