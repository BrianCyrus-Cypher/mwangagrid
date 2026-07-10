# Monitoring & Observability Plan

## 1. What to monitor
- API request latency (p95)
- Error rate (tRPC errors and backend errors)
- Auth failures / unauthorized redirects
- Order creation failure counts
- Payment webhook success/failure

## 2. Tooling suggestions
- **Sentry** for frontend + backend exceptions.
- Structured logging (pino/winston) in backend.
- Health endpoint for liveness/readiness (consider implementing `/api/health`).

## 3. Alerts
- Payment webhook failures above threshold.
- DB connection failures.
- Increased 4xx/5xx on checkout and admin routes.

## 4. Gaps
- No monitoring configuration files are present in the repo overview.

