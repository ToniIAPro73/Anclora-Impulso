# Anclora Impulso

Aplicacion web de fitness con generacion de rutinas con IA, seguimiento de progreso y backend propio para autenticacion, ejercicios, entrenamientos y metricas.

## Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS 4
- Backend: Express, TypeScript, Prisma, PostgreSQL
- UI: Radix UI, shadcn/ui
- Datos y estado: TanStack React Query, Zod

## Inicio rapido

### Requisitos

- Node.js 22 recomendado
- `pnpm`
- Base de datos PostgreSQL para el backend

### Backend

```bash
cd backend
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma migrate dev
pnpm prisma:seed
pnpm dev
```

### Frontend

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:3001`

## Scripts principales

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm test:ci
pnpm test:coverage
```

## Estructura del repo

```text
.
├── app/
├── backend/
├── components/
├── docs/
├── hooks/
├── lib/
├── public/
├── scripts/
├── .github/
├── README.md
├── package.json
└── tsconfig.json
```

## Documentacion

- Indice general: `docs/README.md`
- Documentacion interna y guia para Claude Code: `CLAUDE.md`
- Operacion y despliegue: `docs/operations/DEPLOY.md`
- Desarrollo e integracion: `docs/development/`
- Estandares internos: `docs/standards/`
- Material de negocio e inversores: `docs/business/` y `docs/investors/`
- Historial y entregables: `docs/archive/`

## Contratos UX/UI

Lectura minima antes de tocar interfaz:

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md`
3. `docs/standards/UI_MOTION_CONTRACT.md`
4. `docs/standards/MODAL_CONTRACT.md`
5. `docs/standards/LOCALIZATION_CONTRACT.md`

## Notas

- `middleware.ts` debe permanecer en raiz porque Next.js lo resuelve desde ahi.
- `next-env.d.ts` es un archivo gestionado por Next.js.
- `.env.local` es local al entorno de desarrollo y no debe versionarse.
