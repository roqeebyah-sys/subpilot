import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { exchangeCodeForToken, syncPatreonMembers } from '@/lib/patreon-service'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(`${appUrl}/auth/login`)
  }

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    console.error('Patreon OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/dashboard?patreon=error`)
  }

  try {
    // Exchange the auth code for access + refresh tokens
    const tokens = await exchangeCodeForToken(code)

    await connectDB()

    // Persist tokens on the user document
    await User.findByIdAndUpdate(session.user.id, {
      patreonAccessToken:  tokens.access_token,
      patreonRefreshToken: tokens.refresh_token,
      patreonConnected:    true,
    })

    // Immediately sync their patron data
    const results = await syncPatreonMembers(session.user.id, tokens.access_token)
    console.log(`Patreon sync complete for user ${session.user.id}:`, results)

    return NextResponse.redirect(`${appUrl}/dashboard?patreon=connected`)
  } catch (err) {
    console.error('Patreon callback error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard?patreon=error`)
  }
}
