import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { checkAuthLimit } from '@/lib/ratelimit'
import { parseBody, signupSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  // Upstash rate limit: 5 signups per 10 minutes per IP (degrades gracefully)
  const limit = await checkAuthLimit(req)
  if (limit.limited) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const parsed = await parseBody(req, signupSchema)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  const { name, email, password } = parsed.data

  try {

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