import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Subscriber } from '@/models/Subscriber'

// DELETE /api/account — delete account and all associated data
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    await connectDB()

    // Delete all subscribers belonging to this user
    await Subscriber.deleteMany({ userId: session.user.id })

    // Delete the user
    await User.findByIdAndDelete(session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
