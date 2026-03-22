import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SyncButton from './sync-button'


// This is a Server Component — it runs on the server, not the browser
// That means we can check the session before the page even loads
export default async function DashboardPage() {
  const session = await auth()

  // If no session exists, kick them to the login page
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* TOP BAR */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">
          Sub<span className="text-emerald-400">Pilot</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40">
            {session.user?.email}
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-medium text-emerald-400">
            {session.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* WELCOME */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-1">
            Good morning, {session.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/40 text-sm">
            Connect your Stripe account to start tracking your subscribers.
          </p>
        </div>

        {/* CONNECT STRIPE CTA */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 mb-8 text-center">
          <div className="w-14 h-14 bg-[#635bff]/10 border border-[#635bff]/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
            💳
          </div>
          <h2 className="text-lg font-semibold mb-2">Connect your Stripe account</h2>
          <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
            SubPilot needs read-only access to your Stripe data to track subscribers,
            detect churn risk, and surface revenue opportunities.
          </p>
          <SyncButton />
          <p className="text-white/20 text-xs mt-3">Read-only access · We never touch your money</p>
        </div>

        {/* PREVIEW METRICS — locked until Stripe connected */}
        <div className="grid grid-cols-4 gap-4 mb-8 opacity-40 pointer-events-none select-none">
          {[
            { label: 'MRR', val: '—' },
            { label: 'Active subscribers', val: '—' },
            { label: 'Churn rate', val: '—' },
            { label: 'Revenue at risk', val: '—' },
          ].map((m) => (
            <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <div className="text-xs text-white/40 mb-2">{m.label}</div>
              <div className="text-2xl font-bold">{m.val}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-white/20 text-xs -mt-4 mb-8">
          Connect Stripe to unlock your dashboard
        </p>

        {/* PLAN BADGE */}
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-xl px-6 py-4">
          <div>
            <div className="text-sm font-medium capitalize">
              {(session.user as any)?.plan || 'starter'} plan
            </div>
            <div className="text-xs text-white/30 mt-0.5">
              14-day free trial active
            </div>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            Upgrade plan
          </button>
        </div>
      </div>
    </div>
  )
}