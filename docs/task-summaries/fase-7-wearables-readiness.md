# Fase 7 — Wearables Readiness

## Scope

- Prepared native/wearable integration contracts because D30 retention traction is not available in the repository.
- Added wearable provider status, connection metadata, recovery samples, and deterministic readiness scoring.
- Integrated latest readiness into the Fase 3 progression engine so low readiness can reduce/substitute training.
- Kept external provider sync disabled by default behind feature flags.

## Implementation

- Prisma migration: `backend/prisma/migrations/20260714192000_add_wearables_readiness/migration.sql`.
- Backend endpoints:
  - `GET /api/wearables/status`
  - `PUT /api/wearables/connections/:provider`
  - `POST /api/wearables/recovery-samples`
  - `GET /api/wearables/readiness`
- Progression integration:
  - `POST /api/v1/progression/next-session` accepts optional readiness input.
  - If no readiness input is provided, the service uses the latest stored recovery sample when `WEARABLE_READINESS_ENABLED=true`.
- Frontend client helper: `wearablesApi` in `lib/api/index.ts`.

## Validation

- `cd backend && npm run prisma:generate` — passed.
- `cd backend && PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npm run prisma:deploy` — passed.
- `cd backend && npm run test:ci -- --runTestsByPath tests/integration/wearables-readiness.test.ts --watch=false` — passed, 3/3 Fase 7 tests.
- `npm run lint` — passed.
- `npm run test:ci -- --watch=false` — passed, 27/27 frontend tests.
- `cd backend && npm run test:ci -- --watch=false` — passed, 28/28 backend tests.
- `cd backend && npm run typecheck && npm run build` — passed.
- `npm run typecheck && npm run build` — passed.

## Feature flags

- `WEARABLE_SYNC_ENABLED=false` by default.
- `WEARABLE_READINESS_ENABLED=false` by default.

## Notes

- No provider tokens, OAuth secrets, native device tokens, or third-party API calls are stored or executed.
- Native app implementation remains blocked until traction is validated; this phase exposes the backend contracts needed by a future native or React Native client.
