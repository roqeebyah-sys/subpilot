'use client'

import { useState } from 'react'

type Insight = {
  subscriberId: string
  name: string
  email: string
  score: number
  label: string
  reason: string
  predictedChurnWindow: string
  emailSubject: string
  emailBody: string
  talkingPoints: string[]
}

type InsightsData = {
  success: boolean
  summary: string
  topPriority: string
  opportunities: string[]
  insights: Insight[]
  generatedAt: string
}

const labelColors: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/20',
  High: 'text-orange-400 bg-orange-500/20',
  Medium: 'text-amber-400 bg-amber-500/20',
}

function TrialLock({ action }: { action: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 text-center">
      <div className="text-2xl mb-3">🔒</div>
      <div className="text-sm font-semibold mb-1">Trial ended</div>
      <div className="text-xs text-white/40 mb-4">Upgrade to {action} and protect your MRR.</div>
      <a href="/billing" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-5 py-2 rounded-lg transition-colors">
        Upgrade now →
      </a>
    </div>
  )
}

export default function AIInsightsPanel({ trialExpired }: { trialExpired?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<InsightsData | null>(null)
  const [error, setError] = useState('')

  if (trialExpired) return <TrialLock action="generate AI insights" />
  const [activeInsight, setActiveInsight] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const res = await fetch('/api/insights', { method: 'POST' })
      const result = await res.json()

      if (!res.ok) {
        setError(result.details || 'Failed to generate insights. Try again.')
        return
      }

      setData(result)
    } catch (err) {
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyEmail = (insight: Insight) => {
    const full = `Subject: ${insight.emailSubject}\n\n${insight.emailBody}`
    navigator.clipboard.writeText(full)
    setCopied(insight.subscriberId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center text-xs">✦</div>
            <h2 className="text-sm font-semibold">AI insights</h2>
          </div>
          <p className="text-xs text-white/40">
            Claude analyses your subscribers and writes personalised win-back emails for anyone at risk.
          </p>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-4"
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Claude is thinking...
          </>
        ) : '✦ Generate AI insights →'}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mb-4">
          ⚠ {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">

          {/* Daily briefing */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-2">
              Today's briefing
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{data.summary}</p>
          </div>

          {/* Top priority */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-5 h-5 bg-amber-500/20 rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5">!</div>
            <div>
              <div className="text-xs font-medium text-amber-400 mb-0.5">Top priority</div>
              <div className="text-xs text-[#e8eaed]">{data.topPriority}</div>
            </div>
          </div>

          {/* Revenue opportunities */}
          {data.opportunities.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                Revenue opportunities
              </div>
              <div className="space-y-2">
                {data.opportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">↑</span>
                    <span className="text-xs text-[#e8eaed]">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Win-back emails */}
          {data.insights.length > 0 && (
            <div>
              <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                Personalised win-back emails — ready to send
              </div>
              <div className="space-y-3">
                {data.insights.map(insight => (
                  <div key={insight.subscriberId} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">

                    {/* Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02]"
                      onClick={() => setActiveInsight(activeInsight === insight.subscriberId ? null : insight.subscriberId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {insight.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-medium">{insight.name}</div>
                          <div className="text-xs text-[#e8eaed]">{insight.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${labelColors[insight.label] || 'text-white/40 bg-white/10'}`}>
                          {insight.score}/10
                        </span>
                        <span className="text-white/45 text-xs">
                          {activeInsight === insight.subscriberId ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Email content */}
                    {activeInsight === insight.subscriberId && (
                      <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3">

                        {/* Predicted window */}
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <span>⏱</span>
                          <span>Predicted to churn in <span className="text-[#e8eaed]">{insight.predictedChurnWindow}</span></span>
                        </div>

                        {/* Email preview */}
                        <div className="bg-[#111] border border-white/10 rounded-lg p-4">
                          <div className="text-xs text-[#e8eaed] mb-1">Subject</div>
                          <div className="text-xs font-medium text-white mb-3">{insight.emailSubject}</div>
                          <div className="text-xs text-[#e8eaed] mb-1">Body</div>
                          <div className="text-xs text-[#e8eaed] leading-relaxed whitespace-pre-line">
                            {insight.emailBody}
                          </div>
                        </div>

                        {/* Talking points */}
                        <div>
                          <div className="text-xs text-[#e8eaed] mb-2">If you call them instead:</div>
                          <div className="space-y-1">
                            {insight.talkingPoints.map((point, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-white/45 text-xs mt-0.5">·</span>
                                <span className="text-xs text-white/50">{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => copyEmail(insight)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold py-2 rounded-lg transition-colors"
                          >
                            {copied === insight.subscriberId ? '✓ Copied!' : 'Copy email'}
                          </button>
                          <a
                            href={`mailto:${insight.email}?subject=${encodeURIComponent(insight.emailSubject)}&body=${encodeURIComponent(insight.emailBody)}`}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 rounded-lg transition-colors text-center border border-white/10"
                          >
                            Open in mail →
                          </a>
                        </div>

                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No at-risk */}
          {data.insights.length === 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-sm font-medium text-emerald-400 mb-1">No subscribers need attention today</div>
              <div className="text-xs text-white/40">Run churn analysis first to identify at-risk subscribers</div>
            </div>
          )}

          <div className="text-xs text-white/45 text-right">
            Generated {new Date(data.generatedAt).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}