# SubPilot — Security Documentation

> Last updated: 2026-04-09

---

## Overview

SubPilot is a Next.js 16 SaaS application that helps founders track subscriber churn and receive AI-generated win-back emails. The security model is built around four pillars:

1. **Authentication** — NextAuth v5 with JWT sessions and bcrypt-hashed credentials.
2. **Authorization** — Every API route is individually session-gated; all database queries are scoped to the authenticated user's ID, preventing cross-user data access.
3. **Input validation** — All API request bodies are parsed through typed Zod schemas before any business logic runs. File uploads have hard limits on MIME type, size, and row count.
4. **Rate limiting** — A two-tier system (Upstash Redis for auth/AI routes, in-memory for upload routes) limits abuse without requiring external dependencies in development.

Raw payment card data is never stored — Stripe handles all payment instrument storage.

---

## Authentication & Sessions

### NextAuth v5 (beta)

The app uses `next-auth@^5.0.0-beta.30` with a `CredentialsProvider` (email + password). The configuration lives in `lib/auth.ts` and the catch-all route handler is mounted at `app/api/auth/[...nextauth]/route.ts`.

**Login flow:**

1. The user submits their email and password to `/api/auth/callback/credentials` (managed internally by NextAuth).
2. The `authorize` callback in `lib/auth.ts` finds the user in MongoDB by email and calls `bcrypt.compare` to verify the submitted password against the stored hash.
3. On success, NextAuth creates a signed JWT containing `id`, `email`, `name`, and `plan`.
4. Subsequent requests include the JWT in an HTTP-only cookie. The `auth()` helper verifies the JWT on every call from a Route Handler.

### JWT Signing — `NEXTAUTH_SECRET`

All session tokens are signed (and optionally encrypted) using the value of `NEXTAUTH_SECRET`. If this value is absent or weak:

- Any party who obtains the secret can forge valid session tokens.
- All existing sessions must be invalidated immediately after rotation.

**This variable must be a cryptographically random string of at least 32 bytes.** Generate one with:

```bash
openssl rand -base64 32
```

### Session Scoping

The JWT payload is augmented in two callbacks:

| Callback | What it adds |
|----------|-------------|
| `jwt`     | `token.id` (MongoDB `_id`), `token.plan` |
| `session` | `session.user.id`, `session.user.plan` |

The `session.user.id` value is used as the sole authorisation anchor throughout the API layer. Any resource that belongs to a user is stored and queried with `userId: session.user.id`.

### OAuth Users

Users who sign in via a future OAuth provider (e.g. Google) will not have a `password` field in their document. The `authorize` callback explicitly rejects a credential login attempt for such accounts (`"Please log in with Google"`), preventing password-less accounts from being targeted by credential-stuffing.

---

## Authorization

### Route Protection Pattern

Every authenticated Route Handler follows this guard pattern at the top of the function body:

```ts
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
}
```

There are no middleware-level route guards; protection is applied individually, which means adding a new route without a session check would leave it open. Each route listed below has been verified to include the guard.

### Public Routes (no session required)

| Route | Method | Notes |
|-------|--------|-------|
| `POST /api/auth/signup` | POST | Zod-validated; Upstash rate limited by IP |
| `POST /api/auth/forgot-password` | POST | Zod-validated; Upstash rate limited by IP; always returns success to prevent email enumeration |
| `POST /api/billing/webhook` | POST | Stripe signature verification acts as the auth gate |
| `GET/POST /api/auth/[...nextauth]` | * | Managed by NextAuth internals |

### Protected Routes (session required)

| Route | Method | Extra gate |
|-------|--------|-----------|
| `POST /api/csv/upload` | POST | In-memory rate limit (10/hour per user) |
| `POST /api/billing/checkout` | POST | Zod validation |
| `GET/POST /api/billing/portal` | GET/POST | — |
| `GET/POST /api/stripe/sync` | GET/POST | Trial expiry gate |
| `POST /api/churn/score` | POST | Trial expiry gate |
| `POST /api/alerts/send` | POST | Zod validation |
| `GET /api/alerts/briefing` | GET | — |
| `GET /api/dashboard` | GET | — |
| `GET /api/insights` | GET | — |
| `GET/PUT /api/subscribers/[id]` | GET/PUT | userId scoping |
| `GET/PUT /api/account` | GET/PUT | Zod validation |
| `PUT /api/account/profile` | PUT | Zod validation |
| `POST /api/ai/preview-email` | POST | Upstash AI rate limit; Zod validation |
| `POST /api/ai/winback` | POST | Upstash AI rate limit; Zod validation |

