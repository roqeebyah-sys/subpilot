/**
 * In-memory rate limiter.
 * Works for single-instance deployments (Vercel hobby / Railway / Render).
 * For multi-instance, swap the Map for a Redis store.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  /** Unique key — e.g. "login:<ip>" */
  key: string
  /** Max requests allowed in the window */
  limit: number
  /** Window length in seconds */
  windowSecs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit({ key, limit, windowSecs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + windowSecs * 1000
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  return {
    allowed: entry.count <= limit,
    remaining,
    resetAt: entry.resetAt,
  }
}

/** Helper to get client IP from Next.js request */
export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
