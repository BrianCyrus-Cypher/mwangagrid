# Database Schema Plan (Drizzle / MySQL)

## 1. What exists now

Current schema includes only:

- `users` table (`openId`, `name`, `email`, `loginMethod`, `role`, timestamps, `lastSignedIn`).

## 2. Required tables for full readiness

### 2.1 Products & Services

- `products`:
  - id (int/autoincrement)
  - name, sku (optional), description
  - price (decimal)
  - currency (e.g., KES)
  - stock_quantity
  - image_url (or storage key)
  - is_active
  - createdAt/updatedAt

- `services` (or `packages`):
  - id
  - title/description
  - base_price
  - tier (Basic/Standard/Premium)
  - duration/coverage fields (optional)
  - stock/availability

### 2.2 Cart and Orders

- `orders`:
  - id
  - user_id (FK users)
  - status (pending/paid/processing/shipped/completed/cancelled)
  - subtotal, total
  - delivery_location (address, city, phone)
  - payment_method (mpesa/card)
  - payment_status
  - createdAt/updatedAt

- `order_items`:
  - id
  - order_id (FK)
  - product_type (product/service)
  - product_id/service_id reference (nullable depending on type)
  - quantity
  - unit_price
  - line_total

### 2.3 Quotations

- `quotes`:
  - id
  - user_id
  - status (new/quoted/approved/rejected)
  - company_name (optional)
  - contact info
  - requirements payload
  - createdAt/updatedAt

### 2.4 Subscriptions (optional)

- `subscriptions`:
  - id
  - user_id
  - plan_id
  - status
  - start/end dates
  - createdAt/updatedAt

### 2.5 Audit/Analytics (optional but recommended)

- `events` / `activity_log`:
  - id, user_id
  - type, payload JSON
  - createdAt

## 3. Indexing rules

- Foreign keys: index `user_id`, `order_id`, `quote.user_id`
- Status fields: index `orders.status`, `quotes.status`
- Search fields: name/title indexes (or full-text)

## 4. Migration strategy

1. Add tables incrementally.
2. Run `pnpm db:push` after each schema change.
3. Seed with `server/seed-*.mjs` (review and connect to new tables).

## 5. Open questions to confirm

- Whether customers are modeled separately from `users`.
- Exact data fields needed for checkout delivery/payment.
