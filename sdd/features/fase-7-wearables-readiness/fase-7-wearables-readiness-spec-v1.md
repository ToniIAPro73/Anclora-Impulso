# Fase 7 — Wearables Readiness Spec v1

## Context

Fase 7 requires native app and deep wearable integration, but the entry condition depends on traction data that is not available in this repository. The conservative implementation is to prepare backend contracts, persistence, and progression readiness integration behind feature flags.

## Goals

- Expose a wearable integration status contract for mobile/native clients.
- Persist wearable provider connections without storing provider secrets.
- Persist recovery samples from HealthKit, Health Connect, Garmin, Whoop, Oura, or manual test imports.
- Compute deterministic readiness from HRV, resting heart rate, sleep, and activity.
- Feed latest readiness into the Fase 3 progression engine.
- Keep external sync disabled by default and avoid third-party API calls in CI.

## Non-goals

- No native app implementation in this web repository.
- No OAuth token exchange or provider API calls.
- No raw device token storage.

## Acceptance criteria

- Wearable status returns disabled by default and documents the traction gate.
- With `WEARABLE_SYNC_ENABLED=true`, a user can upsert a provider connection and ingest a recovery sample.
- Readiness scores below 50 reduce/substitute planned training in `POST /api/v1/progression/next-session`.
- New endpoints are authenticated, validated with Zod, and documented in OpenAPI.
- Prisma migration is versioned and applied.
- Deterministic integration tests cover the status, connection, recovery sample, and progression readiness flow.
