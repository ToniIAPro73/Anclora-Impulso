# Fase 8 — Premium Form Analysis and Voice Coaching Spec v1

## Context

Fase 8 asks for premium differentiators: asynchronous form analysis and in-session voice coaching. Real MediaPipe, Apple Vision, and TTS integrations are high-effort native/runtime work, so this phase ships safe backend contracts behind feature flags with deterministic local outputs for CI.

## Goals

- Add premium entitlement support through a `subscriptionTier` field.
- Expose premium feature status for form analysis and voice coaching.
- Create asynchronous form analysis requests with clear safety disclaimers.
- Generate deterministic in-session voice cue scripts without external TTS calls.
- Persist form analysis requests and generated voice cue sessions.
- Keep both features disabled by default.

## Non-goals

- No real video/image processing in CI.
- No MediaPipe, Apple Vision, or cloud vision dependency.
- No real audio file generation or TTS provider call.
- No billing provider integration.

## Acceptance criteria

- Free users receive 403 on premium feature execution even when feature flags are enabled.
- Premium users can create a queued form analysis request when `FORM_ANALYSIS_ENABLED=true`.
- Premium users can generate deterministic voice cues when `VOICE_COACH_ENABLED=true`.
- Responses include safety disclaimers and do not claim medical or biometric certainty.
- New endpoints are authenticated, validated with Zod, and documented in OpenAPI.
- Prisma migration is versioned and applied.
- Integration tests cover disabled flags, premium gating, form analysis, and voice cues.
