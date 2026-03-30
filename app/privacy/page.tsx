import Link from 'next/link'
import MarketingHeader from '@/app/components/marketing-header'
import MarketingFooter from '@/app/components/marketing-footer'

export const metadata = { title: 'Privacy Policy – UserRetain' }

const LAST_UPDATED = 'March 29, 2026'
const CONTACT_EMAIL = 'support@userretain.io'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">

      <MarketingHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">

        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-sm text-white/40">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-[#e8eaed] leading-relaxed">

          <section>
            <p>
              UserRetain (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a SaaS churn prediction tool. This
              policy explains what data we collect, how we use it, and what rights you have. We
              keep it plain English — no legal tricks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">1. What we collect</h2>
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Account data</h3>
                <p className="text-sm text-white/60">
                  Your name, email address, and hashed password when you create an account.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Subscriber data</h3>
                <p className="text-sm text-white/60">
                  Data about your customers that you import or sync — names, emails, subscription
                  amounts, and activity dates. This data belongs to you. We process it on your behalf
                  to calculate churn scores and generate AI insights.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Usage data</h3>
                <p className="text-sm text-white/60">
                  Standard web server logs — your IP address, browser type, pages visited, and
                  timestamps. We use this to keep the service running and fix issues.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Payment data</h3>
                <p className="text-sm text-white/60">
                  We use <strong className="text-white">Stripe</strong> to handle all billing. We
                  never see or store your full card number — Stripe handles that. We store your
                  Stripe customer ID and subscription status so we know which plan you&apos;re on.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">2. How we store your data</h2>
            <p className="mb-3">
              All data is stored in <strong className="text-white">MongoDB Atlas</strong>, a
              cloud-hosted database with encryption at rest and in transit. We follow
              industry-standard security practices including access controls and regular backups.
            </p>
            <p>
              We do not sell your data, ever. We do not share it with third parties except the
              sub-processors listed in section 4.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">3. How we use your data</h2>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                'To run the UserRetain service and provide you with churn predictions',
                'To generate AI-powered insights and win-back email suggestions',
                'To send you product updates and alerts you opt into',
                'To process your subscription payments via Stripe',
                'To diagnose bugs and improve the product',
                'To comply with legal obligations',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">4. Third-party sub-processors</h2>
            <p className="mb-4 text-sm text-white/60">
              We use the following services to run UserRetain. Each has their own privacy policy.
            </p>
            <div className="overflow-hidden border border-white/[0.06] rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-white/60 font-medium">Service</th>
                    <th className="text-left px-4 py-3 text-white/60 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ['Stripe', 'Payment processing and billing'],
                    ['Anthropic Claude', 'AI-powered churn analysis and win-back email generation'],
                    ['MongoDB Atlas', 'Database storage'],
                    ['Vercel', 'App hosting and deployment'],
                    ['Resend', 'Transactional emails (alerts, briefings)'],
                  ].map(([service, purpose]) => (
                    <tr key={service}>
                      <td className="px-4 py-3 text-white font-medium">{service}</td>
                      <td className="px-4 py-3 text-white/60">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">5. AI processing</h2>
            <p className="mb-3">
              UserRetain uses <strong className="text-white">Anthropic Claude</strong> to generate
              churn insights and win-back email suggestions. When you run AI analysis, anonymised
              subscriber data (activity patterns, subscription tenure, payment status) is sent to
              Anthropic&apos;s API to generate predictions.
            </p>
            <p>
              We do not send personally identifiable information (PII) like full names or email
              addresses to Anthropic. Anthropic does not use API data to train their models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">6. Stripe integration</h2>
            <p>
              When you connect Stripe, we use read-only OAuth access to sync your subscriber list.
              We never store your Stripe secret key. We can only read customer and subscription
              data — we cannot make charges or modify your Stripe account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">7. Your rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                'Access the personal data we hold about you',
                'Correct inaccurate data',
                'Delete your account and all associated data',
                'Export your subscriber data at any time',
                'Opt out of non-essential emails',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/60">
              To exercise any of these rights, email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:text-emerald-300">
                {CONTACT_EMAIL}
              </a>
              . We&apos;ll respond within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">8. Data retention</h2>
            <p>
              We keep your data for as long as your account is active. If you delete your account,
              we delete all your data within 30 days, except where we&apos;re required by law to
              retain it (e.g. billing records for tax purposes — kept for 7 years).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">9. Cookies</h2>
            <p>
              We use cookies for authentication and basic analytics. See our{' '}
              <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300">
                Cookie Policy
              </Link>{' '}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">10. Changes to this policy</h2>
            <p>
              If we make significant changes, we&apos;ll notify you by email before they take
              effect. The &quot;Last updated&quot; date at the top of this page will always reflect
              the most recent version.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">11. Contact us</h2>
            <p>
              Questions? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:text-emerald-300">
                {CONTACT_EMAIL}
              </a>
              . We&apos;re happy to help.
            </p>
          </section>

        </div>
      </main>

      <MarketingFooter />

    </div>
  )
}
