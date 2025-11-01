Added 6 todos

Great idea—let’s lay out clear, implementation-ready plans for both backend and frontend authentication flows so the PricePulse app stays in sync end-to-end.

---

# Frontend Plan (Next.js / PricePulse)

## Goals and scope

- Provide a full user-auth experience in the UI matching new backend capabilities:
  - Registration
  - Login / logout
  - Session persistence with refresh tokens
  - Password reset (OTP-based)
- Keep UX consistent with current visual language.
- Ensure SSR/ISR pages handle auth state correctly.
- Maintain progressive enhancement: app works without JS, but enriched with client behaviors where available.

## Architecture overview

- Use Next.js App Router (already in project).
- Split auth logic between server actions + client components where appropriate.
- Maintain credentials in memory/local storage for access tokens; rely on httpOnly cookie for refresh.
- Centralize API calls via `lib/api.ts` (extend existing module).
- Store minimal user session data in a new `lib/session.ts` helper (persisted via cookies or local storage depending on security trade-offs).
- Guard dashboard/admin routes via middleware or route segment config.

## UI/UX additions

- New routes/components:
  - `/app/(auth)/login/page.tsx`
  - `/app/(auth)/register/page.tsx`
  - `/app/(auth)/forgot-password/page.tsx`
  - `/app/(auth)/reset-password/page.tsx` (OTP submission + new password)
  - Optionally `/app/(user)/profile/page.tsx` for profile and session management (future).
- Shared components:
  - `components/AuthForm.tsx` (configurable for login/register).
  - `components/PasswordResetStepper.tsx` or inline forms within pages.
  - Toast/inline messaging using existing design system.
- UX flows:
  - Show success/error states, disable buttons during API calls, field validation.
  - After login/registration, redirect to dashboard or intended protected page.
  - Provide sticky state for “Resend code in X seconds” on password reset.

## API integration changes (`lib/api.ts`)

- Add new methods:
  - `authApi.register({ email, password, nickname })`
  - `authApi.login({ email, password })` → returns { accessToken, user }
  - `authApi.logout()`
  - `authApi.refresh()` → used by internal token refresh helper
  - `authApi.requestPasswordReset({ email })`
  - `authApi.resetPassword({ email, code, newPassword })`
- Manage access token in memory/local storage; automatically attach `Authorization: Bearer` header in product APIs.
- Handle 401 responses by attempting refresh once before failing.
- Ensure fetch calls send credentials for refresh endpoint (`credentials: 'include'`).

## Session management utilities

- New module `lib/session.ts`:
  - `getAccessToken()` / `setAccessToken()` / `clearSession()` using `localStorage` or `cookie` (if feasible).
  - `useSession` hook to read/write user data (sync with server via fetch on app load).
  - Token refresh helper: background refresh before expiry (setInterval or request interceptor).
- Consider using React context to share session state across client components; avoid double renders by hydrating from server-provided initial session.

## Routing / protection strategy

- Use Next.js middleware (`middleware.ts`) to redirect unauthenticated users away from protected paths (`/admin`, future `/dashboard`).
- Alternatively, protect server components via utilities that fetch current user server-side (call `/api/auth/refresh` if needed, then `/api/auth/me` once available).
- Add optimistic client guards in relevant components/pages.

## State and caching

- Ensure `app/page.tsx` and other data-fetching components use revalidation strategies that don’t break when auth context changes.
- For server components requiring auth, use `fetch` with `cache: 'no-store'` and include cookies.
- Update trending/dashboard components to display user-specific data only when logged in (future favorites/tracked items).

## Styling & design

- Leverage existing design tokens (`components/ui/...`).
- Ensure forms use accessible labels, inline errors, success banners.
- Add loading states/spinners (existing `Spinner` component).
- Mobile-first layout for auth pages.

## Error handling & telemetry

- Provide clear messages for common auth errors (invalid credentials, expired OTP, network issues).
- Log frontend errors to console in dev; consider hooking into existing analytics for prod (future).
- Retry logic for network errors on critical actions (optional).

## Testing plan (frontend)

- Unit tests for helpers (session manager, API wrappers).
- Component tests for forms with mocked fetch (using MSW/built-in mocks).
- E2E smoke tests (Playwright/Cypress) covering register → login → logout, password reset flow.
- Manual SSR verification (auth pages render on server and hydrate cleanly).

## Implementation order (frontend)

