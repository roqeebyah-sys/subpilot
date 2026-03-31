import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountClient from './account-client'

export const metadata = { title: 'Account – UserRetain' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  return <AccountClient session={session} />
}
