# Mwanga Grid E-Commerce Platform - Authentication Flow

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Final

---

## 1. Authentication Overview

The Mwanga Grid platform uses **OAuth 2.0** authentication via the Manus platform, providing secure, managed authentication without storing passwords directly.

### 1.1 Authentication Methods

- **Primary:** Manus OAuth (email/Google)
- **Session:** Secure HTTP-only cookies
- **Authorization:** Role-based access control (RBAC)

---

## 2. OAuth 2.0 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User's Browser                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. User clicks "Login" button                           │  │
│  │  2. Redirected to Manus OAuth Portal                     │  │
│  │  3. User enters email/password or uses Google            │  │
│  │  4. Manus validates credentials                          │  │
│  │  5. Redirected back to app with auth code               │  │
│  │  6. Session cookie set in browser                        │  │
│  │  7. User logged in, can access protected routes          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Manus OAuth Server                            │
│  - Manages user credentials                                     │
│  - Issues authentication tokens                                 │
│  - Validates session cookies                                    │
│  - Handles multi-factor authentication                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Mwanga Grid Backend                             │
│  - Receives auth code                                           │
│  - Validates with Manus                                         │
│  - Creates/updates user in database                             │
│  - Issues session cookie                                        │
│  - Handles protected API requests                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Authentication Sequence

### 3.1 Login Flow

```
User                    Browser                 Backend                 Manus OAuth
 │                        │                        │                        │
 ├─ Click Login ──────────→│                        │                        │
 │                        │                        │                        │
 │                        ├─ Redirect to ─────────────────────────────────→│
 │                        │  OAuth Portal          │                        │
 │                        │                        │                        │
 │                        │                        │  ← Redirect with ──────┤
 │                        │  ← Redirect ───────────┤     auth code          │
 │                        │     with code          │                        │
 │                        │                        │                        │
 │                        ├─ POST /api/oauth/callback ──────────────────────→│
 │                        │  (with auth code)      │                        │
 │                        │                        │                        │
 │                        │                        ├─ Validate code ───────→│
 │                        │                        │                        │
 │                        │                        │  ← Return user info ───┤
 │                        │                        │                        │
 │                        │                        ├─ Create/Update user ──→│
 │                        │                        │  in database           │
 │                        │                        │                        │
 │                        │  ← Set session cookie ─┤                        │
 │                        │                        │                        │
 │ ← Logged in ───────────┤                        │                        │
 │  (redirect to home)    │                        │                        │
```

### 3.2 Protected API Request Flow

```
User                    Browser                 Backend                 Database
 │                        │                        │                        │
 ├─ Request data ────────→│                        │                        │
 │  (e.g., /products)    │                        │                        │
 │                        │                        │                        │
 │                        ├─ GET /api/trpc/products.list ──────────────────→│
 │                        │  (with session cookie) │                        │
 │                        │                        │                        │
 │                        │                        ├─ Validate session ────→│
 │                        │                        │                        │
 │                        │                        ├─ Query products ──────→│
 │                        │                        │                        │
 │                        │                        │  ← Product data ───────┤
 │                        │                        │                        │
 │                        │  ← JSON response ──────┤                        │
 │                        │                        │                        │
 │ ← Display data ────────┤                        │                        │
```

### 3.3 Logout Flow

```
User                    Browser                 Backend
 │                        │                        │
 ├─ Click Logout ────────→│                        │
 │                        │                        │
 │                        ├─ POST /api/trpc/auth.logout ──────────────────→│
 │                        │  (with session cookie) │
 │                        │                        │
 │                        │                        ├─ Clear session cookie ─→│
 │                        │                        │                        │
 │                        │  ← Clear cookie ───────┤                        │
 │                        │                        │                        │
 │ ← Redirected to home ──┤                        │                        │
 │  (logged out)          │                        │                        │
```

---

## 4. Session Management

### 4.1 Session Cookie Configuration

```javascript
{
  name: '__session',
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
  secure: true,                        // HTTPS only
  httpOnly: true,                      // Not accessible from JavaScript
  sameSite: 'none',                    // Cross-site requests allowed
  path: '/',
  domain: '.manus.space'               // Subdomain sharing
}
```

### 4.2 Session Lifecycle

1. **Creation:** User logs in via OAuth
2. **Validation:** Each request validates session cookie
3. **Refresh:** Session extended on each request
4. **Expiration:** 30 days of inactivity
5. **Revocation:** User clicks logout

### 4.3 Session Storage

- **Client:** Secure HTTP-only cookie (browser storage)
- **Server:** Session data in database (future: Redis)
- **Validation:** JWT token verification

---

## 5. Role-Based Access Control (RBAC)

### 5.1 User Roles

| Role          | Permissions                                 | Routes                                         |
| ------------- | ------------------------------------------- | ---------------------------------------------- |
| **Anonymous** | Browse products, view services              | `/`, `/products`, `/services`, `/contact`      |
| **User**      | All anonymous + create orders, view account | `/cart`, `/checkout`, `/account`, `/quotation` |
| **Admin**     | All user + manage inventory, view analytics | `/admin`                                       |

### 5.2 Role Assignment

- **Default:** New users get `user` role
- **Admin Promotion:** Manual database update by super-admin
- **Owner:** User with `openId` matching `OWNER_OPEN_ID` env var gets `admin` role

### 5.3 Protected Procedure Example

```typescript
// Only authenticated users can access
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

// Only admins can access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
```

---

## 6. User Context & Middleware

### 6.1 Context Building

