# TRD (Technical Requirements Document)

> This TRD maps the PRD to concrete implementation areas in this repo.

## 1. Current Architecture Summary

- **Frontend**: React 19 + Vite + Tailwind + shadcn/ui + wouter routing.
- **Backend**: Express + tRPC; auth via Manus OAuth/session cookie; RPC under `/api/trpc`.
- **DB**: MySQL with Drizzle ORM and migrations in `drizzle/`.

## 2. Core APIs (tRPC procedures)

### 2.1 Auth

- `auth.me` (public query returning ctx.user)
- `auth.logout` (clears session cookie)

### 2.2 Storefront

- Products: list, details
- Services: list, details
- Cart: client-side state + persistence (if needed)
- Checkout: create order, finalize payment intent (if integrated)
- Quotation: create quote request

### 2.3 Admin

- Analytics: orders/revenue summary, top products
- Inventory: stock levels
- Customers: list/details
- Orders: list/details/status update

## 3. Data Model Requirements (entities)

Expected entities for a full e-commerce system:

- users (already present)
- products
- services / packages
- orders
- order_items
- customers (may be same as users)
- quotes
- quote_items (optional)
- subscriptions (optional)

## 4. Payments (implementation-dependent)

- Payment selection supports **M-Pesa** and **Card**.
- For production: needs provider integration + webhook handling.

## 5. Non-functional Requirements

- Build must pass `pnpm check` and `pnpm test`.
- Security: cookie/session handling must be safe.
- Performance: avoid infinite query loops (stabilize query inputs).

## 6. Deliverables

- Complete missing tRPC procedures for orders/quotes/inventory.
- DB schema extends beyond `users`.
- UI pages connect to real data.
- CI/CD + deployment hardening.