1. Core infrastructure:
   - Update `lib/api.ts` with auth endpoints + token refresh logic.
   - Implement `lib/session.ts`.
   - Add global HTTP interceptor if using fetch wrapper.
2. Pages and components:
   - Register + Login pages (with shared form component).
   - Forgot/reset password pages.
3. Routing safeguards:
   - Middleware for protected routes.
   - Update Admin/Dashboard pages to consume session context.
4. UI polish:
   - Success/error toasts, resend countdown, form validation.
5. Testing:
   - Unit/component tests.
   - E2E flows if available.
6. Documentation:
   - Update README/ONBOARDING notes with new env vars, auth flows.

---

# Backend Plan (Prisma/Express)

## Goals and scope

- Users can:
  - Register using email + password
  - Login with email + password
  - Reset password using an OTP sent to email (simulated/logged for now; SMTP later)
- Use Prisma + PostgreSQL with the existing `User` model
- Secure hashing, token strategy, validation, and rate-limiting designed up front
- Clean separation of concerns (controllers, services, middleware)

## Architecture overview

- Auth model: JWT access tokens + refresh tokens
  - Access token: short-lived (1h), returned in response (Authorization: Bearer)
  - Refresh token: long-lived (e.g., 7–30d), stored in httpOnly, Secure cookie and persisted in DB (hashed) for revocation/rotation
- Password hashing: Argon2 (preferred) or bcrypt
- Validation: zod (already present in backend)
- OTP: numeric 6-digit codes for password reset, stored hashed with expiry and attempt limit
- CORS: If using cookies for refresh, set explicit origin and credentials=true (can keep access token in header)

## Data model changes (Prisma)

In schema.prisma:

- User (existing)
  - Make `email` unique (if not already). Currently it’s indexed; switch to `@unique` to prevent duplicate registrations. Handle existing data before migration.
- New: RefreshToken table
  - id: string uuid
  - userId: UUID (FK to User)
  - tokenHash: string (store hashed refresh token)
  - createdAt: DateTime default now()
  - expiresAt: DateTime
  - revokedAt: DateTime? (optional)
  - userAgent, ipAddress (optional) for sessions overview
  - Index: by userId, expiresAt
- New: PasswordResetToken table
  - id: string uuid
  - userId: UUID (FK)
  - codeHash: string (hash of OTP)
  - expiresAt: DateTime
  - usedAt: DateTime?
  - attemptCount: Int default 0
  - requestedAt: DateTime default now()
  - Index: by userId, expiresAt
- Optional: Add `role` to User (enum USER | ADMIN) for authorization primitives

Migration plan:
- Add unique constraint to email with a pre-migration data check for duplicates
- Create tables and indexes
- Test down migration behavior

## Endpoints and contracts

- POST `/api/auth/register`
  - Request: { email, password, nickname? }
  - Response: { success, message } (do not auto-login by default; configurable)
  - Validation: strong password policy, valid email format
  - Errors: Email already registered
- POST `/api/auth/login`
  - Request: { email, password }
  - Response: { success, accessToken, user }, plus sets httpOnly refresh cookie
  - Rate-limit by IP and user identifier
- POST `/api/auth/logout`
  - Request: none (reads refresh cookie)
  - Response: { success }, clears refresh cookie and revokes token in DB
- POST `/api/auth/refresh`
  - Request: refresh cookie only
  - Response: { success, accessToken }, rotates refresh token (set-cookie new refresh)
  - Validate stored hashed token; revoke old; issue new
- POST `/api/auth/request-password-reset`
  - Request: { email }
  - Response: { success, message }, generate OTP, store hashed with expiry, throttle per user
  - For now: log OTP to server console for dev/testing
- POST `/api/auth/verify-password-reset`
  - Request: { email, code }
  - Response: { success, resetToken } (short-lived sealed token) OR proceed directly to reset with the same payload
  - Increments attemptCount; lock after N attempts; returns generic error
- POST `/api/auth/reset-password`
  - Request: { email, code, newPassword } (or use resetToken if using a two-step verification)
  - Response: { success, message }, invalidates all existing refresh tokens for the user (force logout elsewhere)

Middleware and guards:
- `authMiddleware` verifying access token (Bearer)
- `requireAuth` for protected routes
- `requireRole('ADMIN')` for admin-only areas (if role added)

## Security choices

