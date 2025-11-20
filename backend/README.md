# Anclora Impulso - Backend API

Backend RESTful para la aplicación de fitness Anclora Impulso, construido con **Express.js**, **TypeScript**, **Prisma** y **PostgreSQL**.

## Características

- ✅ **Autenticación segura** con JWT y bcrypt
- ✅ **Base de datos PostgreSQL** con Prisma ORM
- ✅ **API RESTful** completa con validación
- ✅ **Generador de entrenamientos** con IA (OpenAI)
- ✅ **Seguimiento de progreso** y estadísticas
- ✅ **Rate limiting** y seguridad con Helmet
- ✅ **TypeScript** para type safety
- ✅ **CORS** configurado para frontend

## Stack Tecnológico

- **Runtime:** Node.js 22
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **Seguridad:** Helmet, CORS, Rate Limiting

## Requisitos Previos

- Node.js 18+ (recomendado 22)
- pnpm (o npm/yarn)
- Base de datos PostgreSQL (local o Neon)

## Instalación

1. **Instalar dependencias:**

```bash
cd backend
pnpm install
```

2. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="tu-clave-secreta-jwt"
JWT_REFRESH_SECRET="tu-clave-secreta-refresh"
FRONTEND_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..." # Opcional
```

3. **Generar cliente de Prisma:**

```bash
pnpm prisma:generate
```

4. **Ejecutar migraciones:**

```bash
pnpm prisma:migrate
```

5. **Poblar base de datos (seed):**

```bash
pnpm prisma:seed
```

## Desarrollo

Iniciar servidor en modo desarrollo con hot-reload:

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3001`

## Producción

1. **Compilar TypeScript:**

```bash
pnpm build
```

2. **Iniciar servidor:**

```bash
pnpm start
```

## Scripts Disponibles

- `pnpm dev` - Iniciar en modo desarrollo
- `pnpm build` - Compilar TypeScript a JavaScript
- `pnpm start` - Iniciar servidor de producción
- `pnpm prisma:generate` - Generar cliente de Prisma
- `pnpm prisma:migrate` - Ejecutar migraciones
- `pnpm prisma:studio` - Abrir Prisma Studio (GUI)
- `pnpm prisma:seed` - Poblar base de datos

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB, env, JWT)
│   ├── middleware/      # Middleware (auth, validate, errors)
│   ├── routes/          # Rutas de la API
│   ├── controllers/     # Controladores
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades (password, jwt, validators)
│   ├── types/           # Tipos TypeScript
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Punto de entrada
├── prisma/
│   ├── schema.prisma    # Esquema de la base de datos
│   └── seed.ts          # Datos iniciales
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Autenticación

```
POST   /api/auth/register        # Registrar usuario
POST   /api/auth/login           # Iniciar sesión
GET    /api/auth/me              # Obtener usuario actual
POST   /api/auth/refresh         # Refrescar token
POST   /api/auth/logout          # Cerrar sesión
```

### Ejercicios

```
GET    /api/exercises                    # Listar ejercicios
GET    /api/exercises/:id                # Obtener ejercicio
GET    /api/exercises/meta/categories    # Categorías
GET    /api/exercises/meta/muscle-groups # Grupos musculares
GET    /api/exercises/meta/equipment     # Equipos
```

### Entrenamientos

```
GET    /api/workouts             # Listar entrenamientos
GET    /api/workouts/:id         # Obtener entrenamiento
POST   /api/workouts             # Crear entrenamiento
PUT    /api/workouts/:id         # Actualizar entrenamiento
DELETE /api/workouts/:id         # Eliminar entrenamiento
POST   /api/workouts/generate    # Generar con IA
```

### Sesiones

```
GET    /api/sessions             # Listar sesiones
GET    /api/sessions/:id         # Obtener sesión
POST   /api/sessions             # Registrar sesión
PUT    /api/sessions/:id         # Actualizar sesión
DELETE /api/sessions/:id         # Eliminar sesión
```

### Progreso

```
GET    /api/progress/stats           # Estadísticas
GET    /api/progress/complete        # Progreso completo
GET    /api/progress/measurements    # Medidas corporales
POST   /api/progress/measurements    # Agregar medida
PUT    /api/progress/measurements/:id # Actualizar medida
DELETE /api/progress/measurements/:id # Eliminar medida
```

## Autenticación

La API usa **JWT** para autenticación. Para acceder a rutas protegidas:

1. Registrarse o iniciar sesión para obtener un token
2. Incluir el token en el header `Authorization`:

```
Authorization: Bearer <tu-token-jwt>
```

## Base de Datos

### Configurar Neon (Recomendado)

1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nuevo proyecto
3. Copiar la connection string
4. Pegar en `DATABASE_URL` en `.env`

### Migraciones

Crear nueva migración después de cambiar el schema:

```bash
pnpm prisma migrate dev --name nombre-migracion
```

### Prisma Studio

Explorar y editar datos con GUI:

```bash
pnpm prisma:studio
```

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT con expiración configurable
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de entrada con Zod
- ✅ Sanitización de errores en producción

## Variables de Entorno

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | - |
| `JWT_SECRET` | Clave secreta para JWT | ✅ | - |
| `JWT_EXPIRES_IN` | Expiración del access token | ❌ | `7d` |
| `JWT_REFRESH_SECRET` | Clave secreta para refresh token | ✅ | - |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | ❌ | `30d` |
| `PORT` | Puerto del servidor | ❌ | `3001` |
| `NODE_ENV` | Entorno (development/production) | ❌ | `development` |
| `FRONTEND_URL` | URL del frontend para CORS | ❌ | `http://localhost:3000` |
| `OPENAI_API_KEY` | API key de OpenAI (opcional) | ❌ | - |

## Deploy

### Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Conectar repositorio de GitHub
3. Agregar servicio PostgreSQL
4. Configurar variables de entorno
5. Deploy automático

### Render

1. Crear cuenta en [Render](https://render.com)
2. Crear nuevo Web Service
3. Conectar repositorio
4. Configurar build command: `pnpm install && pnpm build`
5. Configurar start command: `pnpm start`
6. Agregar variables de entorno

## Licencia

MIT
