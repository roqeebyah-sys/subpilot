import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Subscriber } from '@/models/Subscriber'
import { parseBody, deleteAccountSchema } from '@/lib/validations'

// DELETE /api/account — permanently delete account and all data
// Requires password confirmation to prevent accidental or unauthorised deletion
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Require password re-confirmation before destructive action
    const parsed = await parseBody(req, deleteAccountSchema)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
    const { password } = parsed.data

    await connectDB()

    const user = await User.findById(session.user.id).select('+password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Verify identity before deleting everything
    const valid = await bcrypt.compare(password, user.password || '')
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
    }

    await Subscriber.deleteMany({ userId: session.user.id })
    await User.findByIdAndDelete(session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
