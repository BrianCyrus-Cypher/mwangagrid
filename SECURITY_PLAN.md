# Security Plan

## 1. Threat Model (high level)
- Unauthorized access to admin/orders/customer data.
- Session/cookie theft and CSRF-like issues.
- Injection attacks via unvalidated inputs.
- Payment fraud attempts.

## 2. Current state (what we can infer)
- Cookies exist and are cleared correctly.
- Auth context is derived server-side for tRPC.

## 3. Required security hardening steps
### 3.1 Backend hardening
- Add input validation per procedure (use `zod` / robust checks).
- Add rate limiting for auth and checkout/quote submissions.
- Ensure all admin-only procedures check `ctx.user.role === 'admin'`.

### 3.2 Cookie/security headers
- Verify cookie flags:
  - `httpOnly`, `secure`, `sameSite=None` on cross-site flows.
- Add security headers via express middleware (helmet) if not already configured in `_core`.

### 3.3 Payments
- Verify payment webhooks with provider signature.
- Ensure order status updates only after verified webhooks.

### 3.4 Data protection
- Never return secrets.
- Use parameterized DB queries (Drizzle does this for most cases).

## 4. Gaps
- No explicit mention of helmet/rate-limit/CSRF/validation in the visible feature routers yet (may live in server/_core).
- Checkout/payment procedures not implemented yet.

