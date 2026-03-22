import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Known column mappings for popular platforms
// These are checked first before calling Claude — saves API costs
const KNOWN_MAPPINGS: Record<string, Record<string, string>> = {
  gumroad: {
    'Full Name': 'name',
    'Email': 'email',
    'Price': 'amount',
    'Created At': 'startedAt',
    'Refunded At': 'cancelledAt',
  },
  paypal: {
    'Name': 'name',
    'Email Address': 'email',
    'Gross': 'amount',
    'Date': 'startedAt',
    'Status': 'status',
  },
  teachable: {
    'Name': 'name',
    'Email': 'email',
    'Enrolled At': 'startedAt',
    'Price': 'amount',
  },
  kajabi: {
    'Full Name': 'name',
    'Email': 'email',
    'Created At': 'startedAt',
    'Price': 'amount',
    'Status': 'status',
  },
}

// Try to detect which platform the CSV came from based on headers
function detectPlatform(headers: string[]): string | null {
  const headerSet = new Set(headers.map(h => h.trim()))

  // Gumroad always has these specific columns
  if (headerSet.has('Seller ID') || headerSet.has('Gumroad Fee')) return 'gumroad'

  // PayPal always has these
  if (headerSet.has('Transaction ID') && headerSet.has('Gross')) return 'paypal'

  // Teachable
  if (headerSet.has('Enrolled At') && headerSet.has('Completed At')) return 'teachable'

  // Kajabi
  if (headerSet.has('Member Since') || headerSet.has('Kajabi ID')) return 'kajabi'

  return null
}

// Use Claude to figure out which columns map to which fields
// Only called when we can't auto-detect the platform
export async function detectColumnMappings(
  headers: string[],
  sampleRows: Record<string, string>[]
): Promise<Record<string, string>> {

  // First try to detect known platform
  const platform = detectPlatform(headers)
  if (platform && KNOWN_MAPPINGS[platform]) {
    console.log(`Detected platform: ${platform}`)
    return KNOWN_MAPPINGS[platform]
  }

  // Unknown platform — ask Claude to figure it out
  const prompt = `You are analyzing a CSV export from a business tool.

CSV Headers: ${JSON.stringify(headers)}

Sample data (first 3 rows):
${JSON.stringify(sampleRows, null, 2)}

Map these CSV columns to our subscriber fields:
- name: customer's full name
- email: customer's email address  
- amount: subscription/purchase amount (number)
- currency: currency code (USD, GBP etc)
- status: subscription status (active, cancelled etc)
- plan: plan or product name
- startedAt: when they subscribed/purchased
- cancelledAt: when they cancelled (if applicable)
- lastActiveAt: last login or activity date

Return ONLY a JSON object mapping CSV column names to our field names.
Only include columns you're confident about.
Example: {"Email Address": "email", "Full Name": "name", "Amount Paid": "amount"}
Do not include any explanation, just the JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const mapping = JSON.parse(text.trim())
    return mapping
  } catch {
    // If Claude's response can't be parsed, return empty mapping
    // User will need to map manually
    return {}
  }
}

// Parse CSV text into an array of row objects
export function parseCSV(csvText: string): {
  headers: string[]
  rows: Record<string, string>[]
} {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }

  // Handle quoted CSV values properly
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
  const rows = lines.slice(1).map(line => {
    const values = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row
  })

  return { headers, rows }
}

// Convert a mapped CSV row into our unified subscriber format
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
    if (!value) continue

    switch (ourField) {
      case 'amount':
        // Strip currency symbols and convert to number
        mapped.amount = Math.round(parseFloat(value.replace(/[^0-9.]/g, '')) * 100)
        break
      case 'startedAt':
      case 'cancelledAt':
      case 'lastActiveAt':
        const date = new Date(value)
        if (!isNaN(date.getTime())) mapped[ourField] = date
        break
      case 'status':
        // Normalise status values
        const statusMap: Record<string, string> = {
          'active': 'active', 'Active': 'active',
          'cancelled': 'cancelled', 'Cancelled': 'cancelled', 'canceled': 'cancelled',
          'refunded': 'cancelled', 'Refunded': 'cancelled',
          'completed': 'active', 'Completed': 'active',
        }
        mapped.status = statusMap[value] || 'unknown'
        break
      default:
        mapped[ourField] = value
    }
  }

  return mapped
}