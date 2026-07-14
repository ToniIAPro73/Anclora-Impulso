# Fase 3 Dynamic Progression Engine Spec v1

## Objective

Turn static workout recommendations into adaptive prescriptions that react to real training performance.

## Scope

- Persist an exercise progression state per user and exercise.
- Compute next weight, rep range, target RIR, deload decisions, and recovery/freshness flags with pure deterministic functions.
- Support linear and DUP periodization.
- Expose `POST /api/v1/progression/next-session`.
- Cover the engine and endpoint with deterministic tests.

## Acceptance criteria

- Completing every set at the top of the target range increases weight with the expected increment.
- Sets inside the target range keep weight and recommend the next rep target.
- Failing below minimum reps at RIR 0 increments stalls and does not increase load.
- Three consecutive stalls trigger deload with 10% load reduction and one-third volume reduction.
- Low muscle freshness marks planned exercises for substitution or reduction.
- DUP session indexes 0, 1 and 2 return strength, hypertrophy and endurance schemes.
- The endpoint returns typed session plan prescriptions and persists state updates.

## Out of scope

- Wearable HRV/readiness integration.
- Full workout generator rewrite.
- Frontend scheduling UI.
