# Fase 8 — Premium Form Analysis and Voice Coaching

## Scope

- Added premium entitlement support with `subscriptionTier`.
- Added asynchronous form-analysis request contracts.
- Added deterministic script-only voice coaching cues.
- Kept MediaPipe, Apple Vision, cloud vision, and TTS execution out of CI behind feature flags.
- Added OpenAPI documentation and frontend API helpers.

## Implementation

- Prisma migration: `backend/prisma/migrations/20260714200000_add_premium_form_voice/migration.sql`.
- Backend endpoints:
  - `GET /api/premium/status`
  - `POST /api/premium/form-analysis`
  - `POST /api/premium/voice-cues`
- Feature flags:
  - `FORM_ANALYSIS_ENABLED=false`
  - `VOICE_COACH_ENABLED=false`
- Entitlement:
  - `subscriptionTier=free` is blocked.
  - `subscriptionTier=premium` and `subscriptionTier=pro` are allowed when the matching feature flag is enabled.

## Validation

- `cd backend && npm run prisma:generate` — passed.
- `cd backend && PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npm run prisma:deploy` — passed.
- `cd backend && npm run test:ci -- --runTestsByPath tests/integration/premium-form-voice.test.ts --watch=false` — passed, 4/4 Fase 8 tests.
- `npm run lint` — passed.
- `npm run test:ci -- --watch=false` — passed, 27/27 frontend tests.
- `cd backend && npm run test:ci -- --watch=false` — passed, 32/32 backend tests.
- `cd backend && npm run typecheck && npm run build` — passed.
- `npm run typecheck && npm run build` — passed.

## Notes

- Form analysis is queued and stores deterministic safety feedback. It does not claim biomechanical certainty.
- Voice coaching returns script-only cues. No audio file or third-party TTS call is generated.
- Both features include safety disclaimers and premium gating.
