# tunnelnet_ecommerce — Run & Deployment Guide

## 1) What this project is

A full-stack TypeScript app:

- **Frontend (React + Vite)** in `client/`
- **Backend (Express + tRPC)** in `server/`
- **Shared types/constants** in `shared/`
- **Database (MySQL)** via **Drizzle ORM** in `drizzle/`

Authentication uses **Manus OAuth** with session cookies; RPC endpoints live under `/api/trpc`.

---

## 2) Prerequisites

- **Node.js** (for local dev)
- **pnpm** (repo uses `pnpm-lock.yaml` and scripts assume pnpm)
- A **MySQL** database and a connection string for local DB migrations/seeding
- Manus/OAuth-related environment variables (provided by your platform in production)

---

## 3) Install dependencies

From repo root (`c:/Users/User/tunnelnet_ecommerce`):

```bash
pnpm install
```

---

## 4) Local development

### 4.1 Start dev server

```bash
pnpm dev
```

This runs:

- `tsx watch server/_core/index.ts`

### 4.2 Build-to-run behavior

The repo has both a frontend build and a backend bundle:

- `vite build` outputs to: `dist/public/`
- backend entry is bundled into: `dist/`

---

## 5) Database schema + migrations

Drizzle is used for schema and migrations.

### 5.1 Push schema/migrations

```bash
pnpm db:push
```

This runs:

- `drizzle-kit generate`
- `drizzle-kit migrate`

Relevant files:

- `drizzle/schema.ts` (tables)
- `drizzle/migrations/` (generated migrations)

---

## 6) Tests / typecheck

### 6.1 Run tests

```bash
pnpm test
```

Uses **Vitest**.

### 6.2 Typecheck

```bash
pnpm check
```

Uses `tsc --noEmit`.

---

## 7) Production build + start

### 7.1 Build

```bash
pnpm build
```

Runs:

- `vite build`
- `esbuild server/_core/index.ts ... --outdir=dist`

### 7.2 Start

```bash
pnpm start
```

Runs:

- `node dist/index.js`

---

## 8) Architecture by area (languages + tools)

### Frontend (client/)

**Languages/stack**

- **TypeScript** (`.tsx`)
- **React 19**
- **Vite** for bundling
- **Tailwind CSS** + shadcn/ui components
- **wouter** for routing
- **@tanstack/react-query** for data fetching
- **tRPC React Query** for typed RPC calls

**Key files**

- `client/src/main.tsx` — React bootstrap + tRPC client + QueryClient
- `client/src/App.tsx` — route setup
- `client/src/pages/*` — page components (Home, Cart, Products, Checkout, AdminDashboard, etc.)
- `client/src/components/*` — reusable UI
- `client/src/_core/hooks/useAuth.ts` — auth state + logout

**Auth details**

- `useAuth()` calls `trpc.auth.me.useQuery()`.
- If a tRPC error indicates unauthorized, `main.tsx` redirects to `getLoginUrl()`.
- Logout calls `trpc.auth.logout` (clears server cookie) and clears demo state.

### Backend (server/)

**Languages/stack**

- **TypeScript**
- **Express 4**
- **tRPC server**
- **SuperJSON** transformer

**Key files**

- `server/_core/index.ts` — server entry (wired by `pnpm dev`)
- `server/routers.ts` — `appRouter` composition (auth + system router)
- `server/_core/trpc.ts` — tRPC configuration (server-side)
- `server/db.ts` — DB query helpers

### Database (drizzle/)

- **Drizzle ORM** with **MySQL driver** (`mysql2`)
- Migrations and schema in `drizzle/`

### Shared (shared/)

- Shared **constants and types** used by both client and server.

---

## 9) Where static assets go

Frontend build output is served from:

- `dist/public/`

Notes:

- There is `client/public/` for small static files (HTML template references, etc.)
- Images/media should be handled via the app’s storage workflow (see below).

---

## 10) Manus storage / file handling

The codebase includes a storage abstraction in `server/storage.ts`.

Expected workflow (high level):

- Client uploads file bytes to backend (or triggers backend upload)
- Backend stores bytes via the storage helper
- Frontend uses returned `/manus-storage/...` URLs directly

---

## 11) Deployment & Production Automation

The repository is fully configured for production deployment using Docker and GitHub Actions.

### Environment Variable Checklist

For production, the following environment variables **must** be provided to the container or deployment platform:

- `NODE_ENV=production`
- `PORT=3000` (or whatever your target port is)
- `DATABASE_URL` (production MySQL connection string)
- `JWT_SECRET` (secure random string)
- Any required third-party keys (e.g., `STRIPE_SECRET_KEY`, `SMTP_HOST`, `CLOUDINARY_API_KEY`)

### Docker Build & Run

A multi-stage `Dockerfile` is included to build and serve the app securely and efficiently.

To build the image locally:

```bash
docker build -t tunnelnet-ecommerce .
```

To run the container locally for testing production behavior:

```bash
docker run -p 3000:3000 --env-file .env.example tunnelnet-ecommerce
```

### CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) is included. It automatically runs on push and pull requests to `main`, performing:

1. Dependency Installation
2. Typechecking (`pnpm check`)
3. Automated Tests (`pnpm test`)
4. Full Application Build (`pnpm build`)

### Database Migrations in Production

Before the application starts serving traffic against a new database schema, run the migrations:

```bash
pnpm db:push
```

_Note: In a robust CI/CD setup, this step might be done in an init container, a release phase, or run manually depending on your database strategy._

---

## 12) Recommended “release checklist” (manual)

Before you cut a release:

1. `pnpm check`
2. `pnpm test`
3. `pnpm db:push` (if schema changed)
4. `pnpm build`
5. `pnpm start` locally and verify:
   - login/logout
   - cart/checkout flows
   - admin-only pages (role gating)

---

## 13) Scripts reference (from package.json)

- `pnpm dev` — watch `server/_core/index.ts`
- `pnpm build` — `vite build` + bundle server into `dist/`
- `pnpm start` — `node dist/index.js`
- `pnpm check` — `tsc --noEmit`
- `pnpm test` — `vitest run`
- `pnpm db:push` — Drizzle generate + migrate
