import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

// GET /api/account/profile — fetch current user settings
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.user.id)
      .select('name email plan stripeCustomerId stripeConnected stripeConnectedAt taxRate notifications createdAt')
      .lean() as any

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      name:               user.name,
      email:              user.email,
      plan:               user.plan || 'starter',
      stripeCustomerId:   user.stripeCustomerId || null,
      stripeConnected:    user.stripeConnected || false,
      stripeConnectedAt:  user.stripeConnectedAt || null,
      taxRate:            user.taxRate ?? 30,
      notifications: {
        dailyBriefing: user.notifications?.dailyBriefing ?? true,
        churnAlerts:   user.notifications?.churnAlerts ?? true,
      },
      memberSince: user.createdAt,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

// PUT /api/account/profile — update name, email, password, notifications, taxRate
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const { name, email, currentPassword, newPassword, notifications, taxRate } = body

    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Name / email
    if (name)  user.name  = name.trim()
    if (email) user.email = email.toLowerCase().trim()

    // Password change
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      const valid = await bcrypt.compare(currentPassword, user.password || '')
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      user.password = await bcrypt.hash(newPassword, 12)
    }

    // Notifications
    if (notifications) {
      user.notifications = {
        dailyBriefing: notifications.dailyBriefing ?? user.notifications?.dailyBriefing ?? true,
        churnAlerts:   notifications.churnAlerts   ?? user.notifications?.churnAlerts   ?? true,
      }
    }

    // Tax rate
    if (taxRate !== undefined) {
      const rate = Number(taxRate)
      if (rate >= 0 && rate <= 100) user.taxRate = rate
    }

    await user.save()
    return NextResponse.json({ success: true })

  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 })
  }
}
