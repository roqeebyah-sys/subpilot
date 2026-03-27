import { Resend } from 'resend'

// Lazily initialised so the constructor doesn't run at build time
// when RESEND_API_KEY isn't present in the build environment.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// Sender address — must be a verified domain in Resend
// Falls back to onboarding@resend.dev for testing
const FROM = process.env.RESEND_FROM_EMAIL || 'SubPilot <onboarding@resend.dev>'

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type ChurnAlertPayload = {
  ownerEmail: string
  ownerName: string
  subscriber: {
    name: string
    email: string
    plan: string
    amount: number       // dollars
    churnScore: number
    label: string
    reason: string
    predictedChurnWindow: string
  }
  winBackEmail: {
    subject: string
    body: string
    talkingPoints: string[]
  }
}

export type BriefingEmailPayload = {
  ownerEmail: string
  ownerName: string
  metrics: {
    mrr: number
    activeSubscribers: number
    atRiskCount: number
    revenueAtRisk: number
    churnRate: string
  }
  briefingText: string
  topPriority: string
  topActions: {
    label: string
    description: string
    urgency: 'critical' | 'high' | 'medium'
  }[]
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 9) return '#ef4444'   // red-500
  if (score >= 7) return '#f97316'   // orange-500
  return '#eab308'                    // yellow-500
}

function scoreBar(score: number): string {
  const filled = Math.round(score)
  const empty = 10 - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

// ── CHURN ALERT EMAIL ─────────────────────────────────────────────────────────
// Sent to the account owner when a subscriber hits churn score 7+

export async function sendChurnAlertEmail(payload: ChurnAlertPayload) {
  const { ownerEmail, ownerName, subscriber, winBackEmail } = payload
  const color = scoreColor(subscriber.churnScore)
  const bar = scoreBar(subscriber.churnScore)

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Churn Alert — ${subscriber.name}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="padding-bottom:24px;">
              <span style="font-size:18px;font-weight:700;color:#ffffff;">
                Sub<span style="color:#34d399;">Pilot</span>
              </span>
            </td>
          </tr>

          <!-- ALERT BADGE -->
          <tr>
            <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px 32px;margin-bottom:20px;">
              <div style="display:inline-block;background:${color}22;border:1px solid ${color}44;border-radius:6px;padding:4px 12px;margin-bottom:16px;">
                <span style="color:${color};font-size:12px;font-weight:600;letter-spacing:0.05em;">⚠ CHURN ALERT — ${subscriber.label.toUpperCase()}</span>
              </div>

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
                ${subscriber.name} is at risk of cancelling
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;">
                Hi ${ownerName}, one of your subscribers needs attention right now.
              </p>

              <!-- SCORE CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size:12px;color:#666;margin-bottom:4px;">CHURN SCORE</div>
                          <div style="font-size:36px;font-weight:800;color:${color};">${subscriber.churnScore}<span style="font-size:18px;color:#444;">/10</span></div>
                          <div style="font-family:monospace;font-size:14px;color:${color};letter-spacing:2px;margin-top:4px;">${bar}</div>
                        </td>
                        <td align="right" style="vertical-align:top;">
                          <div style="font-size:12px;color:#666;margin-bottom:4px;">SUBSCRIBER</div>
                          <div style="font-size:14px;font-weight:600;color:#fff;">${subscriber.name}</div>
                          <div style="font-size:12px;color:#666;">${subscriber.email}</div>
                          <div style="font-size:12px;color:#666;margin-top:4px;">${subscriber.plan} · $${subscriber.amount}/mo</div>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2a2a2a;">
                      <div style="font-size:12px;color:#666;margin-bottom:4px;">WHY THIS SCORE</div>
                      <div style="font-size:13px;color:#aaa;">${subscriber.reason}</div>
                    </div>
                    <div style="margin-top:12px;">
                      <div style="font-size:12px;color:#666;margin-bottom:4px;">PREDICTED CHURN WINDOW</div>
                      <div style="font-size:13px;color:${color};font-weight:600;">${subscriber.predictedChurnWindow}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WIN-BACK EMAIL DRAFT -->
          <tr>
            <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px 32px;margin-top:16px;">
              <div style="font-size:12px;color:#34d399;font-weight:600;letter-spacing:0.05em;margin-bottom:16px;">✉ AI-GENERATED WIN-BACK EMAIL</div>
              <div style="font-size:13px;color:#666;margin-bottom:8px;">Subject:</div>
              <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:20px;">${winBackEmail.subject}</div>
              <div style="font-size:13px;color:#666;margin-bottom:8px;">Body:</div>
              <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-radius:8px;padding:16px;font-size:14px;color:#ccc;line-height:1.7;white-space:pre-wrap;">${winBackEmail.body}</div>

              ${winBackEmail.talkingPoints.length > 0 ? `
              <div style="margin-top:20px;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Talking points for a follow-up call:</div>
                <ul style="margin:0;padding-left:20px;">
                  ${winBackEmail.talkingPoints.map(p => `<li style="font-size:13px;color:#aaa;margin-bottom:6px;">${p}</li>`).join('')}
                </ul>
              </div>` : ''}

              <div style="margin-top:20px;">
                <a href="mailto:${subscriber.email}?subject=${encodeURIComponent(winBackEmail.subject)}&body=${encodeURIComponent(winBackEmail.body)}"
                   style="display:inline-block;background:#34d399;color:#0a0a0a;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;">
                  Send this email →
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="font-size:11px;color:#444;margin:0;">
                SubPilot · Automated churn alert · <a href="#" style="color:#444;">Manage notification settings</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return getResend().emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `⚠ Churn alert: ${subscriber.name} scored ${subscriber.churnScore}/10`,
    html,
  })
}