### IDOR Prevention

All database queries that return or modify subscriber data include the authenticated user's ID:

```ts
// Example from /api/alerts/send
const query = { userId: session.user.id, churnScore: { $gte: 7 }, ... }
const atRisk = await Subscriber.find(query)
```

Subscriber IDs supplied in request bodies (e.g. `subscriberId` in `sendAlertSchema`) are validated as 24-character hex strings (MongoDB ObjectId format) by Zod, but the final database query always adds `userId: session.user.id` as an additional filter. A user cannot access or trigger actions for another user's subscribers even if they supply a valid ObjectId.

---

## Input Validation

### Zod Schemas (`lib/validations.ts`)

All request bodies that accept structured input are parsed through Zod schemas using the shared `parseBody` helper before any logic runs. Validation failures return HTTP 422 with the first error message; malformed JSON returns HTTP 400.

| Schema | Route(s) | Key constraints |
|--------|----------|----------------|
| `signupSchema` | `/api/auth/signup` | name ≤ 100 chars, email ≤ 254 chars, password 8–128 chars |
| `forgotPasswordSchema` | `/api/auth/forgot-password` | valid email |
| `resetPasswordSchema` | (reset page) | password 8–128 chars, token non-empty |
| `updateProfileSchema` | `/api/account/profile` | requires `currentPassword` when `newPassword` present |
| `deleteAccountSchema` | `/api/account` | password non-empty |
| `checkoutSchema` | `/api/billing/checkout` | plan must be `starter`, `growth`, or `pro` |
| `sendAlertSchema` | `/api/alerts/send` | optional `subscriberId` must be a 24-char hex ObjectId |
| `previewEmailSchema` | `/api/ai/preview-email` | `subscriberId` must be a 24-char hex ObjectId |
| `winbackSchema` | `/api/ai/winback` | `subscriberId` ObjectId; `tone` enum (`warm`, `professional`, `casual`, `urgent`) |

### CSV Upload Restrictions (`app/api/csv/upload/route.ts`)

| Constraint | Value |
|------------|-------|
| Maximum file size | 5 MB |
| Maximum row count | 10,000 rows |
| Allowed MIME types | `text/csv`, `text/plain`, `application/csv`, `application/vnd.ms-excel` |
| Email format validation | Regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) applied per row |
| Mapping override | Must be a valid JSON object (not an array); rejected otherwise |

Rows with a missing or malformed email are silently skipped (counted in `skipped`) rather than causing an error.

### NoSQL Injection Prevention

Mongoose is used as the ODM. All user-supplied values that reach query operators are passed as typed Zod-validated primitives (strings, numbers, booleans). ObjectId fields are validated by Zod's `objectId` regex (`/^[a-f\d]{24}$/i`) before use. This prevents an attacker from injecting MongoDB query operators (e.g. `{ $gt: "" }`) through request bodies.

---

## Rate Limiting

SubPilot uses two independent rate-limiting mechanisms.

### Tier 1 — Upstash Redis (distributed, sliding window)

Used for **auth and AI routes** where distributed accuracy matters. Implemented in `lib/ratelimit.ts`.

Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. If either variable is absent, the limiter degrades gracefully: all requests are allowed through. This means the app functions locally and in preview deployments without Upstash credentials, but **production must have these variables set**.

| Limiter key | Routes | Limit | Window |
|-------------|--------|-------|--------|
| `rl:auth:<ip>` | `POST /api/auth/signup`, `POST /api/auth/forgot-password` | 5 requests | 10 minutes |
| `rl:ai:<userId>` | `POST /api/ai/preview-email`, `POST /api/ai/winback` | 20 requests | 1 minute |

Algorithm: sliding window (via `@upstash/ratelimit`).

### Tier 2 — In-Memory (single-instance, fixed window)

Used for **CSV upload** where a simple in-process counter is sufficient. Implemented in `lib/rate-limit.ts`.

| Key | Route | Limit | Window |
|-----|-------|-------|--------|
| `csv-upload:<userId>` | `POST /api/csv/upload` | 10 uploads | 1 hour |

The in-memory store is a `Map` that self-cleans expired entries every 5 minutes to prevent unbounded memory growth. This approach works correctly for single-process deployments (Vercel Hobby, Railway, Render single instance) but will not enforce limits correctly across multiple replicas. Migrate to Redis if horizontal scaling is required.

### Server Actions Body Size Limit

`next.config.ts` sets `experimental.serverActions.bodySizeLimit: '1mb'` to cap JSON bodies for Server Actions. The CSV upload route uses `formData` and enforces its own 5 MB check independently.

