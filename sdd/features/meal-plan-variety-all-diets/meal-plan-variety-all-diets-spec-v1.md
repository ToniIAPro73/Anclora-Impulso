# Meal Plan Variety Across Diet Types — Spec v1

## Problem

Generated weekly meal plans can repeat the same protein, carbohydrate base, and vegetable pattern across different meals and days. This is especially visible in intermittent fasting plans, but the issue must be solved for every selectable diet type.

## Goal

Meal plan generation must prioritize real variety across the full weekly plan while preserving diet compatibility, goal scoring, meal type compatibility, and graceful fallback when the recipe library is limited.

## Acceptance criteria

- Variety scoring applies to all diet types, including `ninguna`, `mediterranea`, `dash`, `ayuno_intermitente`, and `alta_proteina`.
- The selector avoids choosing the same protein/base family in multiple meals on the same day when viable alternatives exist.
- The selector avoids repeating the same recipe family on consecutive days when viable alternatives exist.
- If a meal type has only one viable recipe, the generator still builds a complete week instead of failing.
- Existing intermittent fasting meal structure remains unchanged: lunch and dinner only.
- The change is covered by unit tests.
