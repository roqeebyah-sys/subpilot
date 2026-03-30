export const TRIAL_DAYS = 14

export function getTrialInfo(createdAt: Date | string, plan: string) {
  // Paid users are never trial-gated
  if (plan === 'growth' || plan === 'pro') {
    return { expired: false, daysLeft: Infinity, onPaidPlan: true }
  }

  const trialEnd = new Date(createdAt)
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS)

  const now = new Date()
  const msLeft = trialEnd.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
  const expired = now > trialEnd

  return { expired, daysLeft, onPaidPlan: false }
}
