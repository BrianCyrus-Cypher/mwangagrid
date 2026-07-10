# PRD (Product Requirements Document) — tunnelnet_ecommerce

> Source of truth: repo scope is a “Tunnelnet/Mwanga Grid e-commerce platform” with products/services, cart, checkout, quotations, account, and admin dashboard.
>
> Note: this PRD is inferred from existing pages/components and repository docs; validate against product stakeholders.

## 1. Problem Statement
Customers need an easy way to browse solar/CCTV/network solutions, add items to cart, request quotes, and complete checkout. Admin needs visibility into orders, customers, and inventory.

## 2. Goals
- Provide a public storefront: Home, Products, Services, Cart, Checkout, Quotation, Contact.
- Provide authenticated user capabilities: Account page (orders/subscriptions/support).
- Provide admin dashboard with analytics and operational views.
- Support basic payment selection (M-Pesa/Card) and quotation workflow.

## 3. Non-Goals (for this iteration)
- Full payment processing integration (Stripe/M-Pesa API) if not yet implemented.
- Advanced fulfillment/warehouse management.
- Complex ERP integrations.

## 4. Users & Roles
- **Guest**: browses catalog, requests quotes.
- **User**: cart/checkout, account features.
- **Admin**: inventory management, order/customer analytics.

## 5. User Journeys
### 5.1 Browse → Product list → Product modal
- User lands on `/`.
- Navigates to `/products` and views items.
- Opens product modal (if implemented).

### 5.2 Add to Cart → Checkout
- User adds product/service to cart.
- Reviews Cart.
- Proceeds to Checkout and selects delivery/payment method.

### 5.3 Request Quote
- User goes to `/quotation`.
- Submits quote request with required details.

### 5.4 Admin Operations
- Admin accesses `/admin` pages.
- Views sales analytics, recent orders, customers, inventory.

## 6. Functional Requirements
### 6.1 Catalog
- List products/services with images, descriptions, pricing.
- Client-side filtering/search (optional).

### 6.2 Cart
- Add/remove/update quantity.
- Persist cart state for the session.
- Compute totals (subtotal, tax/shipping if any).

### 6.3 Checkout
- Collect delivery location/details.
- Payment method selection (M-Pesa/Card).
- Order confirmation screen.

### 6.4 Quotations
- Custom quote form.
- Admin receives/approves requests.

### 6.5 Account
- Order history.
- Subscription view (if used).
- Support ticket/inquiry form.

### 6.6 Admin Dashboard
- Sales analytics charts.
- Recent orders table.
- Customer management.
- Inventory overview.

## 7. Metrics / KPIs
- Conversion: cart → checkout.
- Checkout completion rate.
- Quote request submission rate.
- Admin operational metrics: time-to-respond quotes, order processing time.

## 8. Risks
- Payment provider integration may be incomplete.
- Deployment env configuration may be missing.
- Database schema may not include all required entities.

## 9. Acceptance Criteria (examples)
- Users can complete end-to-end flows in staging.
- Admin role gates dashboard routes.
- Orders/quotes persist correctly.
- No runtime errors in production build.

