/**
 * Upstash rate limiting with graceful degradation.
 *
 * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set,
 * rate limiting is skipped entirely and every request is allowed through.
 * This means the app works locally and in preview without Upstash credentials,
 * and gets proper distributed rate limiting in production.
 */

import { NextRequest } from 'next/server'

// ── Lazy initialisation — only import Upstash when credentials are present ──

let _ratelimit: Record<string, any> | null = null

function getLimiters() {
  if (_ratelimit) return _ratelimit

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  try {
    // Dynamic require so the module doesn't crash when credentials are absent
    const { Ratelimit } = require('@upstash/ratelimit')
    const { Redis }     = require('@upstash/redis')

    const redis = new Redis({ url, token })

    _ratelimit = {
      // Auth routes — 5 requests per 10 minutes per IP
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        prefix:  'rl:auth',
      }),

      // AI routes — 20 requests per minute per user
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix:  'rl:ai',
      }),
    }

    return _ratelimit
  } catch {
    return null
  }
}

// ── Public helpers ────────────────────────────────────────────────────────────

export type RateLimitResult =
  | { limited: false }
  | { limited: true; reset: number }

/**
 * Check the auth rate limit for a given IP.
 * Returns { limited: false } if Upstash is not configured.
 */
export async function checkAuthLimit(req: NextRequest): Promise<RateLimitResult> {
  const limiters = getLimiters()
  if (!limiters) return { limited: false }

  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown'

  const { success, reset } = await limiters.auth.limit(ip)
  return success ? { limited: false } : { limited: true, reset }
}

/**
 * Check the AI rate limit for a given user ID.
 * Returns { limited: false } if Upstash is not configured.
 */
export async function checkAiLimit(userId: string): Promise<RateLimitResult> {
  const limiters = getLimiters()
  if (!limiters) return { limited: false }

  const { success, reset } = await limiters.ai.limit(userId)
  return success ? { limited: false } : { limited: true, reset }
}