---

## Data Protection

### What is Stored in MongoDB

**Users collection** (fields from `models/User.ts`):

| Field | Sensitivity | Notes |
|-------|-------------|-------|
| `name` | Low | Display name |
| `email` | Medium | Unique, lowercased, trimmed |
| `password` | High | bcrypt hash only (see below) |
| `plan` | Low | Enum: `starter`, `growth`, `pro` |
| `stripeCustomerId` | Medium | Stripe customer reference |
| `onboarded`, `stripeConnected` | Low | Feature flags |
| `taxRate` | Low | User preference (0–100) |
| `notifications` | Low | Boolean preferences |
| `trialStartedAt`, `createdAt`, `updatedAt` | Low | Timestamps |
| `resetToken`, `resetTokenExpiry` | High | Password reset (see risk note) |

**Subscribers collection** — stores per-user subscriber records synced from Stripe or imported via CSV. All documents carry `userId` linking them to the owning user.

### Password Hashing

Passwords are hashed with **bcrypt at cost factor 12** (`bcrypt.hash(password, 12)`) before any database write. The plain-text password is never logged or returned in any API response. Hashed passwords are selected from MongoDB only when needed for comparison (login, account deletion, profile password change).

The `password` field has no `select: false` modifier in the Mongoose schema. Queries that do not need the password field should use `.select('-password')` explicitly. Notably, `lib/auth.ts` queries the full user document for login, which is appropriate; other route handlers that look up users for non-auth purposes should exclude it.

### What is NOT Stored

- Raw credit or debit card numbers, CVCs, or bank account details. Stripe is the payment processor and sole custodian of payment instrument data.
- Stripe secret keys or webhook secrets are environment-only and never written to the database.
- Plain-text passwords at any point in time.

---

## Stripe Security

### Webhook Signature Verification (`app/api/billing/webhook/route.ts`)

The webhook endpoint reads the raw request body as a string (`req.text()`) rather than the parsed JSON, which is required by Stripe's SDK to compute the HMAC-SHA256 signature correctly. The signature is verified with:

```ts
stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
```

If the `stripe-signature` header is absent, the route returns HTTP 400 immediately. If signature verification fails (wrong secret, replay attack, tampered body), the SDK throws and the route returns HTTP 400 with the error message. No database writes occur before this check passes.

### Stripe Keys

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe API calls (create customers, checkout sessions, portal sessions) |
| `STRIPE_WEBHOOK_SECRET` | Verify incoming webhook payloads |
| `STRIPE_STARTER_PRICE_ID`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_PRO_PRICE_ID` | Price ID lookup on the server; never exposed to the browser |

All Stripe keys are server-only environment variables (no `NEXT_PUBLIC_` prefix). Price ID resolution happens exclusively in `POST /api/billing/checkout`, which prevents clients from supplying arbitrary price IDs.

---

## Environment Variables

All secrets must be set in your hosting platform's environment variable store (e.g. Vercel project settings, Railway variables). **Never commit these to source control.**

### Required Variables

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_SECRET` | Signs and verifies all JWT session tokens. Must be a strong random value. |
| `NEXTAUTH_URL` | Canonical base URL for NextAuth redirects (e.g. `https://app.subpilot.com`). Required in production. |
| `MONGODB_URI` | MongoDB Atlas (or self-hosted) connection string, including credentials. |
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_live_...` in production, `sk_test_...` in development). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the Stripe webhook endpoint configuration (`whsec_...`). |
| `STRIPE_STARTER_PRICE_ID` | Stripe price ID for the Starter plan. |
| `STRIPE_GROWTH_PRICE_ID` | Stripe price ID for the Growth plan. |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for the Pro plan. |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for generating AI insights and win-back emails. |
| `RESEND_API_KEY` | Resend API key for sending transactional emails (churn alerts, password resets). |
| `RESEND_FROM_EMAIL` | Sender address for outgoing emails (must be a verified domain in Resend). |
| `NEXT_PUBLIC_APP_URL` | Public-facing URL of the app (used in email links and Stripe redirect URLs). |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint. Required in production for auth/AI rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token. Required in production for auth/AI rate limiting. |

### Optional / Development Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side Stripe.js (if used). |

### Never Commit These

Add the following to `.gitignore` and confirm they are absent from all commits:

```
.env
.env.local
.env.production
.env.*.local
```

Use `.env.example` (with no real values) to document required variables for new contributors.

---

## Known Remaining Risks & Recommendations

### Password Reset Tokens Stored in Plain Text

`/api/auth/forgot-password` stores the raw 32-byte hex token in `User.resetToken`. If an attacker gains read access to the MongoDB collection, all outstanding reset tokens are immediately usable.

**Recommendation:** Hash the token with `crypto.createHash('sha256').update(token).digest('hex')` before storing. Compare the hashed version at reset time.

### Stripe Sync is Not Admin-Gated

`GET/POST /api/stripe/sync` is accessible to any authenticated user with an active trial. This route triggers a live Stripe API sync using the application's single `STRIPE_SECRET_KEY`, meaning any subscriber can initiate a full Stripe data pull. There is a trial expiry gate, but no plan-level or admin restriction.

**Recommendation:** Restrict this route to users on paid plans, or move it to a server-side cron job.

### In-Memory Rate Limiter is Single-Instance Only

The CSV upload rate limiter in `lib/rate-limit.ts` uses a process-local `Map`. In multi-replica deployments, each instance maintains its own counter, effectively multiplying the limit by the number of replicas.

**Recommendation:** Migrate the CSV upload limiter to Upstash Redis using the same pattern as `lib/ratelimit.ts`.

### next-auth Is Still in Beta

`next-auth@^5.0.0-beta.30` is a pre-stable release. Breaking changes or security patches may be released without a major version bump.

**Recommendation:** Subscribe to the [NextAuth.js GitHub releases](https://github.com/nextjs/next-auth/releases) and update promptly when the stable v5 is published.

### Deployment Checklist

Before going live or deploying to a new environment:

- [ ] Generate a fresh `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to the production domain
- [ ] Switch Stripe keys from `sk_test_` to `sk_live_` and update `STRIPE_WEBHOOK_SECRET`
- [ ] Register the production webhook URL in the Stripe dashboard
- [ ] Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] Restrict MongoDB Atlas network access to the production egress IP(s)
- [ ] Verify `RESEND_FROM_EMAIL` domain is authenticated in Resend
- [ ] Confirm no `.env*` files containing secrets are tracked by git

