import { connectDB } from '@/lib/mongodb'
import { Subscriber } from '@/models/Subscriber'

const PATREON_API = 'https://www.patreon.com/api/oauth2/v2'
const TOKEN_URL   = 'https://www.patreon.com/api/oauth2/token'
const UA          = 'SubPilot/1.0'

// ─── Auth URL ──────────────────────────────────────────────────────────────────

export function getPatreonAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.PATREON_CLIENT_ID!,
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/patreon/callback`,
    scope:         'identity identity[email] campaigns campaigns.members campaigns.members[email]',
  })
  return `https://www.patreon.com/oauth2/authorize?${params}`
}

// ─── Token exchange ────────────────────────────────────────────────────────────

export async function exchangeCodeForToken(code: string) {
  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':   UA,
    },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      client_id:     process.env.PATREON_CLIENT_ID!,
      client_secret: process.env.PATREON_CLIENT_SECRET!,
      redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/patreon/callback`,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Patreon token exchange failed (${res.status}): ${body}`)
  }

  return res.json() as Promise<{
    access_token:  string
    refresh_token: string
    expires_in:    number
    token_type:    string
  }>
}

// ─── Sync helpers ──────────────────────────────────────────────────────────────

// Map Patreon patron_status values to our unified status enum
function mapPatreonStatus(status: string): string {
  const map: Record<string, string> = {
    active_patron:   'active',
    declined_patron: 'past_due',
    former_patron:   'cancelled',
  }
  return map[status] ?? 'unknown'
}

// Fetch the creator's campaign ID from their identity
async function getCampaignId(accessToken: string): Promise<string> {
  const res = await fetch(
    `${PATREON_API}/identity?include=campaign&fields%5Buser%5D=full_name,email`,
    { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': UA } }
  )

  if (!res.ok) throw new Error(`Patreon identity fetch failed (${res.status})`)

  const data = await res.json()
  const campaignId = data?.data?.relationships?.campaign?.data?.id

  if (!campaignId) throw new Error('No Patreon campaign found — make sure this account has an active campaign')

  return campaignId
}

// ─── Main sync function ────────────────────────────────────────────────────────

export async function syncPatreonMembers(userId: string, accessToken: string) {
  await connectDB()

  const campaignId = await getCampaignId(accessToken)

  const results = { synced: 0, errors: 0 }
  let cursor: string | null = null

  // Paginate through all members — Patreon uses cursor-based pagination
  do {
    const params = new URLSearchParams({
      'fields[member]': [
        'full_name',
        'email',
        'patron_status',
        'currently_entitled_amount_cents',
        'pledge_relationship_start',
        'last_charge_date',
        'last_charge_status',
        'campaign_lifetime_support_cents',
      ].join(','),
      'page[count]': '1000',
    })
    if (cursor) params.set('page[cursor]', cursor)

    const res = await fetch(
      `${PATREON_API}/campaigns/${campaignId}/members?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': UA } }
    )

    if (!res.ok) throw new Error(`Patreon members fetch failed (${res.status})`)

    const body = await res.json()

    for (const member of body.data ?? []) {
      try {
        const a = member.attributes

        await Subscriber.findOneAndUpdate(
          { userId, source: 'patreon', sourceId: member.id },
          {
            userId,
            source:    'patreon',
            sourceId:  member.id,
            name:      a.full_name || '',
            email:     a.email     || '',
            plan:      'patreon',
            // Patreon stores pledge amounts in cents — same as Stripe
            amount:    a.currently_entitled_amount_cents || 0,
            currency:  'usd',
            status:    mapPatreonStatus(a.patron_status),
            startedAt: a.pledge_relationship_start
              ? new Date(a.pledge_relationship_start)
              : null,
            lastActiveAt: a.last_charge_date
              ? new Date(a.last_charge_date)
              : null,
            metadata: {
              patronStatus:     a.patron_status,
              lastChargeStatus: a.last_charge_status,
              lifetimeCents:    a.campaign_lifetime_support_cents,
            },
          },
          { upsert: true, new: true }
        )

        results.synced++
      } catch (err) {
        console.error('Error syncing Patreon member:', err)
        results.errors++
      }
    }

    // Advance cursor if there are more pages
    cursor = body.meta?.pagination?.cursors?.next ?? null
  } while (cursor)

  return results
}
