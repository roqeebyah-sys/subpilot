import { handlers } from '@/lib/auth'

// This single file handles ALL auth requests:
// POST /api/auth/signin
// POST /api/auth/signout
// GET  /api/auth/session
// ...and more — NextAuth handles all of them automatically
export const { GET, POST } = handlers