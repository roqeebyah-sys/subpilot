import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { syncPatreonMembers } from '@/lib/patreon-service'

// Re-syncs Patreon members for an already-connected account
export async function POST(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  await connectDB()

  const user = await User.findById(session.user.id).select('patreonAccessToken patreonConnected')

  if (!user?.patreonConnected || !user?.patreonAccessToken) {
    return NextResponse.json({ error: 'Patreon not connected' }, { status: 400 })
  }

  try {
    const results = await syncPatreonMembers(session.user.id, user.patreonAccessToken)
    return NextResponse.json({ success: true, ...results })
  } catch (err: any) {
    console.error('Patreon sync error:', err)
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 })
  }
}
