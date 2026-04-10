import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/account', '/api']

// API routes that are publicly accessible (no auth required)
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/billing/webhook']

export default auth(function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if the path needs protection
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  // Allow public API routes through without auth
  const isPublicApi = PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))
  if (isPublicApi) return NextResponse.next()

  // At this point the route is protected — auth() wraps this middleware
  // so req.auth is populated. If there's no session, redirect to login.
  const session = (req as any).auth
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Run middleware on dashboard, account, and api routes
  matcher: ['/dashboard/:path*', '/account/:path*', '/api/:path*'],
}