---

## Incident Response

### General Principle

Assume the worst when a secret is potentially compromised: rotate immediately, then investigate scope. Secrets are cheap to rotate; a breach is not.

### `NEXTAUTH_SECRET` Compromised

1. Generate a new secret: `openssl rand -base64 32`
2. Update the value in your hosting platform's environment variables.
3. Redeploy the application.
4. All existing sessions are immediately invalidated — all users will be logged out.

### MongoDB Credentials Compromised

1. In MongoDB Atlas: **Network Access** → revoke any overly broad IP allowlist entries.
2. **Database Access** → select the compromised database user → **Edit** → set a new password.
3. Update `MONGODB_URI` in all environments.
4. Redeploy the application.
5. Audit Atlas logs for any unauthorized reads or writes during the exposure window.

### Stripe Secret Key Compromised (`STRIPE_SECRET_KEY`)

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **API keys**.
2. Roll (regenerate) the compromised key. The old key is immediately revoked.
3. Update `STRIPE_SECRET_KEY` in all environments.
4. If the webhook secret is also potentially compromised, roll `STRIPE_WEBHOOK_SECRET` from **Developers** → **Webhooks** → select endpoint → **Roll signing secret**.
5. Update `STRIPE_WEBHOOK_SECRET` and redeploy.

### Anthropic API Key Compromised (`ANTHROPIC_API_KEY`)

1. Log in to the [Anthropic Console](https://console.anthropic.com/) → **API Keys**.
2. Delete the compromised key.
3. Create a new API key.
4. Update `ANTHROPIC_API_KEY` in all environments and redeploy.
5. Check usage logs for unexpected spend.

### Resend API Key Compromised (`RESEND_API_KEY`)

1. Log in to the [Resend Dashboard](https://resend.com/) → **API Keys**.
2. Revoke the compromised key.
3. Create a new API key.
4. Update `RESEND_API_KEY` in all environments and redeploy.
5. Review send logs for unauthorised emails sent from your domain.

### Database Exposure (read access obtained)

If an attacker has read access to the MongoDB `users` collection:

- Outstanding plain-text `resetToken` values can be used to take over accounts. Invalidate all reset tokens: `db.users.updateMany({}, { $unset: { resetToken: '', resetTokenExpiry: '' } })`.
- `bcrypt` hashes cannot be reversed practically, but force a password reset for all users as a precaution if the exposure window was significant.
- `stripeCustomerId` values are non-secret Stripe references and are not individually dangerous, but should be treated as leaked PII.

---

*This document should be reviewed and updated whenever a new API route is added, a dependency is upgraded, or the infrastructure configuration changes.*
