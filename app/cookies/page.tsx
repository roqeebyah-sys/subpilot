import Link from 'next/link'

export const metadata = { title: 'Cookie Policy – SubPilot' }

const LAST_UPDATED = 'March 29, 2026'
const CONTACT_EMAIL = 'support@subpilot.io'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            Sub<span className="text-emerald-400">Pilot</span>
          </Link>
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">Cookie Policy</h1>
          <p className="text-sm text-white/40">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-[#e8eaed] leading-relaxed">

          <section>
            <p>
              This page explains what cookies SubPilot uses, why, and how to control them. We keep
              it minimal — we only use cookies that are necessary to run the product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">1. What are cookies?</h2>
            <p>
              Cookies are small text files stored in your browser when you visit a website. They
              help keep you logged in, remember your preferences, and understand how the site is
              being used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">2. Cookies we use</h2>
            <div className="overflow-hidden border border-white/[0.06] rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-white/60 font-medium">Cookie</th>
                    <th className="text-left px-4 py-3 text-white/60 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-white/60 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    {
                      name: 'next-auth.session-token',
                      type: 'Essential',
                      purpose: 'Keeps you logged in. Without this cookie SubPilot cannot function.',
                    },
                    {
                      name: 'next-auth.csrf-token',
                      type: 'Essential',
                      purpose: 'Protects against cross-site request forgery attacks.',
                    },
                    {
                      name: 'next-auth.callback-url',
                      type: 'Essential',
                      purpose: 'Remembers where to redirect you after login.',
                    },
                    {
                      name: '__stripe_mid / __stripe_sid',
                      type: 'Essential',
                      purpose: 'Set by Stripe to prevent fraud during payment processing.',
                    },
                  ].map((row) => (
                    <tr key={row.name}>
                      <td className="px-4 py-3 font-mono text-xs text-white/80 align-top">{row.name}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.type === 'Essential'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/5 text-white/50 border border-white/10'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs align-top">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-white/50">
              We do not use advertising, tracking, or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">3. Essential cookies</h2>
            <p>
              All cookies listed above are <strong className="text-white">essential</strong> —
              they are strictly necessary for SubPilot to work. Because of this, we
              don&apos;t ask for cookie consent for these (they&apos;re exempt under GDPR and
              similar regulations). They cannot be disabled without breaking the product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">4. Analytics</h2>
            <p>
              We currently do not run any third-party analytics (no Google Analytics, no Hotjar,
              no tracking pixels). If we add analytics in the future, we will update this policy
              and ask for your consent before setting any non-essential cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">5. How to manage cookies</h2>
            <p className="mb-3">
              You can control cookies through your browser settings. Here&apos;s how for the main
              browsers:
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                { browser: 'Chrome', path: 'Settings → Privacy and security → Cookies and other site data' },
                { browser: 'Firefox', path: 'Settings → Privacy & Security → Cookies and Site Data' },
                { browser: 'Safari', path: 'Preferences → Privacy → Manage Website Data' },
                { browser: 'Edge', path: 'Settings → Cookies and site permissions → Cookies and site data' },
              ].map(({ browser, path }) => (
                <li key={browser} className="flex gap-2">
                  <span className="text-white/40 flex-shrink-0 font-medium w-16">{browser}</span>
                  <span>{path}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/50">
              Note: blocking essential cookies will prevent SubPilot from working correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">6. Contact</h2>
            <p>
              Questions about our cookie usage? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:text-emerald-300">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span>© 2026 SubPilot. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
