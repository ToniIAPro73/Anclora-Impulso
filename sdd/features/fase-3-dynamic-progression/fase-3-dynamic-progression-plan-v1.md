# Fase 3 Dynamic Progression Engine Plan v1

## Steps

1. Add Prisma schema and migration for `ExerciseProgressionState`.
2. Add Zod request/response contracts.
3. Implement pure engine functions under `backend/src/services/progression/`.
4. Add persistence orchestration that loads/creates state and writes updated state.
5. Add controller and route for `POST /api/v1/progression/next-session`.
6. Add deterministic unit and integration tests.
7. Update API docs and frontend API types.
8. Validate with backend/frontend typecheck, lint, build and targeted tests.

## Constraints

- Keep engine functions pure and deterministic.
- Do not hardcode secrets or production infrastructure.
- Keep code and technical docs in English.
