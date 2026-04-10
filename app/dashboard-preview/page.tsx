'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// ─── Mock data ────────────────────────────────────────────────────────────────

const SUBSCRIBERS = [
  { id: '1', name: 'Alex Morgan',    email: 'alex@acme.io',      plan: 'Pro',     amount: 9900, status: 'active',    churnScore: 9, daysInactive: 22 },
  { id: '2', name: 'Jamie Liu',      email: 'jamie@bloom.co',    plan: 'Growth',  amount: 4900, status: 'past_due',  churnScore: 8, daysInactive: 11 },
  { id: '3', name: 'Priya Nair',     email: 'priya@tidal.app',   plan: 'Starter', amount: 1900, status: 'active',    churnScore: 3, daysInactive: 2  },
  { id: '4', name: 'Marcus Webb',    email: 'marcus@forge.dev',  plan: 'Pro',     amount: 9900, status: 'active',    churnScore: 6, daysInactive: 8  },
  { id: '5', name: 'Sofia Reyes',    email: 'sofia@luna.io',     plan: 'Growth',  amount: 4900, status: 'cancelled', churnScore: 10, daysInactive: 40 },
  { id: '6', name: 'Daniel Park',    email: 'daniel@shift.co',   plan: 'Starter', amount: 1900, status: 'active',    churnScore: 2, daysInactive: 1  },
]

const AT_RISK = SUBSCRIBERS.filter(s => (s.churnScore ?? 0) >= 7)

const MRR_HISTORY = [
  { month: 'Nov', mrr: 2100 },
  { month: 'Dec', mrr: 3400 },
  { month: 'Jan', mrr: 4100 },
  { month: 'Feb', mrr: 5800 },
  { month: 'Mar', mrr: 6200 },
  { month: 'Apr', mrr: 7460 },
]

const MAX_MRR = Math.max(...MRR_HISTORY.map(d => d.mrr))

// ─── Tiny components ──────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; bg: string; label: string }> = {
    active:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
    cancelled: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Cancelled' },
    past_due:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Past due' },
  }
  const c = map[status] ?? { dot: 'bg-white/20', text: 'text-white/40', bg: 'bg-white/5', label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${c.text} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 9 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    score >= 7 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    score >= 5 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                 'bg-white/10 text-white/40 border-white/10'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {score}/10
    </span>
  )
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────

type Section = 'overview' | 'subscribers' | 'at-risk' | 'tools'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 'at-risk',
    label: 'At Risk',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
]

// ─── Overview section ─────────────────────────────────────────────────────────

