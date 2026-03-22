import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { scoreSubscribers } from '@/lib/churn-scoring'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const results = await scoreSubscribers(session.user.id)

    return NextResponse.json({
      success: true,
      ...results,
    })

  } catch (error: any) {
    console.error('Churn scoring error:', error?.message)
    return NextResponse.json(
      { error: 'Failed to score subscribers' },
      { status: 500 }
    )
  }
}