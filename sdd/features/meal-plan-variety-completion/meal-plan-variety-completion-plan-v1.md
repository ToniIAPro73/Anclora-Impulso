# Meal Plan Variety Completion Plan v1

## Implementation Strategy

1. Extract the weekly recipe ranking into a deterministic pure selector that accepts candidate recipes.
2. Add variety metadata derived from recipe name, tags, and ingredients.
3. Penalize exact repeats, same-family repeats, same main protein repeats, and consecutive repeats for the same meal type.
4. Keep fallback behavior for constrained pools.
5. Reuse the pure selector from the existing database-backed smart meal plan flow.

## Validation

- Unit tests for the selector.
- Existing smart nutrition integration test.
- Backend typecheck and test suite.
