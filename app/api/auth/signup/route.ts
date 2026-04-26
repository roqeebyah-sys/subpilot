import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { rateLimit, getIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit: 10 signups per 15 minutes per IP
  const ip = getIP(req)
  const { allowed, resetAt } = rateLimit(`signup:${ip}`, 10, 15 * 60 * 1000)

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { name, email, password } = await req.json()

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password before storing it
    // The '12' is the salt rounds — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user in MongoDB
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    // Return success — don't return the password!
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}