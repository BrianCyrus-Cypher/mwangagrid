# Pipeline Plan (CI/CD)

## 1. Current State
- Repo has local scripts: `dev`, `build`, `start`, `test`, `check`, `db:push`.
- No CI/CD workflow files were observed in the repo overview.

## 2. CI steps (GitHub Actions example)
1. Install dependencies: `pnpm install --frozen-lockfile`
2. Lint/format check (optional if ESLint config exists)
3. Typecheck: `pnpm check`
4. Tests: `pnpm test`
5. Build: `pnpm build`

## 3. CD steps
- Deploy backend + static frontend build output.
- Run migrations before/with deploy.
- Ensure static asset pipeline for images via Manus storage.

## 4. Required secrets
- Database URL
- Manus OAuth env vars (platform-managed)
- Any payment provider secrets
- Logging/monitoring DSN

## 5. Gaps
- Missing workflow definitions (.github/workflows/*) and deployment automation.

