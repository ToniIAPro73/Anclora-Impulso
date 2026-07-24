# No-Oven Nutrition Recipes — Spec v1

## Problem

The nutrition seed library includes generated and manual recipes whose preparation depends on oven usage. The product should avoid oven-dependent meals so generated plans are easier to follow with basic kitchen equipment.

## Goal

Replace oven-based recipe preparation with no-oven alternatives across the system nutrition recipe library.

## Acceptance criteria

- System recipe names, descriptions, instructions, and tags must not require oven usage.
- Existing diet coverage remains available for all supported diets.
- Recipes generated from the former tray-bake family become stovetop/skillet/casserole-style recipes with realistic steps for the selected protein, base, and vegetables.
- Replacement instructions must not be mechanical word swaps; they must describe feasible cooking methods for the actual ingredients.
- Manual research-inspired recipes that used oven instructions are converted to no-oven instructions.
- Nutrition recipe validation passes.
