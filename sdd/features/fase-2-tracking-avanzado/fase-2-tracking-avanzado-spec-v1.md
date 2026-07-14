# Fase 2 Advanced Tracking and Progress Spec v1

## Context

The product already records workout sessions with sets, reps, and weight. Fase 2 requires richer set logging and derived strength progress metrics.

## Goal

Capture detailed strength set data and expose deterministic progress metrics for total volume, muscle volume, personal records, and estimated one-rep max.

## Scope

- Extend session sets with optional RIR, RPE, and rest seconds.
- Persist personal records per user and exercise.
- Persist muscle volume snapshots per session.
- Expose a backend progress endpoint with derived strength metrics.
- Show the advanced metrics in the existing progress UI.

## Out of Scope

- Full adaptive progression engine; planned for Fase 3.
- Wearable readiness or HRV.
- Rewriting the active workout experience.

## Acceptance Criteria

- `POST /api/sessions` accepts reps, weight, RIR, RPE, and rest seconds per set.
- Completing a session persists personal record updates for best weight and estimated 1RM.
- Completing a session persists muscle volume by exercise muscle group.
- `GET /api/progress/strength` returns total volume, personal records, muscle volume, and recent set logs.
- Existing progress complete response includes the advanced strength payload.
- Tests cover session logging and derived metrics.
