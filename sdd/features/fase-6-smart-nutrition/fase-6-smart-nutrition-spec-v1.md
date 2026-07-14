# Fase 6 — Smart Nutrition Spec v1

## Objective

Add a structured nutrition layer with food items, macro targets, meal logging, target-aware meal planning, and a safe web-ready health data import status behind a feature flag.

## Functional requirements

- Users can search and create food items with macro data.
- Users can create/update nutrition targets.
- Users can log meals from a food item or explicit macros.
- Meal logs calculate macros from serving quantity when a food item is used.
- Users can fetch meal logs by day.
- Users can generate a target-aware meal plan shell.
- Health data import status is exposed behind `HEALTH_DATA_IMPORT_ENABLED`.

## Non-functional requirements

- Zod validation for all new writes.
- Prisma migration versioned.
- No external food/health API calls in CI.
- Health import must be disabled by default.

## Acceptance criteria

- Creating a food item and logging 150g from a 100g serving calculates 1.5x macros.
- Upserting a target persists one target per user.
- Smart meal plan uses the user's target as its source of truth.
- Health import status returns disabled by default and lists web-ready providers as unavailable.
