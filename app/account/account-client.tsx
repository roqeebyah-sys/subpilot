'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

type Profile = {
  name: string
  email: string
  plan: string
  stripeCustomerId: string | null
  stripeConnected: boolean
  stripeConnectedAt: string | null
  taxRate: number
  notifications: { dailyBriefing: boolean; churnAlerts: boolean }
  memberSince: string
}

function Section({
  title,
  subtitle,
  open,
  onToggle,
  children,
  danger,
}: {
  title: string
  subtitle?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div className={`border rounded-xl overflow-hidden ${danger ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/[0.08]'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div>
          <div className={`text-sm font-semibold ${danger ? 'text-red-400' : ''}`}>{title}</div>
          {subtitle && <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>}
        </div>
        <svg
          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className={`px-6 py-5 border-t ${danger ? 'border-red-500/10' : 'border-white/[0.06]'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative rounded-full transition-colors flex-shrink-0 ${on ? 'bg-emerald-500' : 'bg-white/10'}`}
      style={{ height: '22px', width: '40px' }}
    >
      <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </button>
  )
}

function SaveButton({ loading, saved, onClick }: { loading: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-semibold px-5 py-2 rounded-lg transition-colors"
    >
      {loading ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
    </button>
  )
}

function DeleteModal({ onConfirm, onCancel, loading }: { onConfirm: (password: string) => void; onCancel: () => void; loading: boolean }) {
  const [typed,    setTyped]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  async function handleConfirm() {
    if (typed !== 'DELETE') return
    if (!password) { setError('Password required'); return }
    setError('')
    onConfirm(password)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-base font-bold text-red-400 mb-2">Delete account</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-4">
          This will permanently delete your account and all subscriber data. This cannot be undone.
        </p>
        <p className="text-xs text-white/40 mb-2">Type <span className="text-white font-mono">DELETE</span> to confirm:</p>
        <input
          type="text"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder="DELETE"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm font-mono mb-3 focus:outline-none focus:border-red-500/50"
        />
        <p className="text-xs text-white/40 mb-2">Enter your password:</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-red-500/50"
        />
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={typed !== 'DELETE' || !password || loading}
            className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Deleting…' : 'Delete my account'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AccountClient({ session }: { session: any }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Open state for each section
  const [openSection, setOpenSection] = useState<string | null>('profile')
  function toggle(id: string) {
    setOpenSection(o => o === id ? null : id)
  }

  // Profile form
  const [name, setName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved,  setProfileSaved]  = useState(false)
  const [profileError,  setProfileError]  = useState('')

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [pwSaving,  setPwSaving]  = useState(false)
  const [pwSaved,   setPwSaved]   = useState(false)
  const [pwError,   setPwError]   = useState('')

  // Notifications
  const [dailyBriefing, setDailyBriefing] = useState(true)
  const [churnAlerts,   setChurnAlerts]   = useState(true)
  const [notifSaving,   setNotifSaving]   = useState(false)
  const [notifSaved,    setNotifSaved]    = useState(false)
  const [notifError,    setNotifError]    = useState('')

  // Tax
  const [taxRate,   setTaxRate]   = useState(30)
  const [taxSaving, setTaxSaving] = useState(false)
  const [taxSaved,  setTaxSaved]  = useState(false)
  const [taxError,  setTaxError]  = useState('')

  // Billing portal
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError,   setPortalError]   = useState('')

  // Delete
  const [showDelete,    setShowDelete]    = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetch('/api/account/profile')
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setProfile(d)
          setName(d.name)
          setDailyBriefing(d.notifications.dailyBriefing)
          setChurnAlerts(d.notifications.churnAlerts)
          setTaxRate(d.taxRate)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function saveProfile() {
    setProfileSaving(true)
    setProfileError('')
    setProfileSaved(false)
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const d = await res.json()
    if (d.error) setProfileError(d.error)
    else { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000) }
    setProfileSaving(false)
  }

  async function savePassword() {
    setPwSaving(true)
    setPwError('')
    setPwSaved(false)
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const d = await res.json()
    if (d.error) setPwError(d.error)
    else { setPwSaved(true); setCurrentPw(''); setNewPw(''); setTimeout(() => setPwSaved(false), 3000) }
    setPwSaving(false)
  }

  async function saveNotifications() {
    setNotifSaving(true)
    setNotifSaved(false)
    setNotifError('')
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: { dailyBriefing, churnAlerts } }),
      })
      const d = await res.json()
      if (d.error) setNotifError(d.error)
      else { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 3000) }
    } catch { setNotifError('Failed to save') }
    setNotifSaving(false)
  }

  async function saveTax() {
    setTaxSaving(true)
    setTaxSaved(false)
    setTaxError('')
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxRate }),
      })
      const d = await res.json()
      if (d.error) setTaxError(d.error)
      else { setTaxSaved(true); setTimeout(() => setTaxSaved(false), 3000) }
    } catch { setTaxError('Failed to save') }
    setTaxSaving(false)
  }

  async function openPortal() {
    setPortalLoading(true)
    setPortalError('')
    const res = await fetch('/api/billing/portal')
    const d   = await res.json()
    if (d.url) window.location.href = d.url
    else setPortalError(d.error || 'Failed to open billing portal')
    setPortalLoading(false)
  }

  async function deleteAccount(password: string) {
    setDeleteLoading(true)
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      setDeleteLoading(false)
      setShowDelete(false)
    }
  }

  const planLabel = profile?.plan === 'pro' ? 'Pro' : profile?.plan === 'growth' ? 'Growth' : 'Starter'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-[220px] border-r border-white/[0.06] flex-shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 h-[60px] flex items-center border-b border-white/[0.06]">
          <Link href="/" className="text-[15px] font-semibold tracking-tight hover:opacity-75 transition-opacity">
            Sub<span className="text-emerald-400">Pilot</span>
          </Link>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: '⊞', label: 'Overview',    href: '/dashboard' },
            { icon: '◧', label: 'Subscribers', href: '/dashboard' },
            { icon: '✦', label: 'Tools',       href: '/dashboard' },
            { icon: '◈', label: 'Billing',     href: '/billing' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e8eaed] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <span className="opacity-60 text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white/[0.08] text-white">
            <span className="opacity-60 text-xs">◉</span>
            Account
          </div>
        </nav>
        {/* User */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{session?.user?.name || 'User'}</div>
              <div className="text-[10px] text-white/50 truncate">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 min-w-0">

      {/* Mobile top bar */}
      <header className="lg:hidden h-[60px] border-b border-white/[0.06] px-4 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
        <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-xs flex items-center gap-1.5">
          ← Dashboard
        </Link>
        <Link href="/" className="text-[15px] font-semibold tracking-tight hover:opacity-75 transition-opacity">
          Sub<span className="text-emerald-400">Pilot</span>
        </Link>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-3">

        <div className="mb-8">
          <h1 className="text-xl font-bold mb-1">Account settings</h1>
          <p className="text-xs text-white/40">
            Member since {profile ? new Date(profile.memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>

        {/* ── PROFILE ── */}
        <Section
          title="Profile"
          subtitle={profile?.name || 'Edit your name'}
          open={openSection === 'profile'}
          onToggle={() => toggle('profile')}
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  readOnly
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2.5 text-sm text-white/40 cursor-not-allowed select-none"
                />
                <p className="text-[10px] text-white/25 mt-1">Email cannot be changed</p>
              </div>
            </div>
            {profileError && <p className="text-xs text-red-400">{profileError}</p>}
            <SaveButton loading={profileSaving} saved={profileSaved} onClick={saveProfile} />
          </div>
        </Section>

        {/* ── PASSWORD ── */}
        <Section
          title="Change password"
          subtitle="Update your login password"
          open={openSection === 'password'}
          onToggle={() => toggle('password')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Current password</label>
              <input
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Your current password"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">New password</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            {pwError && <p className="text-xs text-red-400">{pwError}</p>}
            <SaveButton loading={pwSaving} saved={pwSaved} onClick={savePassword} />
          </div>
        </Section>

        {/* ── CONNECTED PLATFORMS ── */}
        <Section
          title="Connected platforms"
          subtitle="Stripe, CSV import"
          open={openSection === 'platforms'}
          onToggle={() => toggle('platforms')}
        >
          <div className="space-y-0 divide-y divide-white/[0.05]">
            {/* Stripe */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#635bff]/20 flex items-center justify-center text-xs font-bold text-[#635bff]">S</div>
                <div>
                  <div className="text-sm font-medium">Stripe</div>
                  <div className="text-xs text-white/40">
                    {profile?.stripeConnected
                      ? `Connected · Last synced ${profile.stripeConnectedAt ? new Date(profile.stripeConnectedAt).toLocaleDateString() : 'recently'}`
                      : 'Not connected'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${profile?.stripeConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-white/30'}`}>
                  {profile?.stripeConnected ? 'Connected' : 'Not connected'}
                </span>
                <Link
                  href="/dashboard"
                  className="text-xs border border-white/[0.08] hover:border-white/20 text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {profile?.stripeConnected ? 'Manage' : 'Connect'}
                </Link>
              </div>
            </div>

            {/* CSV */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/40">CSV</div>
                <div>
                  <div className="text-sm font-medium">CSV import</div>
                  <div className="text-xs text-white/40">Manual subscriber upload</div>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="text-xs border border-white/[0.08] hover:border-white/20 text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Upload CSV
              </Link>
            </div>
          </div>
        </Section>

        {/* ── SUBSCRIPTION & BILLING ── */}
        <Section
          title="Subscription and billing"
          subtitle={`${planLabel} plan`}
          open={openSection === 'billing'}
          onToggle={() => toggle('billing')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{planLabel} plan</div>
                <div className="text-xs text-white/40 mt-0.5">
                  {profile?.stripeCustomerId ? 'Billing managed via Stripe' : 'No active subscription'}
                </div>
              </div>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-semibold capitalize">
                {planLabel}
              </span>
            </div>
            {portalError && <p className="text-xs text-red-400">{portalError}</p>}
            <div className="flex gap-3">
              <button
                onClick={openPortal}
                disabled={portalLoading || !profile?.stripeCustomerId}
                className="text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                {portalLoading ? 'Opening…' : 'Manage subscription →'}
              </button>
              <Link
                href="/billing"
                className="text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg transition-colors"
              >
                Upgrade plan →
              </Link>
            </div>
          </div>
        </Section>

        {/* ── NOTIFICATIONS ── */}
        <Section
          title="Notifications"
          subtitle="Email alerts and briefings"
          open={openSection === 'notifications'}
          onToggle={() => toggle('notifications')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Daily briefing email</div>
                <div className="text-xs text-white/40 mt-0.5">Receive your top 3 at-risk users every morning at 7 AM</div>
              </div>
              <Toggle on={dailyBriefing} onChange={setDailyBriefing} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Churn alert emails</div>
                <div className="text-xs text-white/40 mt-0.5">Get notified when a subscriber reaches critical risk</div>
              </div>
              <Toggle on={churnAlerts} onChange={setChurnAlerts} />
            </div>
            {notifError && <p className="text-xs text-red-400">{notifError}</p>}
            <SaveButton loading={notifSaving} saved={notifSaved} onClick={saveNotifications} />
          </div>
        </Section>

        {/* ── TAX SETTINGS ── */}
        <Section
          title="Tax settings"
          subtitle={`${taxRate}% set-aside rate`}
          open={openSection === 'tax'}
          onToggle={() => toggle('tax')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Tax set-aside rate (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                  className="w-24 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <span className="text-xs text-white/40">% of MRR to set aside each month</span>
              </div>
              <p className="text-xs text-white/30 mt-2">
                This updates the tax pot calculation on your dashboard. Default is 30%. Consult a tax professional for your actual rate.
              </p>
            </div>
            {taxError && <p className="text-xs text-red-400">{taxError}</p>}
            <SaveButton loading={taxSaving} saved={taxSaved} onClick={saveTax} />
          </div>
        </Section>

        {/* ── DANGER ZONE ── */}
        <Section
          title="Danger zone"
          subtitle="Delete your account permanently"
          open={openSection === 'danger'}
          onToggle={() => toggle('danger')}
          danger
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Delete account</div>
              <div className="text-xs text-white/40 mt-0.5">Permanently delete your account and all subscriber data. This cannot be undone.</div>
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="flex-shrink-0 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
            >
              Delete account
            </button>
          </div>
        </Section>

      </main>
      </div>{/* end flex-1 */}

      {showDelete && (
        <DeleteModal
          onConfirm={deleteAccount}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
