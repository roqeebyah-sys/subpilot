'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import SyncButton from './sync-button'
import ChurnScoreButton from './churn-score-button'
import CSVUploadButton from './csv-upload-button'
import AIInsightsPanel from './ai-insights-panel'

type DashboardData = {
  metrics: {
    mrr: number
    activeSubscribers: number
    cancelledSubscribers: number
    pastDue: number
    churnRate: string
    arpu: string
    totalSubscribers: number
    atRiskCount: number
    revenueAtRisk: number
  }
  mrrHistory: { month: string; mrr: number }[]
  subscribers: {
    id: string
    name: string
    email: string
    plan: string
    amount: number
    status: string
    source: string
    startedAt: string
    lastActiveAt: string
    daysInactive: number | null
  }[]
  atRisk: {
    id: string
    name: string
    email: string
    amount: number
    plan: string
    daysInactive: number | null
  }[]
}

export default function DashboardClient({ session }: { session: any }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        if (!d.error) setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const initials = session?.user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* TOP BAR */}
      <div className="border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">
          Sub<span className="text-emerald-400">Pilot</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-white/40">{session?.user?.email}</span>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-medium text-emerald-400">
            {initials}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Good morning, {firstName} 👋</h1>
          <p className="text-white/40 text-sm">
            {data
              ? `Watching ${data.metrics.activeSubscribers} active subscribers for churn risk`
              : 'Connect Stripe to start tracking your subscribers'}
          </p>
        </div>

        {/* NO DATA STATE — show connect prompt */}
        {!loading && !data && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 md:p-12 text-center mb-8">
            <div className="w-14 h-14 bg-[#635bff]/10 border border-[#635bff]/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">💳</div>
            <h2 className="text-lg font-semibold mb-2">Connect your Stripe account</h2>
            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
              SubPilot needs read-only access to your Stripe data to track subscribers and detect churn risk.
            </p>
            <SyncButton />
            <p className="text-white/20 text-xs mt-4">Read-only access · We never touch your money</p>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 animate-pulse">
                <div className="h-3 bg-white/10 rounded mb-3 w-20" />
                <div className="h-7 bg-white/10 rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {/* DASHBOARD DATA */}
        {data && (
          <>
            {/* ALERT BANNER — show if there are at-risk subscribers */}
            {data.metrics.atRiskCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <div>
                    <span className="text-sm font-medium text-red-400">
                      {data.metrics.atRiskCount} {data.metrics.atRiskCount === 1 ? 'subscriber is' : 'subscribers are'} at risk of cancelling
                    </span>
                    <span className="text-xs text-white/40 ml-2">
                      ${data.metrics.revenueAtRisk}/mo at risk
                    </span>
                  </div>
                </div>
                <button className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors">
                  View at-risk subscribers ↓
                </button>
              </div>
            )}

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Monthly revenue', val: `$${data.metrics.mrr.toLocaleString()}`, sub: `$${data.metrics.arpu} per subscriber`, color: 'text-emerald-400' },
                { label: 'Active subscribers', val: data.metrics.activeSubscribers, sub: `${data.metrics.totalSubscribers} total`, color: 'text-white' },
                { label: 'Churn rate', val: `${data.metrics.churnRate}%`, sub: `${data.metrics.cancelledSubscribers} cancelled`, color: data.metrics.churnRate > '5.0' ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Past due', val: data.metrics.pastDue, sub: 'need payment retry', color: data.metrics.pastDue > 0 ? 'text-amber-400' : 'text-white' },
              ].map((m) => (
                <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                  <div className="text-xs text-white/40 mb-2">{m.label}</div>
                  <div className={`text-2xl font-bold mb-1 ${m.color}`}>{m.val}</div>
                  <div className="text-xs text-white/30">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* MRR CHART */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold">Revenue growth</h2>
                  <p className="text-xs text-white/40 mt-0.5">Monthly recurring revenue over the last 6 months</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.mrrHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(val: any) => [`$${val}`, 'MRR']}
                  />
                  <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">

              {/* AT RISK SUBSCRIBERS */}
              {data.atRisk.length > 0 && (
                <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <h2 className="text-sm font-semibold">At-risk subscribers</h2>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">{data.atRisk.length} at risk</span>
                  </div>
                  <div className="space-y-2">
                    {data.atRisk.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-medium flex-shrink-0">
                            {s.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium">{s.name}</div>
                            <div className="text-xs text-white/30">${s.amount}/mo</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-red-400 font-medium">
                            {s.daysInactive ? `${s.daysInactive}d inactive` : 'No activity'}
                          </div>
                          <div className="text-xs text-white/20">{s.plan}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECENT SUBSCRIBERS */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold">All subscribers</h2>
                  <span className="text-xs text-white/30">{data.metrics.totalSubscribers} total</span>
                </div>
                <div className="space-y-2">
                  {data.subscribers.slice(0, 8).map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-medium">{s.name}</div>
                          <div className="text-xs text-white/30">{s.email}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                          s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          s.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          s.status === 'past_due' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {s.status}
                        </div>
                        <div className="text-xs text-white/30 mt-0.5">${s.amount}/mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
{/* CSV UPLOAD */}
<CSVUploadButton />

{/* AI INSIGHTS */}
<AIInsightsPanel />
{/* CHURN ANALYSIS */}
{data && (
  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
    <div className="mb-4">
      <h2 className="text-sm font-semibold mb-1">Churn risk analysis</h2>
      <p className="text-xs text-white/40">Score every subscriber for churn risk based on activity, payment status, and tenure.</p>
    </div>
    <ChurnScoreButton />
  </div>
)}
            {/* SYNC BUTTON */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 text-center">
              <p className="text-xs text-white/30 mb-3">Last synced from Stripe · Refresh to get latest data</p>
              <SyncButton />
            </div>
          </>
        )}
      </div>
    </div>
  )
}