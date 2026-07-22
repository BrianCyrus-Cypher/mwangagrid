# Scaling & Payment Plan

## 1. Scaling

### 1.1 Backend

- Use connection pooling for MySQL.
- Add caching for frequently read catalog data.
- Consider background jobs for heavy tasks (invoice generation, batch notifications).

### 1.2 Frontend

- Avoid unnecessary refetches: stabilize query inputs.
- Lazy load heavy UI routes.

### 1.3 Data growth

- Add indexes on `orders.status`, `orders.user_id`, `quotes.status`.
- Partition strategy (later) based on order date.

## 2. Payment

### 2.1 Required capabilities

- **M-Pesa**: payment initiation, callback/webhook verification, reconciliation.
- **Card**: Payment intent / confirmation, webhook verification.

### 2.2 Order state machine

- `pending` → `payment_processing` → `paid` → `processing` → `completed`
- `payment_failed` / `cancelled`

### 2.3 Webhook security

- Verify signatures before applying state transitions.

## 3. Gaps in repo

- No payment provider integration code was identified from the visible routers/schema.
- Checkout likely uses mock/demo flows.
