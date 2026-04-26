import Anthropic from '@anthropic-ai/sdk'
import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── DIRECT COLUMN NAME MAPPINGS ───────────────────────────────────────────────
// Common column names mapped directly — no AI needed for these
const DIRECT_MAPPINGS: Record<string, string> = {
  // Email variants
  'email': 'email', 'Email': 'email', 'EMAIL': 'email',
  'email address': 'email', 'Email Address': 'email', 'customer_email': 'email',

  // Name variants
  'name': 'name', 'Name': 'name', 'NAME': 'name',
  'full name': 'name', 'Full Name': 'name', 'customer_name': 'name',
  'full_name': 'name', 'Name (First and Last)': 'name',

  // Amount variants
  'amount': 'amount', 'Amount': 'amount', 'AMOUNT': 'amount',
  'price': 'amount', 'Price': 'amount', 'revenue': 'amount',
  'Revenue': 'amount', 'Gross': 'amount', 'gross': 'amount',
  'mrr': 'amount', 'MRR': 'amount', 'monthly_amount': 'amount',

  // Status variants
  'status': 'status', 'Status': 'status', 'STATUS': 'status',
  'subscription_status': 'status', 'Subscription Status': 'status',

  // Plan variants
  'plan': 'plan', 'Plan': 'plan', 'PLAN': 'plan',
  'plan_name': 'plan', 'Plan Name': 'plan', 'product': 'plan',
  'Product': 'plan', 'tier': 'plan', 'Tier': 'plan',

  // Date variants
  'started_at': 'startedAt', 'Start Date': 'startedAt', 'start_date': 'startedAt',
  'created_at': 'startedAt', 'Created At': 'startedAt', 'created': 'startedAt',
  'date': 'startedAt', 'Date': 'startedAt', 'joined': 'startedAt',
  'Joined': 'startedAt', 'signup_date': 'startedAt', 'Signup Date': 'startedAt',
  'Purchase Date': 'startedAt', 'Enrolled At': 'startedAt',

  // Cancelled date
  'cancelled_at': 'cancelledAt', 'Cancelled At': 'cancelledAt',
  'canceled_at': 'cancelledAt', 'Refunded At': 'cancelledAt',
  'end_date': 'cancelledAt', 'End Date': 'cancelledAt',

  // Last active
  'last_active': 'lastActiveAt', 'Last Active': 'lastActiveAt',
  'last_login': 'lastActiveAt', 'Last Login': 'lastActiveAt',
  'last_seen': 'lastActiveAt', 'Last Seen': 'lastActiveAt',

  // Currency
  'currency': 'currency', 'Currency': 'currency',
}

// ── AUTO-DETECT COLUMNS ───────────────────────────────────────────────────────
// First tries direct matching, then falls back to Claude for unknown headers
export async function detectColumnMappings(
  headers: string[],
  sampleRows: Record<string, string>[]
): Promise<Record<string, string>> {
  const mapping: Record<string, string> = {}
  const unmapped: string[] = []

  // Try direct matching first — free and instant
  for (const header of headers) {
    const trimmed = header.trim()
    if (DIRECT_MAPPINGS[trimmed]) {
      mapping[trimmed] = DIRECT_MAPPINGS[trimmed]
    } else {
      unmapped.push(trimmed)
    }
  }

  // If we have email mapped we're good — skip Claude entirely
  const hasEmail = Object.values(mapping).includes('email')
  if (hasEmail && unmapped.length === 0) {
    return mapping
  }

  // Only call Claude for genuinely unknown headers
  if (unmapped.length > 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const prompt = `Map these CSV column headers to subscriber fields.

Unknown headers: ${JSON.stringify(unmapped)}
Sample data: ${JSON.stringify(sampleRows.slice(0, 2), null, 2)}

Available fields: email, name, amount, currency, status, plan, startedAt, cancelledAt, lastActiveAt

Return ONLY a JSON object mapping header names to field names.
Only include headers you are confident about.
Example: {"Customer Email": "email", "Monthly Fee": "amount"}
No explanation, just JSON.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
      const aiMapping = JSON.parse(text.replace(/```json|```/g, '').trim())

      // Merge AI mapping with direct mapping
      Object.assign(mapping, aiMapping)
    } catch (err) {
      // Claude failed — just use what we have from direct matching
      console.log('Claude mapping skipped — using direct match only')
    }
  }

  return mapping
}

// ── CSV PARSER ────────────────────────────────────────────────────────────────
export function parseCSV(csvText: string): {
  headers: string[]
  rows: Record<string, string>[]
} {
  // Remove BOM if present (common in Excel exports)
  const cleaned = csvText.replace(/^\uFEFF/, '').trim()
  const lines = cleaned.split(/\r?\n/)

  if (lines.length < 2) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseRow(lines[0])
  const rows = lines
    .slice(1)
    .filter(line => line.trim()) // skip empty lines
    .map(line => {
      const values = parseRow(line)
      const row: Record<string, string> = {}
      headers.forEach((header, i) => {
        row[header.trim()] = values[i] || ''
      })
      return row
    })

  return { headers: headers.map(h => h.trim()), rows }
}

// ── ROW MAPPER ────────────────────────────────────────────────────────────────
export function mapRowToSubscriber(
  row: Record<string, string>,
  mapping: Record<string, string>,
  userId: string
) {
  const mapped: Record<string, any> = {
    userId,
    source: 'csv',
    status: 'active',
  }

  for (const [csvColumn, ourField] of Object.entries(mapping)) {
    const value = row[csvColumn]
    if (!value || value.trim() === '') continue

    switch (ourField) {
      case 'amount':
        // Strip currency symbols, commas, spaces
        const numStr = value.replace(/[^0-9.]/g, '')
        const num = parseFloat(numStr)
        if (!isNaN(num)) mapped.amount = Math.round(num * 100) // store in cents
        break

      case 'startedAt':
      case 'cancelledAt':
      case 'lastActiveAt':
        const date = new Date(value)
        if (!isNaN(date.getTime())) mapped[ourField] = date
        break

      case 'status':
        const statusMap: Record<string, string> = {
          'active': 'active', 'Active': 'active', 'ACTIVE': 'active',
          'cancelled': 'cancelled', 'Cancelled': 'cancelled',
          'canceled': 'cancelled', 'Canceled': 'cancelled', 'CANCELED': 'cancelled',
          'refunded': 'cancelled', 'Refunded': 'cancelled',
          'past_due': 'past_due', 'Past Due': 'past_due', 'past due': 'past_due',
          'paused': 'paused', 'Paused': 'paused',
          'trialing': 'trialing', 'Trial': 'trialing', 'trial': 'trialing',
          'completed': 'active', 'Completed': 'active',
        }
        mapped.status = statusMap[value.trim()] || 'unknown'
        break

      default:
        mapped[ourField] = value.trim()
    }
  }

  return mapped
}