```typescript
// server/_core/context.ts
export async function createContext(opts: {
  req: express.Request;
  res: express.Response;
}) {
  // Extract session from cookie
  const sessionCookie = opts.req.cookies["__session"];

  // Validate session with Manus OAuth
  const user = await validateSession(sessionCookie);

  return {
    user, // null if not authenticated
    req: opts.req,
    res: opts.res,
  };
}
```

### 6.2 Authentication Middleware

```typescript
// server/_core/oauth.ts
export async function validateSession(cookie: string) {
  if (!cookie) return null;

  try {
    // Verify JWT token
    const payload = await verifyJWT(cookie);

    // Get user from database
    const user = await getUserByOpenId(payload.openId);

    return user || null;
  } catch (error) {
    return null;
  }
}
```

---

## 7. OAuth Callback Handler

### 7.1 Callback Implementation

```typescript
// server/_core/oauth.ts
export async function handleOAuthCallback(
  req: express.Request,
  res: express.Response
) {
  try {
    // Extract auth code from query params
    const { code, state } = req.query;

    // Validate state (CSRF protection)
    if (!validateState(state as string)) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for token
    const token = await exchangeCodeForToken(code as string);

    // Get user info from token
    const userInfo = await getUserInfoFromToken(token);

    // Create/update user in database
    await upsertUser({
      openId: userInfo.openId,
      email: userInfo.email,
      name: userInfo.name,
      loginMethod: "oauth",
      lastSignedIn: new Date(),
    });

    // Set session cookie
    res.cookie("__session", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    // Redirect to home
    res.redirect("/");
  } catch (error) {
    res.redirect("/login?error=auth_failed");
  }
}
```

---

## 8. Frontend Authentication Hooks

### 8.1 useAuth Hook

```typescript
// client/src/_core/hooks/useAuth.ts
export function useAuth() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation();

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: () => logout.mutate(),
  };
}
```

### 8.2 Protected Route Component

```typescript
// client/src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return children;
}
```

### 8.3 Login URL Generation

```typescript
// client/src/const.ts
export function getLoginUrl(returnPath?: string) {
  const state = encodeURIComponent(
    JSON.stringify({
      origin: window.location.origin,
      returnPath: returnPath || "/",
    })
  );

  return `${OAUTH_PORTAL_URL}?state=${state}`;
}
```

---

## 9. Security Best Practices

### 9.1 Password Security

- Passwords never transmitted to Mwanga Grid backend
- OAuth provider (Manus) handles password encryption
- Bcrypt hashing for any local passwords (future)

### 9.2 Session Security

- Secure cookies (HTTPS only)
- HttpOnly flag (prevents JavaScript access)
- SameSite=None (allows cross-site requests for OAuth)
- 30-day expiration (automatic logout)

### 9.3 Token Security

- JWT tokens signed with secret key
- Token validation on every request
- Token refresh on each request (sliding window)
- Token revocation on logout

### 9.4 CSRF Protection

- State parameter in OAuth flow
- CSRF tokens in forms (future)
- SameSite cookie attribute

---

## 10. Error Handling

### 10.1 Authentication Errors

| Error             | Cause                    | Resolution                      |
| ----------------- | ------------------------ | ------------------------------- |
| `UNAUTHORIZED`    | No session cookie        | Redirect to login               |
| `FORBIDDEN`       | Insufficient permissions | Show error message              |
| `SESSION_EXPIRED` | Session timeout          | Redirect to login               |
| `INVALID_TOKEN`   | Token validation failed  | Clear cookie, redirect to login |

### 10.2 Error Response Format

```typescript
{
  code: 'UNAUTHORIZED',
  message: 'You must be logged in to access this resource',
  status: 401
}
```

---

## 11. Testing Authentication

### 11.1 Unit Tests

```typescript
describe("Authentication", () => {
  it("should validate session cookie", async () => {
    const cookie = generateTestJWT();
    const user = await validateSession(cookie);
    expect(user).toBeDefined();
    expect(user.role).toBe("user");
  });

  it("should reject invalid session", async () => {
    const user = await validateSession("invalid-token");
    expect(user).toBeNull();
  });
});
```

### 11.2 E2E Tests

```typescript
describe("Login Flow", () => {
  it("should login user via OAuth", async () => {
    await page.goto("/");
    await page.click("text=Login");
    // Simulate OAuth callback
    await page.goto("/?code=test-code");
    // Verify logged in
    await expect(page).toHaveURL("/");
    await expect(page).toContainText("Logout");
  });
});
```

---

## 12. Multi-Factor Authentication (Future)

### 12.1 MFA Implementation (Phase 2)

- SMS-based OTP
- Email-based OTP
- TOTP (Google Authenticator)
- Backup codes

### 12.2 MFA Flow

1. User enters email/password
2. System sends OTP to phone/email
3. User enters OTP
4. Session created
5. User logged in

---

## 13. Social Login (Future)

### 13.1 Supported Providers

- Google OAuth
- GitHub OAuth
- Facebook OAuth
- Apple Sign In

### 13.2 Implementation

- Use Manus OAuth as aggregator
- Unified user profile across providers
- Email as primary identifier

---

## 14. Troubleshooting

### 14.1 Common Issues

| Issue                       | Cause                   | Solution                         |
| --------------------------- | ----------------------- | -------------------------------- |
| Login button not working    | OAuth URL misconfigured | Check `OAUTH_SERVER_URL` env var |
| Session expires too quickly | Cookie maxAge too short | Increase to 30 days              |
| CORS errors on login        | Domain mismatch         | Verify domain configuration      |
| Cannot access admin routes  | Role not set to admin   | Promote user in database         |

### 14.2 Debug Mode

```typescript
// Enable debug logging
localStorage.setItem("debug", "auth:*");
```

---

**Document End**
