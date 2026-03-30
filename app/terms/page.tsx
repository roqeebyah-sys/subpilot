import MarketingHeader from '@/app/components/marketing-header'
import MarketingFooter from '@/app/components/marketing-footer'

export const metadata = { title: 'Terms of Service – UserRetain' }

const LAST_UPDATED = 'March 29, 2026'
const CONTACT_EMAIL = 'support@userretain.io'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">

      <MarketingHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">

        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">Terms of Service</h1>
          <p className="text-sm text-white/40">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-[#e8eaed] leading-relaxed">

          <section>
            <p>
              By signing up for UserRetain you agree to these terms. If you don&apos;t agree, please
              don&apos;t use the service. These terms are written in plain English — if something
              is unclear, just email us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">1. What UserRetain is</h2>
            <p>
              UserRetain is a churn prediction and subscriber intelligence tool for SaaS businesses.
              It connects to Stripe or accepts CSV imports to analyse subscriber behaviour, score
              churn risk, and generate AI-powered win-back recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">2. Your account</h2>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                "You must be 18 or older to create an account.",
                "You're responsible for keeping your login credentials secure.",
                "You're responsible for all activity that happens under your account.",
                "One account per person or business. Don't share accounts.",
                "If you think your account has been compromised, email us immediately.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-white/30 flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">3. Plans and billing</h2>
            <div className="space-y-4 text-sm">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-white">Free trial</h3>
                <p className="text-white/60">
                  You can use UserRetain free for 14 days. No credit card required to start. At the
                  end of the trial, your account moves to a read-only state until you choose a plan.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-white">Paid plans</h3>
                <p className="text-white/60">
                  Paid plans are billed monthly or annually via Stripe. You can cancel anytime —
                  your access continues until the end of the billing period. We don&apos;t offer
                  partial-month refunds unless there&apos;s a service fault on our end.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-white">Price changes</h3>
                <p className="text-white/60">
                  We&apos;ll give you at least 30 days notice before changing the price of your
                  current plan. New pricing never applies mid-billing-cycle.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">4. Your data</h2>
            <p className="mb-3">
              You own your data. By importing subscriber data into UserRetain, you give us permission
              to process it in order to provide the service (calculate churn scores, generate AI
              insights, etc.).
            </p>
            <p className="mb-3">
              You represent that you have the right to import the subscriber data you upload — i.e.
              you collected it legally and your subscribers have consented where required by law
              (e.g. GDPR).
            </p>
            <p>
              When you close your account, we delete all your data within 30 days. You can
              export your subscriber data at any time from the dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">5. Acceptable use</h2>
            <p className="mb-3">Don&apos;t use UserRetain to:</p>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                "Upload data you don't have the right to use",
                'Spam or harass your subscribers',
                'Attempt to reverse-engineer or scrape the platform',
                'Resell or white-label UserRetain without a written agreement',
                'Violate any applicable laws or regulations',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400/60 flex-shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/60">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">6. AI-generated content</h2>
            <p className="mb-3">
              UserRetain uses Anthropic&apos;s Claude AI to generate churn predictions and win-back
              email suggestions. AI output is a recommendation, not a guarantee.
            </p>
            <p>
              You are responsible for reviewing any AI-generated emails before sending them to your
              customers. We are not liable for outcomes resulting from acting on AI suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">7. Stripe integration</h2>
            <p>
              When you connect Stripe, we access your subscriber data using read-only OAuth
              permissions. We do not store your Stripe secret key and cannot initiate charges on
              your behalf. All billing for UserRetain itself is processed separately via Stripe
              Checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">8. Uptime and availability</h2>
            <p className="mb-3">
              We aim for 99.9% uptime but don&apos;t formally guarantee it. Planned maintenance
              will be announced in advance where possible.
            </p>
            <p>
              UserRetain is provided &quot;as is&quot;. We&apos;re not liable for data loss, missed
              churn events, or business losses resulting from service downtime or inaccurate
              predictions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">9. Limitation of liability</h2>
            <p>
              Our total liability to you for any claim is limited to the amount you paid us in the
              three months preceding the claim. We are not liable for indirect, incidental, or
              consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">10. Termination</h2>
            <p className="mb-3">
              You can cancel your account at any time from the Billing page. We can suspend or
              terminate your account if you violate these terms, with or without notice depending
              on severity.
            </p>
            <p>
              On termination, your right to access UserRetain ends. We&apos;ll delete your data
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">11. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. For significant changes, we&apos;ll
              email you at least 14 days before they take effect. Continued use of UserRetain after
              that point means you accept the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">12. Contact</h2>
            <p>
              Questions about these terms? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:text-emerald-300">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

        </div>
      </main>

      <MarketingFooter />

    </div>
  )
}
