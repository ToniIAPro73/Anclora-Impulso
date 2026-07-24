# Modal Scroll, Close, and Localization Plan v1

## Approach

1. Read repository rules and contracts.
2. Audit overlay usage through code graph and literal class searches.
3. Write focused component tests for onboarding, exercise dialog, and workout labels.
4. Refactor onboarding to a modal shell with fixed header/sidebar, scrollable step body,
   and stable footer actions.
5. Refactor exercise detail dialog to use `DialogClose asChild`, viewport max height,
   internal body scroll, and localized domain labels.
6. Add typed domain label helpers for workout muscles and equipment.
7. Correct equivalent overlay issues found in scope.
8. Run lint, tests, build, and browser validation.

## Overlay Audit

| File | Component | Risk | Action |
|---|---|---|---|
| `components/onboarding-dialog.tsx` | `OnboardingDialog` | Footer and content share scroll path; mobile can clip late fields. | Fix layout. |
| `components/exercise-library.tsx` | `ExerciseLibrary` | Hidden close primitive, global query close, no bounded body scroll. | Fix layout and close. |
| `components/progress-tracker.tsx` | Measurement dialog | Similar custom modal shell but controlled close and short form. | Review and fix only if tests or visual checks show issue. |
| `components/profile-dialog.tsx` | `ProfileDialog` | Already uses controlled/Radix close and internal body scroll. | No code change unless validation fails. |
| `app/nutrition/page.tsx` | Nutrition dialogs | Already uses shared responsive modal classes and explicit grid rows. | No change. |
| `app/admin/content/page.tsx` | Admin editor dialogs | Already uses viewport height and internal scroll regions. | No change. |
| `app/nutrition/meal-plans/[id]/page.tsx` | Meal/recipe dialogs | Already uses bounded grid shells and internal overflow. | No change. |

## Test Plan

- Component tests for onboarding dialog structure and close behavior.
- Component tests for exercise dialog long content, Close button, Escape, and no global
  query usage.
- Component tests for workout generator localized labels and canonical payload.
- Focused test runs during implementation, then full Jest CI.

## Risk

The main risk is Radix behavior in JSDOM. Tests should assert stable behavior without
depending on browser layout measurements that JSDOM cannot compute.
