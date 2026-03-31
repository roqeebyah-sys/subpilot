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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-emerald-500' : 'bg-white/10'}`}
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

function DeleteModal({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const [typed, setTyped] = useState('')
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
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm font-mono mb-4 focus:outline-none focus:border-red-500/50"
        />
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={typed !== 'DELETE' || loading}
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

  // Profile form
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
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

  // Tax
  const [taxRate,    setTaxRate]   = useState(30)
  const [taxSaving,  setTaxSaving] = useState(false)
  const [taxSaved,   setTaxSaved]  = useState(false)

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
          setEmail(d.email)
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
      body: JSON.stringify({ name, email }),
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
    await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: { dailyBriefing, churnAlerts } }),
    })
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 3000)
    setNotifSaving(false)
  }

  async function saveTax() {
    setTaxSaving(true)
    setTaxSaved(false)
    await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taxRate }),
    })
    setTaxSaved(true)
    setTimeout(() => setTaxSaved(false), 3000)
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

  async function deleteAccount() {
    setDeleteLoading(true)
    const res = await fetch('/api/account', { method: 'DELETE' })
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
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Top bar */}
      <header className="h-[60px] border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-xs flex items-center gap-1.5">
            ← Dashboard
          </Link>
        </div>
        <Link href="/" className="text-[15px] font-semibold tracking-tight hover:opacity-75 transition-opacity">
          User<span className="text-emerald-400">Retain</span>
        </Link>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-5">

        <div className="mb-8">
          <h1 className="text-xl font-bold mb-1">Account settings</h1>
          <p className="text-xs text-white/40">
            Member since {profile ? new Date(profile.memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>

        {/* ── PROFILE ── */}
        <Card title="Profile">
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>
            {profileError && <p className="text-xs text-red-400">{profileError}</p>}
            <SaveButton loading={profileSaving} saved={profileSaved} onClick={saveProfile} />
          </div>
        </Card>

        {/* ── PASSWORD ── */}
        <Card title="Change password">
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
        </Card>

        {/* ── CONNECTED PLATFORMS ── */}
        <Card title="Connected platforms">
          <div className="space-y-3">
            {/* Stripe */}
            <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
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
        </Card>

        {/* ── SUBSCRIPTION & BILLING ── */}
        <Card title="Subscription and billing">
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
        </Card>

        {/* ── NOTIFICATIONS ── */}
        <Card title="Notifications">
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
            <SaveButton loading={notifSaving} saved={notifSaved} onClick={saveNotifications} />
          </div>
        </Card>

        {/* ── TAX SETTINGS ── */}
        <Card title="Tax settings">
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
            <SaveButton loading={taxSaving} saved={taxSaved} onClick={saveTax} />
          </div>
        </Card>

        {/* ── DANGER ZONE ── */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-500/10">
            <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
          </div>
          <div className="px-6 py-5 flex items-center justify-between gap-4">
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
        </div>

      </main>

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