- Token signing: HS256 with two separate secrets:
  - JWT_ACCESS_SECRET
  - JWT_REFRESH_SECRET
- Token TTL:
  - ACCESS_TOKEN_TTL: 1h
  - REFRESH_TOKEN_TTL: 30d
- Cookie settings (refresh):
  - httpOnly, Secure (prod), SameSite=strict/lax, path=/api/auth
  - CORS: set `origin` to frontend URL and `credentials: true`
- Hashing:
  - argon2id (argon2 package) OR bcrypt with strong cost (if argon not feasible)
- OTP:
  - 6-digit numeric, expire in 10–15 minutes
  - Hash stored (bcrypt/argon), never store plaintext
  - Attempt limit (e.g., 5) and cooldown between requests (e.g., 60s)
- Account enumeration:
  - Always return generic messages for login/reset (e.g., “If this email exists, we’ve sent a code.”)
- Brute-force mitigations:
  - Rate limit on login and password reset endpoints
  - Optional account lockout after N failed attempts with short cool-off
- Auditing:
  - Log login success/failure (no secrets), reset requests, token revocations

## Controllers/services/modules

- `src/routes/authRoutes.ts`
  - Wire all auth endpoints
- `src/controllers/authController.ts`
  - Thin controllers with zod validation and response shaping
- `src/services/authService.ts`
  - Register user (hash password)
  - Validate credentials
  - Generate/verify JWTs
  - Manage refresh tokens (create, rotate, revoke)
  - Generate/verify OTPs; reset passwords
- `src/middlewares/auth.ts`
  - Verify access token; attach `req.user`
- `src/middlewares/rateLimit.ts`
  - Configurable limiter for auth endpoints
- `src/config/env.ts`
  - Centralize env parsing (JWT secrets, TTLs)

## Authorization strategy

- Phase 1 (MVP): Protect write/modify endpoints (e.g., favorites, tracked products) using `requireAuth`
- Phase 2 (optional): Add role-based checks for admin routes and a `role` column on User

## Validation and error handling

- Use zod schemas per endpoint
- Consistent API response format:
  - { success: boolean, message?: string, data?: T, error?: string }
- Proper HTTP status codes:
  - 400 for validation errors
  - 401 for auth failures
  - 429 for rate limiting
  - 500 for unexpected errors

## Edge cases to handle

- Duplicate email on register (unique constraint)
- Wrong password / unknown email on login (generic error)
- Refresh token reuse detection (token rotation; if reuse detected, revoke all sessions)
- Expired/used OTP; too many attempts; cooldown not elapsed
- Password reset invalidates all refresh tokens (log out everywhere)
- JWT clock skew (small tolerance)

## Testing strategy

- Unit tests:
  - Password hashing/verification
  - JWT issue/verify/rotate/revoke
  - OTP create/verify/expiry/attempts
- Integration tests:
  - Register → Login → Refresh → Logout
  - Request password reset → Verify/Reset → Login with new password
  - Rate limiting behavior (happy path + throttled path)
- Negative tests:
  - Invalid payloads
  - Expired OTP, invalid tokens, reused refresh token

## Operational considerations

- Env vars:
  - JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
  - ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL
  - PASSWORD_RESET_TTL_MINUTES
  - NODE_ENV, FRONTEND_ORIGIN (for CORS/cookies)
- Observability:
  - Minimal structured logging (no secrets)
- Migration:
  - Add unique email
  - Create RefreshToken, PasswordResetToken
- Rollback:
  - Keep code paths tolerant to absent tables; or plan DB rollback scripts

## Additional features to consider

- Email verification flow (verification tokens and status on User)
- “Remember me” (longer refresh TTL for opted-in sessions)
- Session management endpoints (list/revoke sessions)
- 2FA (TOTP) support
- Social login (Google OAuth) later
- Account deletion/export (privacy)
- Admin role to manage products/users
- CSRF protection if you move access tokens to cookies (currently only refresh cookie needs CORS/cookie config)

## Proposed implementation order

1) Schema changes and migrations (unique email, new tables)
2) Core services: hashing, token utilities, OTP utilities
3) Endpoints: register → login → refresh → logout
4) Password reset: request/verify/reset
5) Middleware: auth + rate limiting
6) Tests (unit + integration)
7) Wire protected routes progressively
8) Docs and environment setup guide

If this plan looks good, I can draft the schema changes and endpoint contracts in code comments next, then implement the endpoints in small, verifiable steps.