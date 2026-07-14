# Fase 0 Stabilization, CI, and Baseline Audit Spec v1

## Context

`Prompt_Maestro_Anclora_Impulso_CODEX.md` starts with Fase 0 before feature work. The current repository rules require SDD artifacts and development branch workflow, so this spec adapts the prompt to the active project contract.

## Goal

Make the current baseline auditable and safer before implementing later product phases.

## Scope

- Record a read-only inventory of implemented, partial, and absent modules.
- Keep CI focused on lint, typecheck, tests, migrations, and production builds for frontend and backend.
- Align frontend and backend environment examples with local/CI setup.
- Verify the existing authentication hardening with deterministic backend tests.
- Add a reproducible setup script for local test dependencies and Prisma migrations.

## Out of Scope

- Changing the branch model to `master`.
- Pushing commits directly.
- Replacing JWT refresh-token architecture with persisted/revocable refresh sessions.
- Implementing later prompt phases.

## Acceptance Criteria

- A module inventory exists for auth, workouts, exercise library, nutrition, meal plans, progress, achievements, and gamification.
- The primary CI workflow runs backend migrations, backend tests, backend build, frontend lint, frontend typecheck, frontend tests, and frontend build.
- `.env` examples include variables used by the current services without secrets.
- Auth tests cover password hashing, login failure, token refresh, protected route access, and auth rate limiting.
- Setup script installs dependencies and can start/apply a PostgreSQL-backed test database when Docker is available.

## Risks

- Backend integration tests require a working `DATABASE_URL`.
- Full refresh-token revocation needs a new persistence model and should be handled in a dedicated security spec.
