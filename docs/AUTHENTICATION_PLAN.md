# Authentication Plan

## 1. Current State

- Auth is fully handled by a **Local Email & Password** system.
- Session cookie (`tunnelnet_session`) is used to persist authentication.
- Passwords are securely hashed using `scrypt`.
- Registration, login, and session validation happen entirely within `server/routers.ts` and `server/auth.ts`.
- Replaced previous mock demo-mode authentication and partial Supabase integration.

## 2. Security Details

- Passwords are salted and hashed using Node's native `crypto.scryptSync`.
- Session tokens are random 32-byte hex strings.
- Sessions are stored in the database (`sessions` table) and their hash is verified against the database record to prevent token spoofing.
- The `TRPC` context uses the cookie header to retrieve the session token and look up the current user.

## 3. Route protection

- `protectedProcedure` and `adminProcedure` are used across non-public procedures to restrict access based on session validation.
- On unauthorized API errors, frontend redirects to `/auth`.

## 4. Gaps & Future Improvements

- Email verification and password reset flows are not yet implemented. They can be added leveraging the `verificationToken` and `resetToken` columns already present in the `users` table.
- 2FA is supported by the database schema but lacks frontend and backend integration.
