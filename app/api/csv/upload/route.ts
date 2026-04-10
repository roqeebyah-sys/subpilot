import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'
import { parseCSV, detectColumnMappings, mapRowToSubscriber } from '@/lib/csv-service'
import { rateLimit } from '@/lib/rate-limit'

// 5 MB file size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024
// 10,000 row limit per upload
const MAX_ROWS = 10_000
// Allowed MIME types
const ALLOWED_TYPES = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Rate limit: 10 CSV uploads per user per hour
    const rl = rateLimit({ key: `csv-upload:${session.user.id}`, limit: 10, windowSecs: 3600 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Upload limit reached. Try again in an hour.' }, { status: 429 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const mappingOverride = formData.get('mapping') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // File extension + MIME type check
    const fileName = file.name || ''
    if (!fileName.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 })
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a CSV file.' }, { status: 400 })
    }

    // File size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 })
    }

    const csvText = await file.text()
    const { headers, rows } = parseCSV(csvText)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // Row cap
    if (rows.length > MAX_ROWS) {
      return NextResponse.json({
        error: `CSV has ${rows.length.toLocaleString()} rows — maximum is ${MAX_ROWS.toLocaleString()}. Split your file and re-upload.`,
      }, { status: 400 })
    }

    // Validate mapping override is safe JSON
    let mapping: Record<string, string>
    if (mappingOverride) {
      try {
        mapping = JSON.parse(mappingOverride)
        if (typeof mapping !== 'object' || Array.isArray(mapping)) throw new Error()
      } catch {
        return NextResponse.json({ error: 'Invalid mapping format' }, { status: 400 })
      }
    } else {
      mapping = await detectColumnMappings(headers, rows.slice(0, 3))
    }

    const hasEmail = Object.values(mapping).includes('email')
    if (!hasEmail) {
      return NextResponse.json({
        error: 'Could not detect email column',
        headers,
        mapping,
        needsMapping: true,
      }, { status: 422 })
    }

    await connectDB()

    let imported = 0
    let skipped  = 0

    for (const row of rows) {
      const subscriberData = mapRowToSubscriber(row, mapping, session.user.id)

      if (!subscriberData.email) { skipped++; continue }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriberData.email)) { skipped++; continue }

      await Subscriber.findOneAndUpdate(
        { userId: session.user.id, source: 'csv', email: subscriberData.email },
        subscriberData,
        { upsert: true, new: true }
      )
      imported++
    }

    return NextResponse.json({ success: true, imported, skipped, total: rows.length, mapping })

  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json({ error: 'Failed to process CSV file' }, { status: 500 })
  }
}
