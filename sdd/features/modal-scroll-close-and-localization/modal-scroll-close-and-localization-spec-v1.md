# Modal Scroll, Close, and Localization Spec v1

## Context

Anclora Impulso has regressions in dense modal layouts and workout-domain labels.
The affected surfaces are onboarding, exercise details, equivalent overlays found by
audit, and the workout generator.

Global linked docs under `.anclora/global/` are unavailable in this checkout, so local
contracts in `AGENTS.md`, `MEMORY.md`, and `docs/standards/` govern this work.

## Problem

- Onboarding can clip late-step content and actions in constrained viewports because
  scroll and footer placement are not isolated in a stable modal grid.
- Exercise detail content can exceed the viewport with no reliable internal body scroll.
- The exercise detail Close button uses a global DOM query instead of the Radix dialog
  close contract.
- Workout generation renders canonical domain values such as `chest` and `dumbbells`
  directly in the UI when Spanish is active.
- Related overlays may contain the same overflow and close-pattern risks.

## Goals

- Keep onboarding steps, content, and final actions reachable across desktop, tablet,
  and mobile viewports.
- Make exercise details viewport-safe with a scrollable content body and stable actions.
- Replace global DOM-query closing with a Radix-compatible close mechanism.
- Localize workout-domain labels while preserving canonical API payload values.
- Audit relevant overlays and correct equivalent regressions with focused changes.
- Add regression tests and run real validation commands.

## Non-Goals

- No backend API, database, or persisted enum changes.
- No broad redesign of the dashboard or navigation shell.
- No translation of exercise names or backend-provided prose unless localized source
  data exists.
- No fullscreen conversion for healthy overlays.

## Acceptance Criteria

- Onboarding dialog exposes a named dialog, a scrollable step body, stable navigation,
  and working Later/Finish actions.
- Exercise detail dialog opens, displays long content in an internal scroll region,
  closes through visible Close and Escape, and contains no `document.querySelector`
  close logic.
- Workout generator shows Spanish and English labels for muscle and equipment options,
  but calls generation with canonical values.
- Corrected overlays have targeted tests or documented no-change rationale.
- Lint, tests, build, and visual validation results are documented.
