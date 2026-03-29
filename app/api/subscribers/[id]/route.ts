import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  await connectDB()

  const subscriber = await Subscriber.findOne({
    _id: id,
    userId: session.user.id,   // ensure this subscriber belongs to the authed user
  }).lean()

  if (!subscriber) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
  }

  return NextResponse.json(subscriber)
}
