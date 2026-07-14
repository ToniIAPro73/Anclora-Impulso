# Fase 1 Gamified Onboarding, First Achievement, and Streaks Spec v1

## Context

The product already has onboarding profile fields, gamification models, achievements, streak counters, and engagement nudges. The missing contract is connecting completed workout sessions to real gamification events.

## Goal

Ensure the user's first real workout session grants XP, updates the streak, and unlocks the first workout achievement.

## Scope

- Connect workout session creation to gamification.
- Keep streak updates based on real completed sessions.
- Cover the first workout achievement with deterministic backend integration tests.
- Document current Fase 1 state.

## Out of Scope

- New Prisma models; existing `UserGamification`, `Achievement`, and `UserAchievement` are sufficient.
- Native/mobile push notifications.
- A redesigned onboarding flow.

## Acceptance Criteria

- Completing a workout session awards `complete_workout` XP.
- Completing a workout session updates `currentStreak` and `longestStreak`.
- A seeded `first_workout` achievement unlocks after the first completed session.
- Re-engagement nudges remain available through the existing engagement service.
