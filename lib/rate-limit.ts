/**
 * Lightweight in-memory rate limiter.
 * Works per-process — sufficient for single-instance deployments.
 * Swap for @upstash/ratelimit if you scale to multiple instances.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

/**
 * Check whether a key (typically IP + route) has exceeded its limit.
 * @param key      Unique identifier, e.g. "forgot-password:1.2.3.4"
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns        { allowed: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // First request or window has expired — start fresh
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract the real client IP from a Next.js request,
 * falling back through common proxy headers.
 */
export function getIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
