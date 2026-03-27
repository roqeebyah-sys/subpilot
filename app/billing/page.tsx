import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import BillingClient from './billing-client'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  // Always fetch the latest plan from DB — the JWT may be stale after an upgrade
  await connectDB()
  const user = await User.findById(session.user.id).select('plan').lean() as { plan?: string } | null
  const currentPlan = (user?.plan as 'starter' | 'growth' | 'pro') ?? 'starter'

  const params = await searchParams

  return (
    <BillingClient
      session={session}
      currentPlan={currentPlan}
      success={params.success === 'true'}
      cancelled={params.cancelled === 'true'}
    />
  )
}
