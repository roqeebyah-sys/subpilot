import { z } from 'zod'

// ── Primitives ────────────────────────────────────────────────────────────────

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format')

const email = z
  .string()
  .email('Invalid email address')
  .max(254)

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  name:     z.string().min(1, 'Name is required').max(100).trim(),
  email,
  password,
})

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z.object({
  token:       z.string().min(1),
  newPassword: password,
})

// ── Account ───────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name:            z.string().min(1).max(100).trim().optional(),
  currentPassword: z.string().max(128).optional(),
  newPassword:     password.optional(),
  notifications:   z.object({
    dailyBriefing: z.boolean(),
    churnAlerts:   z.boolean(),
  }).optional(),
  taxRate: z.number().min(0).max(100).optional(),
}).refine(data => {
  // If newPassword is provided, currentPassword must also be provided
  if (data.newPassword && !data.currentPassword) return false
  return true
}, { message: 'Current password required when setting a new password' })

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password required'),
})

// ── AI ────────────────────────────────────────────────────────────────────────

export const previewEmailSchema = z.object({
  subscriberId: objectId,
})

export const winbackSchema = z.object({
  subscriberId: objectId,
  tone: z.enum(['warm', 'professional', 'casual', 'urgent']).default('warm'),
})

// ── Alerts ────────────────────────────────────────────────────────────────────

export const sendAlertSchema = z.object({
  subscriberId: objectId.optional(),
})

// ── Billing ───────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  plan: z.enum(['starter', 'growth', 'pro']),
})

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Parse and validate a request body against a Zod schema.
 * Returns { data } on success or { error, status } on failure.
 */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return { ok: false, error: 'Invalid JSON body', status: 400 }
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    const issues = (result.error as any).issues ?? (result.error as any).errors ?? []
    const msg = issues[0]?.message ?? 'Invalid request'
    return { ok: false, error: msg, status: 422 }
  }

  return { ok: true, data: result.data }
}
