# UI/UX Design Plan

## 1. Current UX primitives in repo
- Tailwind 4 + shadcn/ui component library.
- Theme provider supports light mode and a dark mode option (ThemeContext + CSS variables).
- Reusable layout components exist: `SiteLayout`, `DashboardLayout`.

## 2. Recommended UX structure for e-commerce
### 2.1 Public pages
- Consistent top navigation + footer.
- Product cards with clear price + CTA.
- Cart drawer/page with sticky order summary.

### 2.2 Checkout UX
- Step-based or progressive form:
  1) delivery details
  2) payment method
  3) confirm
- Strong validation and helpful error messages.
- Display order summary and total clearly.

### 2.3 Admin UX
- Sidebar navigation using `DashboardLayout`.
- Analytics page: revenue trends, orders trend, top products.
- Tables with filtering and status update actions.

## 3. Accessibility
- Use semantic HTML, ARIA labels, keyboard navigation.
- Ensure contrast in both themes.

## 4. Gaps
- Current pages may be placeholders; ensure each page is wired to real data and includes loading/empty/error states.

