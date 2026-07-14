# Fase 0 Module Inventory

## Summary

Read-only inventory generated from the current repository state while implementing `Prompt_Maestro_Anclora_Impulso_CODEX.md`.

| Module | Status | Evidence |
| --- | --- | --- |
| Auth | Implemented, partial hardening | `backend/src/services/auth.service.ts`, `backend/src/routes/auth.routes.ts`, bcrypt password hashing, access/refresh JWTs, auth route rate limit. Refresh tokens are stateless and not revocable yet. |
| Workouts | Implemented baseline | `backend/src/controllers/workouts.controller.ts`, `backend/src/services/workouts.service.ts`, Prisma `Workout` and `WorkoutExercise`. |
| Exercise library | Implemented baseline | `backend/src/controllers/exercises.controller.ts`, `backend/src/services/exercises.service.ts`, Prisma `Exercise`, seed/import scripts. |
| Nutrition | Implemented baseline | `backend/src/controllers/nutrition.controller.ts`, `backend/src/services/nutrition.service.ts`, Prisma nutrition models and recipe library import scripts. |
| Meal plans | Implemented baseline | Prisma `MealPlan`, `Meal`, `MealRecipe`, meal swap history, nutrition service routes. |
| Progress | Implemented baseline | `backend/src/controllers/progress.controller.ts`, `backend/src/services/progress.service.ts`, Prisma `BodyMeasurement`. Advanced strength metrics are not implemented yet. |
| Achievements | Implemented baseline | Prisma `Achievement`, `UserAchievement`, `XPEvent`, seed achievements. |
| Gamification | Implemented baseline | `backend/src/controllers/gamification.controller.ts`, `backend/src/services/gamification.service.ts`, Prisma `UserGamification`. |
| Engagement notifications | Implemented baseline | `backend/src/controllers/engagement.controller.ts`, `backend/src/services/engagement.service.ts`, `NotificationDelivery`. |
| Dynamic progression | Absent | No `backend/src/services/progression/` module yet. Planned for Fase 3. |

## Fase 0 Gaps

- Backend refresh tokens are JWT-only; persisted revocation/rotation should be a separate security change.
- Backend build was not part of the primary `CI` workflow before this phase.
- Backend auth behavior had no direct integration test file.
