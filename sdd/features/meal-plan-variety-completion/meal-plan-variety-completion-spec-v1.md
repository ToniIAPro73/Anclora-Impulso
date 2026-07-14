# Meal Plan Variety Completion Spec v1

## Problem

Weekly smart meal plans can still feel like small variations of the same menu when the highest-scoring recipes share the same main protein, starch, or recipe family.

## Goal

Improve weekly meal plan selection so generated plans prefer clearly distinct meals across the week while preserving goal, diet, difficulty, and restriction filters.

## Acceptance Criteria

- The weekly selector avoids repeating the exact same recipe while enough alternatives exist for a meal type.
- The weekly selector avoids consecutive repetitions of the same recipe family for the same meal type when enough alternatives exist.
- Recipe family is inferred from practical nutrition signals: tags, main ingredients, and recipe name.
- Existing goal, diet type, difficulty, included ingredients, and dietary restriction behavior remains supported.
- Constrained recipe pools still produce a plan instead of failing only because variety options are limited.
- Behavior is covered by backend tests.

## Non-goals

- No database migration.
- No public API contract change.
- No AI provider integration.
- No frontend changes.
