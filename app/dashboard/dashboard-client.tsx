'use client'
import AIPanel from './ai-panel'
import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'
import SyncButton from './sync-button'
import ChurnScoreButton from './churn-score-button'
import CSVUploadButton from './csv-upload-button'

const DEMO_MRR = [
  { month: 'Oct', mrr: 1200 },
  { month: 'Nov', mrr: 1850 },
  { month: 'Dec', mrr: 1600 },
  { month: 'Jan', mrr: 2400 },
  { month: 'Feb', mrr: 2100 },
  { month: 'Mar', mrr: 3200 },
]

function OnboardingChecklist({ onUpload }: { onUpload: () => void }) {
  const steps = [
    {
      num: 1,
      title: 'Import your subscribers',
      desc: 'Connect Stripe or upload a CSV to bring in your subscriber data.',
      done: false,
      action: (
        <div className="flex flex-wrap gap-2 mt-3">
          <SyncButton />
          <CSVUploadButton onUploaded={onUpload} />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Run churn analysis',
      desc: 'SubPilot scores every subscriber for churn risk based on activity and payment behaviour.',
      done: false,
      action: null,
    },
    {
      num: 3,
      title: 'See who is at risk and act',
      desc: 'Get a prioritised list of subscribers about to leave and send AI-generated win-back messages.',
      done: false,
      action: null,
    },
  ]

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-emerald-500/15 border border-emerald-500/25 rounded-lg flex items-center justify-center text-lg">🚀</div>
        <div>
          <h2 className="text-sm font-semibold">Get started in 3 steps</h2>
          <p className="text-xs text-white/40 mt-0.5">Takes about 60 seconds</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const isActive = i === 0
          return (
            <div key={step.num} className={`flex gap-4 p-4 rounded-xl border transition-all ${
              isActive
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-white/[0.02] border-white/5 opacity-50'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                step.done
                  ? 'bg-emerald-500 text-black'
                  : isActive
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-white/10 border border-white/10 text-white/30'
              }`}>
                {step.done ? '✓' : step.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>{step.title}</div>
                <div className="text-xs text-white/35 mt-0.5 leading-relaxed">{step.desc}</div>
                {isActive && step.action}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyMetricCard({ label }: { label: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/40 mb-3">{label}</div>
      <div className="text-lg font-semibold text-white/15 mb-1">—</div>
      <div className="text-xs text-white/25">Connect data to see metrics</div>
    </div>
  )
}

function DemoChart() {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <h2 className="text-sm font-semibold mb-1">Revenue growth</h2>
      <p className="text-xs text-white/40 mb-3">Monthly recurring revenue — last 6 months</p>
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DEMO_MRR}>
              <defs>
                <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} fill="url(#demoGrad)" dot={{ fill: '#10b981', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-xl px-5 py-3 text-center backdrop-blur-sm">
            <div className="text-sm font-semibold mb-1">Your MRR chart will appear here</div>
            <div className="text-xs text-white/40">Connect Stripe or import a CSV to unlock</div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

function CollapsibleList({ title, count, badge, badgeColor, children }: {
  title: string
  count: number
  badge?: string
  badgeColor?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{title}</span>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor || 'bg-white/10 text-white/40'}`}>{badge}</span>}
        </div>
        <div className="flex items-center gap-2 text-white/30">
          <span className="text-xs">{count} total</span>
          <span className="text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && <div className="border-t border-white/5 px-5 pb-3 pt-2">{children}</div>}
    </div>
  )
}

export default function DashboardClient({ session }: { session: any }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const d = await res.json()
      if (!d.error) setData(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const initials = session?.user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      <div className="border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">Sub<span className="text-emerald-400">Pilot</span></span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-white/40">{session?.user?.email}</span>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-medium text-emerald-400">{initials}</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">

        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1">Good morning, {firstName} 👋</h1>
          <p className="text-white/40 text-sm">
            {data ? `Watching ${data.metrics.activeSubscribers} active subscribers for churn risk` : 'Connect Stripe or upload a CSV to start tracking'}
          </p>
        </div>

        {!loading && !data && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center mb-4">
            <div className="w-14 h-14 bg-[#635bff]/10 border border-[#635bff]/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">💳</div>
            <h2 className="text-lg font-semibold mb-2">Connect your Stripe account</h2>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">SubPilot needs read-only access to your Stripe data to track subscribers and detect churn risk.</p>
            <SyncButton />
            <p className="text-white/20 text-xs mt-3">Read-only access · We never touch your money</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 animate-pulse">
                <div className="h-3 bg-white/10 rounded mb-3 w-20" />
                <div className="h-7 bg-white/10 rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {data && (
          <div className="space-y-3">

            {(() => {
              const isEmpty = data.metrics.totalSubscribers === 0
              return (
                <>
                  {!isEmpty && data.metrics.atRiskCount > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-red-400">
                        {data.metrics.atRiskCount} {data.metrics.atRiskCount === 1 ? 'subscriber is' : 'subscribers are'} at risk
                      </span>
                      <span className="text-xs text-white/40">${data.metrics.revenueAtRisk}/mo at risk</span>
                    </div>
                  )}

                  {/* Metric cards */}
                  {isEmpty ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Monthly revenue', 'Active subscribers', 'Churn rate', 'Past due'].map(label => (
                        <EmptyMetricCard key={label} label={label} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Monthly revenue', val: `$${data.metrics.mrr.toLocaleString()}`, sub: `$${data.metrics.arpu} per subscriber`, color: 'text-emerald-400' },
                        { label: 'Active subscribers', val: data.metrics.activeSubscribers, sub: `${data.metrics.totalSubscribers} total`, color: 'text-white' },
                        { label: 'Churn rate', val: `${data.metrics.churnRate}%`, sub: `${data.metrics.cancelledSubscribers} cancelled`, color: parseFloat(data.metrics.churnRate) > 5 ? 'text-red-400' : 'text-emerald-400' },
                        { label: 'Past due', val: data.metrics.pastDue, sub: 'need payment retry', color: data.metrics.pastDue > 0 ? 'text-amber-400' : 'text-white' },
                      ].map((m) => (
                        <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                          <div className="text-xs text-white/40 mb-2">{m.label}</div>
                          <div className={`text-2xl font-bold mb-1 ${m.color}`}>{m.val}</div>
                          <div className="text-xs text-white/30">{m.sub}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hero empty state OR at-risk alert is already shown above; show onboarding checklist */}
                  {isEmpty && <OnboardingChecklist onUpload={fetchData} />}

                  {/* Revenue chart */}
                  {isEmpty ? <DemoChart /> : (
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                      <h2 className="text-sm font-semibold mb-1">Revenue growth</h2>
                      <p className="text-xs text-white/40 mb-3">Monthly recurring revenue — last 6 months</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data.mrrHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                          <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={(val: any) => [`$${val}`, 'MRR']} />
                          <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* AI Panel */}
                  <AIPanel userName={firstName} isEmpty={isEmpty} />

                  {!isEmpty && (
                    <>
                      <CollapsibleList title="Churn risk analysis" count={data.metrics.activeSubscribers} badge="Run analysis" badgeColor="bg-emerald-500/20 text-emerald-400">
                        <p className="text-xs text-white/40 mb-3">Score every subscriber based on activity, payment status, and tenure.</p>
                        <ChurnScoreButton />
                      </CollapsibleList>

                      {data.atRisk.length > 0 && (
                        <CollapsibleList title="At-risk subscribers" count={data.atRisk.length} badge={`${data.atRisk.length} at risk`} badgeColor="bg-red-500/20 text-red-400">
                          <div className="space-y-2 mt-2">
                            {data.atRisk.map(s => (
                              <div key={s.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-medium flex-shrink-0">{s.name[0]?.toUpperCase()}</div>
                                  <div>
                                    <div className="text-xs font-medium">{s.name}</div>
                                    <div className="text-xs text-white/30">${s.amount}/mo</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-red-400 font-medium">{s.daysInactive ? `${s.daysInactive}d inactive` : 'No activity'}</div>
                                  <div className="text-xs text-white/20">{s.plan}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleList>
                      )}

                      <CollapsibleList title="All subscribers" count={data.metrics.totalSubscribers}>
                        <div className="space-y-2 mt-2">
                          {data.subscribers.map(s => (
                            <div key={s.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium flex-shrink-0">{s.name[0]?.toUpperCase()}</div>
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
                                }`}>{s.status}</div>
                                <div className="text-xs text-white/30 mt-0.5">${s.amount}/mo</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleList>

                      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-xs text-white/30 mb-3">Sync latest data from Stripe</p>
                        <SyncButton />
                      </div>
                    </>
                  )}
                </>
              )
            })()}

          </div>
        )}
      </div>
    </div>
  )
}