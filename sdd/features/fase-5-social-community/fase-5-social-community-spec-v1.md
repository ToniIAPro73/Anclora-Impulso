# Fase 5 — Social Community Spec v1

## Objective

Add a privacy-aware social layer that turns real training activity into a feed, lets users follow each other, give kudos, and join weekly challenges with leaderboards.

## Functional requirements

- Users can set social profile visibility to `public` or `private`.
- Users can follow and unfollow other users.
- Completing a workout session creates a feed item from a real product event.
- Feed returns the authenticated user's items, followed users' public/private-visible items, and public community items.
- Users can add/remove kudos on feed items.
- The system exposes an active weekly challenge.
- Users can join the active challenge.
- Workout completions update active challenge score.
- Challenge leaderboard returns ranked participants.

## Non-functional requirements

- Auth required for all social endpoints.
- No public leakage of private profile activity to non-followers.
- Zod validation for mutable inputs.
- Prisma migration versioned.
- Deterministic integration tests.

## Acceptance criteria

- A follower can see a followed user's workout feed item and add kudos.
- A non-follower cannot see a private user's feed item.
- A user can join the weekly challenge and appears in its leaderboard after completing a workout.
- Feed items are created from real session completion, not mocked frontend state.