function Overview() {
  return (
    <div className="space-y-8">

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'MRR',              value: '$7,460',  sub: '+12% this month',    up: true  },
          { label: 'Active subs',      value: '4',       sub: '1 past due',         up: null  },
          { label: 'Churn rate',       value: '2.8%',    sub: 'vs 4.1% last month', up: true  },
          { label: 'Revenue at risk',  value: '$1,480',  sub: '2 subscribers',      up: false },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 py-5">
            <div className="text-sm text-white/60 mb-3 font-medium">{m.label}</div>
            <div className="text-3xl font-bold tracking-tight">{m.value}</div>
            <div className={`text-sm mt-2 ${m.up === true ? 'text-emerald-400' : m.up === false ? 'text-red-400' : 'text-white/50'}`}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* MRR chart */}
      <div className="rounded-xl border border-white/[0.1] bg-white/[0.04] p-6">
        <div className="text-base font-semibold mb-6">MRR growth</div>
        <div className="flex items-end gap-3 h-40">
          {MRR_HISTORY.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-md transition-colors ${i === MRR_HISTORY.length - 1 ? 'bg-emerald-400' : 'bg-emerald-700 hover:bg-emerald-600'}`}
                style={{ height: `${(d.mrr / MAX_MRR) * 100}%`, minHeight: 4 }}
              />
              <span className="text-xs text-white/60 font-medium">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* At-risk snapshot */}
      <div className="rounded-xl border border-white/[0.1] bg-white/[0.04] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="text-base font-semibold">At-risk subscribers</div>
          <span className="text-sm text-white/50">{AT_RISK.length} flagged</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {AT_RISK.map(s => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {s.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-sm text-white/50">{s.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">{s.daysInactive}d inactive</span>
                <ScoreBadge score={s.churnScore} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ─── Subscribers section ──────────────────────────────────────────────────────

function Subscribers() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled' | 'past_due'>('all')

  const filtered = SUBSCRIBERS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
          {(['all', 'active', 'past_due', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {f === 'past_due' ? 'Past due' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-medium text-white/40 w-1/3">Subscriber</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/40 hidden md:table-cell">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/40">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/40 hidden lg:table-cell">Churn risk</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-white/40">MRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {s.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-white/40 truncate">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-white/60">{s.plan}</span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <ScoreBadge score={s.churnScore} />
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sm">
                  ${(s.amount / 100).toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-white/30">No subscribers match your filter</div>
        )}
      </div>
    </div>
  )
}

// ─── At-risk section ──────────────────────────────────────────────────────────

function AtRisk() {
  return (
    <div className="space-y-3">
      {AT_RISK.map(s => {
        const risk =
          s.churnScore >= 9 ? { label: 'Critical', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/[0.06]' } :
          s.churnScore >= 7 ? { label: 'High',     color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/[0.06]' } :
                              { label: 'Medium',   color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.06]' }

        return (
          <div key={s.id} className={`rounded-xl border ${risk.border} ${risk.bg} px-5 py-4`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {s.name[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-white/40">{s.email} · {s.plan}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScoreBadge score={s.churnScore} />
                <StatusPill status={s.status} />
              </div>
            </div>

            {/* Activity timeline */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Days inactive',    value: `${s.daysInactive}d` },
                { label: 'MRR',              value: `$${(s.amount / 100).toFixed(0)}` },
                { label: 'Predicted churn',  value: s.churnScore >= 9 ? '7–14 days' : '14–30 days' },
                { label: 'Risk level',       value: risk.label },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className={`text-sm font-medium ${item.label === 'Risk level' ? risk.color : ''}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="mt-4">
              <button className="text-xs font-medium text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors">
                Generate win-back email →
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tools section ────────────────────────────────────────────────────────────

function Tools() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        {
          title: 'Daily briefing',
          description: 'AI-generated summary of your most at-risk subscribers, sent to your inbox each morning.',
          action: 'Send today\'s briefing',
          icon: (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
            </svg>
          ),
        },
        {
          title: 'Churn alerts',
          description: 'Send immediate alerts when a subscriber\'s churn score crosses the critical threshold.',
          action: 'Send alerts now',
          icon: (
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          ),
        },
        {
          title: 'Import subscribers',
          description: 'Upload a CSV file to import subscribers from another platform or spreadsheet.',
          action: 'Upload CSV',
          icon: (
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          ),
        },
        {
          title: 'Recalculate scores',
          description: 'Force a re-run of the churn scoring model across all active subscribers.',
          action: 'Run now',
          icon: (
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          ),
        },
      ].map(tool => (
        <div key={tool.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
              {tool.icon}
            </div>
            <div>
              <div className="text-sm font-medium">{tool.title}</div>
              <div className="text-xs text-white/40 mt-1 leading-relaxed">{tool.description}</div>
            </div>
          </div>
          <button className="mt-auto w-full text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-4 py-2 rounded-lg transition-colors text-left">
            {tool.action} →
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── User menu ────────────────────────────────────────────────────────────────

type ThemeTokens = typeof SIDEBAR_THEMES[SidebarTheme]

function UserMenu({ theme: t }: { theme: ThemeTokens }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const menuItems = [
    {
      label: 'My profile',
      href: '/account',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      label: 'Toggle theme',
      shortcut: 'M',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ),
    },
    {
      label: 'Homepage',
      href: '/',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
    },
    {
      label: 'Onboarding',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 010 5.304m2.121-7.425a6.75 6.75 0 010 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 01-1.06-2.122m-1.061 4.243a6.75 6.75 0 01-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12z" />
        </svg>
      ),
    },
  ]

  return (
    <div ref={ref} className={`px-4 pt-4 pb-11 border-t relative ${t.userBorder}`}>
      {/* Dropdown — appears above */}
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#1a1a1a] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl z-50">
          {menuItems.map((item, i) => (
            item.href ? (
              <Link
                key={i}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/[0.06] transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/[0.06] transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
                {item.shortcut && (
                  <span className="ml-auto text-xs text-gray-500 bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          ))}
          <div className="border-t border-white/[0.08]">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/[0.06] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Log out
            </button>
          </div>
          {/* Email footer */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-t border-white/[0.08] bg-white/[0.03]">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">R</div>
            <span className="text-xs text-gray-500 truncate">roqeebyah@gmail.com</span>
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors group ${t.hoverBg}`}
      >
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          R
        </div>
        <div className="min-w-0 text-left">
          <div className={`text-sm font-semibold truncate ${t.userName}`}>roqeebyah</div>
          <div className={`text-xs truncate ${t.userEmail}`}>roqeebyah@gmail.com</div>
        </div>
        <svg className={`w-3.5 h-3.5 ml-auto flex-shrink-0 transition-colors ${t.userChevron}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
        </svg>
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SidebarTheme = 'white' | 'distinct' | 'blend'

const SIDEBAR_THEMES: Record<SidebarTheme, {
  label: string
  aside: string
  border: string
  workspaceName: string
  chevron: string
  chevronHover: string
  navActive: string
  navInactive: string
  navIconActive: string
  navIconInactive: string
  badge: string
  divider: string
  secondary: string
  userBorder: string
  userName: string
  userEmail: string
  userChevron: string
  hoverBg: string
}> = {
  white: {
    label: 'White',
    aside: 'bg-white border-r border-black/[0.08]',
    border: '',
    workspaceName: 'text-gray-900',
    chevron: 'text-gray-400',
    chevronHover: 'group-hover:text-gray-600',
    navActive: 'bg-gray-100 text-gray-900 font-semibold',
    navInactive: 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
    navIconActive: 'text-gray-700',
    navIconInactive: 'text-gray-400',
    badge: 'bg-orange-100 text-orange-600',
    divider: 'border-gray-100',
    secondary: 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
    userBorder: 'border-gray-100',
    userName: 'text-gray-900',
    userEmail: 'text-gray-400',
    userChevron: 'text-gray-300 group-hover:text-gray-500',
    hoverBg: 'hover:bg-gray-50',
  },
  distinct: {
    label: 'Dark distinct',
    aside: 'border-r border-white/[0.12]',
    border: '',
    workspaceName: 'text-white',
    chevron: 'text-white/30',
    chevronHover: 'group-hover:text-white/60',
    navActive: 'bg-white/[0.1] text-white font-semibold',
    navInactive: 'text-white/60 hover:text-white hover:bg-white/[0.06]',
    navIconActive: 'text-white',
    navIconInactive: 'text-white/35',
    badge: 'bg-orange-500/25 text-orange-400',
    divider: 'border-white/[0.08]',
    secondary: 'text-white/60 hover:text-white hover:bg-white/[0.06]',
    userBorder: 'border-white/[0.08]',
    userName: 'text-white',
    userEmail: 'text-white/40',
    userChevron: 'text-white/20 group-hover:text-white/50',
    hoverBg: 'hover:bg-white/[0.06]',
  },
  blend: {
    label: 'Dark blend',
    aside: 'border-r border-white/[0.06]',
    border: '',
    workspaceName: 'text-white/80',
    chevron: 'text-white/20',
    chevronHover: 'group-hover:text-white/40',
    navActive: 'bg-white/[0.06] text-white/90 font-medium',
    navInactive: 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
    navIconActive: 'text-white/70',
    navIconInactive: 'text-white/25',
    badge: 'bg-orange-500/20 text-orange-400/80',
    divider: 'border-white/[0.05]',
    secondary: 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
    userBorder: 'border-white/[0.05]',
    userName: 'text-white/70',
    userEmail: 'text-white/30',
    userChevron: 'text-white/15 group-hover:text-white/35',
    hoverBg: 'hover:bg-white/[0.04]',
  },
}

const SIDEBAR_BG: Record<SidebarTheme, string> = {
  white:    '#ffffff',
  distinct: '#1a1a1a',
  blend:    '#111111',
}

export default function DashboardPreview() {
  const [active, setActive]       = useState<Section>('overview')
  const [sidebar, setSidebar]     = useState<SidebarTheme>('white')

  const t = SIDEBAR_THEMES[sidebar]

  const sectionTitle: Record<Section, string> = {
    'overview':    'Overview',
    'subscribers': 'Subscribers',
    'at-risk':     'At Risk',
    'tools':       'Tools',
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f0f' }}>

      {/* ══ SIDEBAR ════════════════════════════════════════════════════════════ */}
      <aside
        className={`flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 transition-colors duration-300 ${t.aside}`}
        style={{ background: SIDEBAR_BG[sidebar] }}
      >
        {/* Workspace switcher — 44px top padding, 32px row, 16px gap below */}
        <div className="px-5 pt-11 pb-4">
          <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors group ${t.hoverBg}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className={`text-[15px] font-semibold flex-1 text-left ${t.workspaceName}`}>SubPilot</span>
            <svg className={`w-4 h-4 transition-colors ${t.chevron} ${t.chevronHover}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
            </svg>
          </button>
        </div>

        {/* Nav — 40px items, 4px gap between */}
        <nav className="flex-1 px-4 pb-2 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${
                active === item.id ? t.navActive : t.navInactive
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${active === item.id ? t.navIconActive : t.navIconInactive}`}>
                {item.icon}
              </span>
              {item.label}
              {item.id === 'at-risk' && (
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${t.badge}`}>
                  {AT_RISK.length}
                </span>
              )}
            </button>
          ))}

          {/* 24px section divider */}
          <div className={`mt-6 mb-2 border-t ${t.divider}`} />

          <Link href="/billing" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${t.secondary}`}>
            <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Billing
          </Link>

          <Link href="/account" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${t.secondary}`}>
            <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>

        {/* User — 48px row, 44px bottom clearance */}
        <UserMenu theme={t} />
      </aside>

      {/* ══ CONTENT ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col text-[#e8eaed]">

        {/* Utility bar */}
        <div className="flex items-center justify-between px-10 h-14 border-b border-white/[0.06] flex-shrink-0">
          {/* Theme switcher */}
          <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
            {(Object.keys(SIDEBAR_THEMES) as SidebarTheme[]).map(k => (
              <button
                key={k}
                onClick={() => setSidebar(k)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  sidebar === k
                    ? 'bg-white/[0.12] text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {SIDEBAR_THEMES[k].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/50 hover:text-white/90 transition-colors font-medium">Docs</a>
            <a href="#" className="text-sm text-white/50 hover:text-white/90 transition-colors font-medium">Help</a>
            <button className="text-sm font-semibold text-white/80 hover:text-white border border-white/[0.15] rounded-lg px-4 py-1.5 hover:bg-white/[0.06] transition-colors flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Feedback
            </button>
          </div>
        </div>

        {/* Page */}
        <main className="flex-1 px-10 py-10 max-w-5xl w-full">
          <h1 className="text-3xl font-bold mb-10">{sectionTitle[active]}</h1>

          {active === 'overview'    && <Overview />}
          {active === 'subscribers' && <Subscribers />}
          {active === 'at-risk'     && <AtRisk />}
          {active === 'tools'       && <Tools />}
        </main>
      </div>

    </div>
  )
}
