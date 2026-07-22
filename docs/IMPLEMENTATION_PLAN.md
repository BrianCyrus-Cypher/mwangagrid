# Implementation Plan (Step-by-step)

## Phase A — Foundation (required)

1. Extend `drizzle/schema.ts` to include products/services/orders/order_items/quotes.
2. Add migrations and run `pnpm db:push`.
3. Implement DB query helpers in `server/db.ts` for each entity.
4. Add tRPC procedures in `server/routers.ts` (or split into feature routers):
   - products: list, details
   - services: list, details
   - orders: create, fetch my orders (user), list orders (admin)
   - quotes: create, list (admin)
   - admin: inventory summary, analytics

## Phase B — UI integration

1. Update pages to call new tRPC procedures:
   - Products, Services, Cart, Checkout, Quotation, Account, AdminDashboard.
2. Ensure CartContext integrates with backend order creation.

## Phase C — Payment

1. Integrate real payment provider flows (M-Pesa/Card).
2. Add webhook endpoints and order status transitions.

## Phase D — Hardening & observability

1. Add validation for all procedure inputs.
2. Add monitoring (Sentry/logging) and dashboards.
3. Add rate limiting.

## Phase E — Deployment readiness

1. Create deployment env checklist.
2. Ensure migration + seed scripts for production.

## Delivery definition

- All flows work end-to-end in staging with real DB records.
- Admin role gates and data is correct.
- Build passes and tests pass.
