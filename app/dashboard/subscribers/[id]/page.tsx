import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SubscriberDetailClient from './subscriber-detail-client'

export default async function SubscriberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { id } = await params
  return <SubscriberDetailClient id={id} session={session} />
}
