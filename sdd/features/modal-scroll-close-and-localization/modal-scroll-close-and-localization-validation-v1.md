# Modal Scroll, Close, and Localization Validation v1

## Commands

| Command | Result |
|---|---|
| `npm ci` | Passed. Existing dependency audit reports 11 vulnerabilities. |
| `npx jest --runInBand __tests__/components/modal-scroll-close-and-localization.test.tsx` | Passed, 8 tests. |
| `npx jest --ci --runInBand` | Passed, 35 tests. |
| `npm run test:ci` | Passed, 35 tests with coverage. |
| `npm run lint` | Passed, no ESLint warnings or errors. |
| `npm run typecheck` | Passed. |
| `npm run build` | Passed. |

## Visual Validation

Runtime validation used the local frontend at `http://localhost:3000`, local backend at
`http://0.0.0.0:3001`, and headless Google Chrome through the DevTools protocol.

Evidence files were generated under `output/modal-validation/`. This directory is local
output and is not committed.

| Surface | Viewport | Theme | Language | Result |
|---|---|---|---|---|
| Dashboard authenticated shell | 390x844 | Dark | ES | No horizontal overflow detected. |
| Dashboard authenticated shell | 768x1024 | Dark | ES | No horizontal overflow detected. |
| Dashboard authenticated shell | 1024x768 | Dark | ES | No horizontal overflow detected. |
| Dashboard authenticated shell | 1366x768 | Dark | ES | No horizontal overflow detected. |
| Dashboard authenticated shell | 1440x900 | Dark | ES | No horizontal overflow detected. |
| Dashboard authenticated shell | 1920x1080 | Dark | ES | No horizontal overflow detected. |
| Workout generator | 1366x768 | Dark | ES | Spanish domain labels present; canonical keys not visible. |
| Workout generator | 1366x768 | Light | EN | English domain labels present; canonical keys not visible. |
| Exercise detail dialog | 1366x768 | Light | EN | Dialog, internal scroll body, body scroll lock, and Close button present. |

Onboarding dialog visual validation could not be forced with the authenticated local user
because its profile is already complete and the dashboard intentionally does not open the
onboarding dialog in that state. Component tests cover the onboarding dialog structure,
navigation, scroll body, and close/save behavior without mutating real user profile data.
