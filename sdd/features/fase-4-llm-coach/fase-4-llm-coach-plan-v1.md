# Fase 4 — Conversational LLM Coach Plan v1

1. Add SDD spec and tasks.
2. Add failing tests for flag, safety guardrails, cache, rate limiting, and persistence.
3. Extend Prisma with coach conversations, messages, and usage windows.
4. Add environment settings for the LLM coach feature flag, token cap, memory cap, cache TTL, and per-window usage limit.
5. Implement provider abstraction:
   - deterministic provider for tests/local;
   - Groq provider for production when `GROQ_API_KEY` is configured.
6. Implement prompt/context builder with bounded user snapshot.
7. Implement service orchestration, cache, usage tracking, and persistence.
8. Add controller, route, Zod validator, OpenAPI docs, and frontend API helper types.
9. Validate with targeted tests, full backend checks, frontend typecheck/build, then promote through the configured PR chain.
