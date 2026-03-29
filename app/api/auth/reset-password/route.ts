import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // token must not be expired
    })

    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })

    return NextResponse.json({ message: 'Password updated successfully.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
