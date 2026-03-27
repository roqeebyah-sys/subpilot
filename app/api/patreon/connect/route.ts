import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPatreonAuthUrl } from '@/lib/patreon-service'

// Redirects the authenticated user to Patreon's OAuth consent screen
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
    )
  }

  return NextResponse.redirect(getPatreonAuthUrl())
}