// ── DAILY BRIEFING EMAIL ──────────────────────────────────────────────────────
// Sent to the account owner with the morning business briefing

export async function sendBriefingEmail(payload: BriefingEmailPayload) {
  const { ownerEmail, ownerName, metrics, briefingText, topPriority, topActions } = payload

  const urgencyColor = (u: string) => {
    if (u === 'critical') return '#ef4444'
    if (u === 'high') return '#f97316'
    return '#eab308'
  }

  const urgencyBg = (u: string) => {
    if (u === 'critical') return '#ef444422'
    if (u === 'high') return '#f9731622'
    return '#eab30822'
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SubPilot Daily Briefing</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="padding-bottom:8px;">
              <span style="font-size:18px;font-weight:700;color:#ffffff;">
                Sub<span style="color:#34d399;">Pilot</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <span style="font-size:12px;color:#444;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </td>
          </tr>

          <!-- GREETING + BRIEFING -->
          <tr>
            <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px 32px;margin-bottom:16px;">
              <div style="font-size:12px;color:#34d399;font-weight:600;letter-spacing:0.05em;margin-bottom:12px;">📋 DAILY BRIEFING</div>
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#ffffff;">Good morning, ${ownerName}</h1>
              <p style="margin:0;font-size:15px;color:#ccc;line-height:1.7;">${briefingText}</p>
            </td>
          </tr>

          <!-- METRICS ROW -->
          <tr>
            <td style="padding-top:16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${[
                    { label: 'MRR', val: `$${metrics.mrr.toLocaleString()}`, color: '#34d399' },
                    { label: 'Active', val: metrics.activeSubscribers.toString(), color: '#fff' },
                    { label: 'At Risk', val: metrics.atRiskCount.toString(), color: metrics.atRiskCount > 0 ? '#f97316' : '#34d399' },
                    { label: 'Revenue at Risk', val: `$${metrics.revenueAtRisk}`, color: metrics.revenueAtRisk > 0 ? '#ef4444' : '#34d399' },
                  ].map(m => `
                  <td width="25%" style="padding-right:12px;">
                    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px 16px;">
                      <div style="font-size:11px;color:#555;margin-bottom:4px;">${m.label}</div>
                      <div style="font-size:20px;font-weight:700;color:${m.color};">${m.val}</div>
                    </div>
                  </td>`).join('')}
                </tr>
              </table>
            </td>
          </tr>

          <!-- TOP PRIORITY -->
          <tr>
            <td style="padding-top:16px;">
              <div style="background:#1a1a1a;border:1px solid #34d39933;border-radius:12px;padding:20px 24px;">
                <div style="font-size:12px;color:#34d399;font-weight:600;letter-spacing:0.05em;margin-bottom:8px;">🎯 TOP PRIORITY TODAY</div>
                <div style="font-size:14px;color:#fff;">${topPriority}</div>
              </div>
            </td>
          </tr>

          <!-- ACTION ITEMS -->
          ${topActions.length > 0 ? `
          <tr>
            <td style="padding-top:16px;">
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px 32px;">
                <div style="font-size:12px;color:#34d399;font-weight:600;letter-spacing:0.05em;margin-bottom:16px;">✅ DO THESE TODAY</div>
                ${topActions.map((action, i) => `
                <div style="display:flex;align-items:flex-start;margin-bottom:${i < topActions.length - 1 ? '16px' : '0'};padding-bottom:${i < topActions.length - 1 ? '16px' : '0'};${i < topActions.length - 1 ? 'border-bottom:1px solid #2a2a2a;' : ''}">
                  <div style="min-width:24px;height:24px;background:${urgencyBg(action.urgency)};border:1px solid ${urgencyColor(action.urgency)}44;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;margin-top:2px;">
                    <span style="font-size:11px;font-weight:700;color:${urgencyColor(action.urgency)};">${i + 1}</span>
                  </div>
                  <div>
                    <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:4px;">${action.label}</div>
                    <div style="font-size:13px;color:#666;">${action.description}</div>
                  </div>
                </div>`).join('')}
              </div>
            </td>
          </tr>` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL || 'https://subpilot-one.vercel.app'}/dashboard"
                 style="display:inline-block;background:#34d399;color:#0a0a0a;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Open dashboard →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="font-size:11px;color:#444;margin:0;">
                SubPilot Daily Briefing · <a href="#" style="color:#444;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return getResend().emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `📋 SubPilot briefing — ${metrics.atRiskCount} at risk · $${metrics.mrr.toLocaleString()} MRR`,
    html,
  })
}
