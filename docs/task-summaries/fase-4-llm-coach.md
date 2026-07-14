# Resumen — Fase 4: Conversational LLM Coach

## 1. Estado inicial encontrado

- Fase 3 estaba en `development` con motor de progresión y endpoint `/api/v1/progression/next-session`.
- Existía configuración base de LLM/Groq, pero no había coach conversacional, provider abstraction, guardrails específicos, cache ni rate limiting por usuario para coste LLM.
- `groq-sdk` ya estaba instalado en backend.

## 2. Cambios implementados

- Añadido coach conversacional autenticado en `/api/v1/coach/messages`.
- Añadida abstracción de provider:
  - `deterministic` para tests/local sin red externa.
  - `groq` para producción con `GROQ_API_KEY`.
- Añadidos guardarraíles:
  - no diagnóstico médico;
  - derivación a profesional ante dolor/lesión;
  - restricción de alcance a fitness, entrenamiento, recuperación, adherencia y nutrición general.
- Añadido contexto acotado del usuario:
  - objetivo;
  - experiencia;
  - limitaciones;
  - adherencia;
  - sesiones recientes;
  - PRs recientes;
  - consistencia nutricional.
- Añadidos cache TTL y rate limit por ventana/usuario.
- Añadido helper tipado frontend `coachApi.sendMessage`.
- Estabilizado test existente `session-gamification.test.ts` con timeout explícito y sin credential literal genérica.

## 3. Modelo de datos

Migración:

- `backend/prisma/migrations/20260714172000_add_llm_coach/migration.sql`

Modelos nuevos:

- `CoachConversation`
- `CoachMessage`
- `CoachUsageWindow`

## 4. Endpoints

- `POST /api/v1/coach/messages`

Entrada:

- `conversationId?: string`
- `message: string`

Salida:

- `conversationId`
- `answer`
- `provider`
- `model`
- `cached`
- `safety`
- `usage`

OpenAPI actualizado en `backend/src/docs/swagger.ts`.

## 5. Tests y validación

Tests nuevos:

- `backend/tests/integration/llm-coach.test.ts`

Casos cubiertos:

- flag desactivado devuelve `503`;
- guardarraíl médico devuelve respuesta segura sin provider externo;
- respuesta contextual determinista con memoria persistida;
- cache de prompt repetido;
- rate limit por usuario.

Comandos ejecutados:

- `cd backend && npm run prisma:generate` — OK
- `cd backend && npm run prisma:deploy` — OK
- `cd backend && npm run test:ci -- --runTestsByPath tests/integration/llm-coach.test.ts --watch=false` — 5/5 OK
- `cd backend && npm run typecheck` — OK
- `cd backend && npm run build` — OK
- `npm run typecheck` — OK
- `npm run build` — OK
- `npm run lint` — OK
- `cd backend && npm run test:ci -- --runTestsByPath tests/integration/llm-coach.test.ts tests/integration/progression-next-session.test.ts tests/unit/progression-engine.test.ts --watch=false` — 12/12 OK
- `npm run test:ci -- --watch=false` — 27/27 OK
- `cd backend && npm run test:ci -- --watch=false` — 21/21 OK

## 6. Feature flags

Nuevas variables:

- `LLM_COACH_ENABLED=false`
- `LLM_COACH_MAX_PROMPT_CHARS=6000`
- `LLM_COACH_MAX_OUTPUT_TOKENS=450`
- `LLM_COACH_MEMORY_MESSAGES=8`
- `LLM_COACH_CACHE_TTL_SECONDS=300`
- `LLM_COACH_WINDOW_MINUTES=60`
- `LLM_COACH_WINDOW_LIMIT=20`

## 7. Build

- Backend build OK.
- Frontend build OK.

## 8. Riesgos y deuda técnica

- El provider Groq real queda inactivo hasta configurar `LLM_COACH_ENABLED=true` y `GROQ_API_KEY`.
- La cache es in-memory; si hay múltiples instancias, conviene migrarla a Redis o almacenamiento compartido.
- El rate limit persistido por DB funciona, pero puede necesitar índices/TTL operativo si escala mucho.
- No se añadió UI completa de chat; la API queda lista para consumo.

## 9. Verificación DoD

- [x] Requisitos funcionales implementados.
- [x] Endpoint documentado en OpenAPI y validado con Zod.
- [x] Migración Prisma creada y aplicada.
- [x] Tests nuevos en verde.
- [x] Suite frontend/backend ejecutada.
- [x] Build de producción frontend/backend OK.
- [x] Sin secretos hardcodeados.
- [x] Feature flag configurada.
- [x] Resumen generado.
- [ ] Commit, push y promoción por PR chain.

## 10. Commit y push

Pendiente hasta completar revisión final de worktree y commit atómico.
