# Fase 4 — Conversational LLM Coach Spec v1

## Objective

Add a guarded conversational coach that can answer fitness and nutrition questions using bounded user context while keeping external LLM cost, safety, and rollout risk controlled.

## Functional requirements

- Expose an authenticated endpoint to send one user message and receive one coach response.
- Keep the coach behind `LLM_COACH_ENABLED`.
- Route all model calls through a provider abstraction.
- Support Groq as the production provider and a deterministic provider for tests/local validation.
- Build a bounded user context from profile, adherence, PRs, recent sessions, nutrition consistency, and known limitations.
- Persist short conversation memory and cap the amount of prior messages sent to the model.
- Refuse medical or injury advice and direct users to a qualified professional.
- Keep answers inside fitness, training, recovery, adherence, and nutrition scope.
- Track estimated token usage, apply per-user rate limits, and cache repeated prompts for a short TTL.
- Document the endpoint in OpenAPI and expose frontend API types.

## Non-functional requirements

- No hardcoded secrets.
- No external LLM calls in automated tests.
- Zod validation for input.
- Deterministic tests for guardrails, flags, cache, and rate limiting.
- Prisma migration for persisted conversation and usage state.

## Acceptance criteria

- With `LLM_COACH_ENABLED=false`, the endpoint returns `503` without calling any provider.
- Injury or medical questions return a safe guarded answer without calling any provider.
- Enabled deterministic provider returns a response containing bounded user context signals.
- Repeating the same message returns a cached response and does not create extra provider calls.
- Exceeding the configured per-window user limit returns `429`.
- Conversation messages are persisted with a bounded memory strategy.
