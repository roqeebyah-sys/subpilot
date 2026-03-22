import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { parseCSV, detectColumnMappings, mapRowToSubscriber } from '@/lib/csv-service'

export async function POST(req: NextRequest) {
  try {
    // Make sure user is logged in
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const mappingOverride = formData.get('mapping') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Read the file content
    const csvText = await file.text()
    const { headers, rows } = parseCSV(csvText)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // Use provided mapping or auto-detect with Claude
    const mapping = mappingOverride
      ? JSON.parse(mappingOverride)
      : await detectColumnMappings(headers, rows.slice(0, 3))

    // If no email column detected — we can't import without email
    const hasEmail = Object.values(mapping).includes('email')
    if (!hasEmail) {
      return NextResponse.json({
        error: 'Could not detect email column',
        headers, // send headers back so frontend can show mapping UI
        mapping,
        needsMapping: true,
      }, { status: 422 })
    }

    await connectDB()

    let imported = 0
    let skipped = 0

    for (const row of rows) {
      const subscriberData = mapRowToSubscriber(row, mapping, session.user.id)

      // Skip rows without an email
      if (!subscriberData.email) {
        skipped++
        continue
      }

      // Upsert — don't create duplicates if they upload the same CSV twice
      await Subscriber.findOneAndUpdate(
        { userId: session.user.id, source: 'csv', email: subscriberData.email },
        subscriberData,
        { upsert: true, new: true }
      )

      imported++
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: rows.length,
      mapping, // send back so frontend can show what was detected
    })

  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}