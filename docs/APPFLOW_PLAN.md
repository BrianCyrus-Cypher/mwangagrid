# AppFlow Plan (User Flows & Integration Points)

> Focus: ensure UI pages map to working backend procedures and persistence.

## 1. Public Storefront

### 1.1 Home `/`

- Show hero + featured products/services.
- CTA links into `/products` and `/services`.

### 1.2 Products `/products`

- Fetch products list.
- Filters/search (optional).
- Add to cart from product cards.

### 1.3 Services `/services`

- Fetch service tiers.
- “Select plan” button adds to cart.

### 1.4 Cart `/cart`

- Read CartContext state.
- Show quantity controls.
- Compute totals.
- Proceed to `/checkout`.

### 1.5 Checkout `/checkout`

- Form: delivery location/details.
- Payment method selection: M-Pesa / Card.
- Create order (backend) and show confirmation.

### 1.6 Quotation `/quotation`

- Quote request form.
- Submit quote (backend).
- Show submission confirmation.

### 1.7 Contact `/contact`

- Inquiry/support form.

## 2. Authenticated Areas

### 2.1 Account `/account`

- Order history
- Subscription info
- Support ticket form

### 2.2 Admin Dashboard `/admin/*`

- Role gate: only `admin` role
- Pages:
  - sales analytics
  - recent orders
  - customers
  - inventory overview

## 3. Integration Points in Code

- `client/src/lib/trpc.ts` + tRPC provider in `client/src/main.tsx`
- `client/src/_core/hooks/useAuth.ts` for auth state
- `client/src/contexts/CartContext.tsx` for cart state
- Backend should expose tRPC procedures in `server/routers.ts` (and later split into feature routers)

## 4. Gaps to close for full readiness

- tRPC procedures for products/services/orders/quotes are currently not implemented (only `auth` exists in `server/routers.ts`).
