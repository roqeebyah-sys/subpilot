import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { rateLimit, getIp } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes
  const rl = rateLimit({ key: `forgot-pw:${getIp(req)}`, limit: 5, windowSecs: 900 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success even if user not found — prevents email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now

    await User.findByIdAndUpdate(user._id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: user.email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px 32px; border-radius: 12px;">
          <h2 style="margin: 0 0 8px; font-size: 22px;">Reset your password</h2>
          <p style="color: #9ca3af; margin: 0 0 32px; font-size: 14px;">
            Click the button below to set a new password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #10b981; color: #000; font-weight: 600;
                    padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px;">
            Reset password
          </a>
          <p style="color: #6b7280; margin: 32px 0 0; font-size: 12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
