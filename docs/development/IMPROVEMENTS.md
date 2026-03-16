# ANÁLISIS Y PLAN DE MEJORAS: ANCLORA IMPULSO

**Documento de Análisis Integral y Roadmap de Mejoras**

Fecha: Noviembre 2025
Estado Actual: Desarrollo avanzado, listo para producción con reservas
Recomendación: NO deployar a producción sin completar Fase 1

---

## 📊 RESUMEN EJECUTIVO

### Fortalezas
✅ **Arquitectura sólida** - MVC bien organizado en backend, componentes reutilizables en frontend
✅ **Stack moderno** - Next.js 14, Express, Prisma, TypeScript en todo el código
✅ **Seguridad base** - JWT, bcrypt, Helmet, CORS configurado correctamente
✅ **Escalabilidad** - Base de datos indexada, logging estructurado con rotación automática
✅ **Documentación** - README, DEPLOY, INTEGRATION documentados
✅ **DevOps ready** - Health checks, métricas, dashboard de monitoreo

### Debilidades Críticas
🔴 **CERO TESTS** - Sin cobertura de testing automático (Jest/React Testing Library)
🔴 **SQL Injection** - Query sin parametrización en `sessions.service.ts:204`
🔴 **Auth gaps** - Endpoints de ejercicios sin protección (cualquiera puede crear/eliminar)
🔴 **Token storage** - Tokens en localStorage (vulnerable a XSS); sin revocación de tokens
🔴 **Error handling** - Exposición de errores internos al cliente; logs de datos sensibles

### Debilidades Importantes
⚠️ **Sin caching** - Cada request refetcha datos del servidor (React Query/SWR ausente)
⚠️ **Sin paginación** - Riesgo de OOM con muchos ejercicios/sesiones
⚠️ **Accesibilidad** - ARIA labels, focus management, semantic HTML incompleto
⚠️ **Sin CI/CD** - Deployments manuales, sin tests automáticos
⚠️ **Sin offline** - App no funciona sin red

---

## 🎯 PLAN DE MEJORAS POR FASES

### ⏱️ ESTIMACIONES DE TIEMPO
- **Fase 1 (Crítica):** 2-3 semanas
- **Fase 2 (Alta):** 2-3 semanas
- **Fase 3 (Media):** 2-3 semanas
- **Fase 4 (Baja):** 1-2 semanas

---

## 🔴 FASE 1: CRÍTICA - SEGURIDAD & TESTING (SEMANAS 1-3)

**Objetivo:** Hacer la aplicación segura para producción y establecer calidad de código

### 1.1 Testing Automatizado (Est. 5-7 días)

**Prioridad:** CRÍTICA
**Impacto:** Previene regresos; aumenta confianza en cambios

#### Frontend Testing
```bash
# 1. Instalar dependencias
pnpm add -D jest @testing-library/react @testing-library/jest-dom @types/jest
pnpm add -D jest-environment-jsdom ts-jest

# 2. Crear jest.config.js
touch jest.config.js

# 3. Crear tests básicos
mkdir -p __tests__/{components,hooks,pages}

# 4. Agregar script
# "test": "jest --watch"
# "test:ci": "jest --coverage"
```

**Archivos a crear:**
- `jest.config.js` - Configuración Jest
- `__tests__/components/dashboard-content.test.tsx` - Tests de dashboard
- `__tests__/hooks/use-exercises.test.tsx` - Tests de datos
- `__tests__/pages/auth/login.test.tsx` - Tests de flujo de auth

**Métricas objetivo:** 70%+ cobertura en rutas críticas (auth, ejercicios, sesiones)

#### Backend Testing
```bash
# 1. Instalar dependencias
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest

# 2. Crear jest.config.js
touch jest.config.js

# 3. Crear tests
mkdir -p tests/{unit,integration}
```

**Tests prioritarios:**
- `tests/unit/utils/validators.test.ts` - Validación de inputs
- `tests/unit/utils/jwt.test.ts` - Generación de tokens
- `tests/unit/utils/password.test.ts` - Hashing de contraseñas
- `tests/integration/auth.test.ts` - Flujo de autenticación
- `tests/integration/exercises.test.ts` - CRUD de ejercicios
- `tests/integration/sessions.test.ts` - Tracking de sesiones

**Métricas objetivo:** 80%+ cobertura en servicios críticos

**Deliverables:**
- [ ] CI/CD pipeline con GitHub Actions para tests
- [ ] Tests pasan en cada commit
- [ ] Cobertura > 70% (backend), > 60% (frontend)

---

### 1.2 Fixes de Seguridad Crítica (Est. 3-4 días)

#### 1.2.1 SQL Injection - CRÍTICO

**Archivo:** `backend/src/services/sessions.service.ts:204`

❌ **ACTUAL:**
```typescript
WHERE ws.user_id = ${userId}  // VULNERABLE
```

✅ **CORRECCIÓN:**
```typescript
// Usar Prisma en lugar de raw SQL para esta consulta
const sessionExercises = await prisma.sessionExercise.findMany({
  where: {
    sessionId: sessionId,
    session: {
      userId: userId  // Validado por Prisma
    }
  },
  include: { sets: true }
});
```

**Alternativa si raw SQL es necesario:**
```typescript
// Usar query parameters
const result = await prisma.$queryRaw`
  SELECT * FROM session_exercises
  WHERE session_id = ${sessionId}
  AND ws.user_id = ${userId}
`;
```

**Test:**
```typescript
it('should prevent SQL injection in session queries', async () => {
  const maliciousInput = "1' OR '1'='1";
  const result = await getSessionExercises(userId, maliciousInput);
  expect(result).not.toContain('other_users_data');
});
```

**Aplicar a:** Revisar TODOS los raw SQL queries en servicios

---

#### 1.2.2 Autenticación de Endpoints Faltante

**Archivo:** `backend/src/routes/exercises.routes.ts:17-19`

❌ **ACTUAL:**
```typescript
router.post('/', exercisesController.createExercise);  // Sin auth
router.put('/:id', exercisesController.updateExercise);  // Sin auth
router.delete('/:id', exercisesController.deleteExercise);  // Sin auth
```

✅ **CORRECCIÓN:**
```typescript
router.post('/', authenticateToken, isAdmin, exercisesController.createExercise);
router.put('/:id', authenticateToken, isAdmin, exercisesController.updateExercise);
router.delete('/:id', authenticateToken, isAdmin, exercisesController.deleteExercise);
```

**Agregar middleware isAdmin:**
```typescript
// backend/src/middleware/admin.ts
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

**Actualizar Prisma schema:**
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  role      String    @default("USER")  // Agregar este campo
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

---

#### 1.2.3 Token Storage - Mejorar Seguridad

**Archivo:** `frontend/lib/api/client.ts` y `lib/contexts/auth-context.tsx`

**Problema:** Tokens en localStorage son vulnerables a XSS

✅ **SOLUCIÓN: Usar httpOnly cookies**

```typescript
// backend/src/routes/auth.routes.ts
router.post('/login', async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  // Usar httpOnly cookie para refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,      // No accesible via JavaScript
    secure: true,        // Solo en HTTPS
    sameSite: 'strict',  // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
  });

  // Access token en respuesta (puede ir en localStorage)
  res.json({
    user,
    accessToken,
    expiresIn: 7 * 24 * 60 * 60  // 7 days
  });
});
```

```typescript
// frontend/lib/api/client.ts
export async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',  // Enviar cookies automáticamente
    headers: { 'Content-Type': 'application/json' }
  });

  const { accessToken } = await response.json();
  localStorage.setItem('accessToken', accessToken);
  return accessToken;
}
```

**Alternativa si se mantiene localStorage:**
- Implementar CSP headers estrictos
- Sanitizar todo HTML input
- No almacenar tokens sin encripción

---

#### 1.2.4 Logging Sensible - Remover Datos Expuestos

**Archivo:** `backend/src/middleware/errorHandler.ts:35`

❌ **ACTUAL:**
```typescript
logger.error('Request failed', {
  error: err.message,
  path: req.path,
  body: req.body,  // ¡PELIGRO! Puede contener contraseñas
  query: req.query
});
```

✅ **CORRECCIÓN:**
```typescript
logger.error('Request failed', {
  error: err.message,
  path: req.path,
  method: req.method,
  userId: req.user?.id,
  // NO incluir body completo
  bodyKeys: Object.keys(req.body || {}),  // Solo llaves
  statusCode: res.statusCode
});
```

**Crear utilidad de sanitización:**
```typescript
// backend/src/utils/logging.ts
export function sanitizeData(data: any, fieldsToMask = ['password', 'token', 'secret']) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  fieldsToMask.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  });
  return sanitized;
}
```

---

#### 1.2.5 Error Handling - No Exponer Detalles Internos

**Archivo:** `app/auth/login/page.tsx:32`

❌ **ACTUAL:**
```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
  } catch (error: any) {
    toast.error(error.message);  // Expone detalles internos
  }
};
```

✅ **CORRECCIÓN:**
```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
  } catch (error: any) {
    // Mapear errores internos a mensajes amigables
    const userMessage = getErrorMessage(error);
    toast.error(userMessage);
  }
};

function getErrorMessage(error: any): string {
  const errorMap: Record<string, string> = {
    'INVALID_CREDENTIALS': 'Email o contraseña incorrecta',
    'USER_NOT_FOUND': 'Usuario no encontrado',
    'NETWORK_ERROR': 'Error de conexión. Intenta de nuevo',
    'EMAIL_ALREADY_REGISTERED': 'Este email ya está registrado',
  };

  return errorMap[error.code] || 'Ocurrió un error. Intenta de nuevo';
}
```

**Backend:**
```typescript
// backend/src/utils/appError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public statusCode: number = 400,
    message?: string
  ) {
    super(message || userMessage);
  }
}

// Uso:
throw new AppError(
  'INVALID_CREDENTIALS',
  'Email o contraseña incorrecta',
  401,
  'User not found or password incorrect'
);
```

**Deliverables:**
- [ ] SQL injection vulnerabilities patched
- [ ] Auth endpoints requieren autenticación
- [ ] Tokens en httpOnly cookies
- [ ] Logs sin datos sensibles
- [ ] Error messages user-friendly
- [ ] Tests para todos los fixes de seguridad

---

### 1.3 Limpieza de Código Técnica (Est. 2-3 días)

**Reemplazar console.log con logger en:**
- `backend/src/server.ts` - Líneas 1-50
- `backend/src/config/database.ts` - Líneas 17-20, 40-45
- `backend/src/app.ts` - Líneas iniciales

**Crear helper para auth checks:**
```typescript
// backend/src/middleware/requireAuth.ts
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Usar en controllers:
router.get('/', requireAuth, controller.getMyWorkouts);
```

---

## 🟠 FASE 2: ALTA PRIORIDAD - RENDIMIENTO & UX (SEMANAS 4-6)

**Objetivo:** Mejorar rendimiento, experiencia de usuario, mantenibilidad

### 2.1 Caching Frontend (Est. 3-4 días)

**Problema:** Cada cambio de página refetcha todos los datos

**Solución: Implementar React Query**

```bash
cd root && pnpm add @tanstack/react-query
cd backend && pnpm add @tanstack/react-query  # Sincronizar versión
```

**Crear proveedor:**
```typescript
// lib/providers/query-client.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      gcTime: 10 * 60 * 1000,     // 10 minutos (antes: cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Refactorizar hooks con useQuery:**
```typescript
// hooks/use-exercises.ts
import { useQuery } from '@tanstack/react-query';

export function useExercises(filters?: ExerciseFilters) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => fetchExercises(filters),
    staleTime: 10 * 60 * 1000,  // Válido 10 min
  });
}
```

**Beneficios:**
- ✅ Datos cacheados automáticamente
- ✅ Deduplicación de requests
- ✅ Sincronización entre tabs
- ✅ Refetch en background
- ✅ Soporte para offline

**Testing:**
```typescript
it('should cache exercise queries', async () => {
  const { result, rerender } = renderHook(() => useExercises());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  const firstCallCount = mockFetch.mock.calls.length;

  // Segundo llamado desde caché
  rerender();
  expect(mockFetch.mock.calls.length).toBe(firstCallCount);
});
```

---

### 2.2 Paginación & Lazy Loading (Est. 3-4 días)

**Problema:** Sin paginación = sin límite de datos en memoria

**Backend - Agregar paginación:**
```typescript
// backend/src/utils/pagination.ts
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function getPaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);  // Max 100

  return {
    page,
    limit,
    sortBy: query.sortBy || 'createdAt',
    sortOrder: (query.sortOrder || 'desc') as 'asc' | 'desc'
  };
}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
```

**Actualizar servicios:**
```typescript
// backend/src/services/exercises.service.ts
export async function getAllExercises(filters: any, pagination: PaginationParams) {
  const skip = calculateSkip(pagination.page, pagination.limit);

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where: buildFiltersQuery(filters),
      skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy]: pagination.sortOrder }
    }),
    prisma.exercise.count({ where: buildFiltersQuery(filters) })
  ]);

  return {
    data: exercises,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
      hasMore: skip + pagination.limit < total
    }
  };
}
```

**Frontend - Infinite scroll:**
```typescript
// components/exercise-library.tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

export function ExerciseLibrary() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['exercises', filters],
    queryFn: ({ pageParam = 1 }) => fetchExercises({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <>
      {data?.pages.map((page) =>
        page.data.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))
      )}
      <div ref={ref} className="flex justify-center py-8">
        {isFetching && <Spinner />}
      </div>
    </>
  );
}
```

---

### 2.3 Error Boundaries & Loading States (Est. 2-3 días)

**Crear Error Boundary:**
```typescript
// components/error-boundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React error caught', { error: error.message, componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Algo salió mal</h1>
            <p className="text-gray-600 mt-2">Intenta recargar la página</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usar en layout:**
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**Loading states en componentes:**
```typescript
export function WorkoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const workout = await generateWorkout({ ...params });
      toast.success('Entrenamiento creado');
    } catch (error) {
      toast.error('Error al generar entrenamiento');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Spinner className="mr-2" />
          Generando...
        </>
      ) : (
        'Generar con IA'
      )}
    </Button>
  );
}
```

---

### 2.4 Rate Limiting Mejorado (Est. 1-2 días)

**Problema:** Rate limit global solo; sin protección de endpoints de escritura

```typescript
// backend/src/app.ts
import rateLimit from 'express-rate-limit';

// Rate limit general: 100 requests/15 min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiados requests, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para auth: 5 intentos/15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,  // No contar intentos exitosos
  keyGenerator: (req) => req.body.email || req.ip  // Rate limit por email
});

// Rate limit para writes: 30 requests/15 min
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Rate limit para API generation (AI): 5 requests/hour
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id
});

app.use('/api/', limiter);
app.post('/api/auth/login', authLimiter, authRoutes);
app.post('/api/auth/register', authLimiter, authRoutes);

// Aplicar write limiter a rutas específicas
app.post('/api/workouts', writeLimiter, workoutRoutes);
app.post('/api/sessions', writeLimiter, sessionRoutes);
app.put('/api/exercises/:id', writeLimiter, exerciseRoutes);
app.post('/api/workouts/generate', aiLimiter, workoutRoutes);
```

---

### 2.5 Refactor de Auth Checks (Est. 2 días)

**Centralizar lógica de auth en lugar de repetir en cada controller:**

```typescript
// backend/src/middleware/requireAuth.ts
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireOwnership = (resourceUserId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

**Uso en rutas:**
```typescript
router.get('/', requireAuth, workoutsController.getUserWorkouts);
router.post('/', requireAuth, workoutsController.createWorkout);
router.put('/:id', requireAuth, workoutsController.updateWorkout);  // Checkear ownership en controller
router.delete('/:id', requireAuth, workoutsController.deleteWorkout);
router.post('/:id/sessions', requireAuth, sessionController.createSession);

router.post('/', requireAdmin, exerciseController.createExercise);
router.put('/:id', requireAdmin, exerciseController.updateExercise);
router.delete('/:id', requireAdmin, exerciseController.deleteExercise);
```

**Deliverables:**
- [ ] React Query implementado
- [ ] Paginación en ejercicios/sesiones
- [ ] Infinite scroll en listas grandes
- [ ] Error boundaries funcionales
- [ ] Loading states en todos los async operations
- [ ] Rate limiting mejorado
- [ ] Auth checks centralizados

---

## 🟡 FASE 3: PRIORIDAD MEDIA - CALIDAD & ACCESIBILIDAD (SEMANAS 7-9)

**Objetivo:** Mejorar accesibilidad, code quality, documentación

### 3.1 Accesibilidad (a11y) (Est. 2-3 días)

**Auditoría con lighthouse:**
```bash
npm install -D lighthouse
npx lighthouse http://localhost:3000 --view
```

**Fixes comunes:**

1. **ARIA Labels**
```typescript
// ❌ ANTES
<button onClick={toggleMenu}>☰</button>

// ✅ DESPUÉS
<button
  onClick={toggleMenu}
  aria-label="Abrir menú de navegación"
  aria-expanded={isOpen}
>
  ☰
</button>
```

2. **Focus Management en Modales**
```typescript
// components/ui/dialog.tsx
import { useEffect, useRef } from 'react';

export function Dialog({ open, onClose, children }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      // Usar FocusTrap library o manual:
      dialogRef.current?.querySelector('button')?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [open]);

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      className="modal"
    >
      {children}
    </div>
  );
}
```

3. **Semantic HTML**
```typescript
// ❌ ANTES
<div onClick={handleSubmit} className="btn">Enviar</div>

// ✅ DESPUÉS
<button type="submit" onClick={handleSubmit}>Enviar</button>
```

4. **Color Contrast**
```css
/* Verificar contraste usando WCAG AA (4.5:1 para texto) */
/* Usar herramienta: https://webaim.org/resources/contrastchecker/ */

/* ❌ MALO: Orange #F97316 en white background = 3.9:1 */
/* ✅ BUENO: Orange #D97706 en white background = 5.2:1 */
```

5. **Form Labels**
```typescript
<div className="form-group">
  <label htmlFor="email">Email</label>
  <input id="email" type="email" name="email" required />
</div>
```

6. **Skip Links**
```typescript
// components/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only"
    >
      Saltar al contenido principal
    </a>
  );
}
```

**Testing accessibility:**
```bash
pnpm add -D jest-axe @axe-core/react

// En tests:
import { axe, toHaveNoViolations } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### 3.2 Input Sanitization (Est. 1-2 días)

**Problema:** Ejercicio descriptions podrían contener XSS si no se sanitizan

```bash
pnpm add sanitize-html
pnpm add -D @types/sanitize-html
```

**Backend - Sanitizar en servicios:**
```typescript
// backend/src/services/exercises.service.ts
import sanitizeHtml from 'sanitize-html';

export async function createExercise(input: CreateExerciseDto) {
  const { name, description, instructions } = input;

  // Sanitizar campos de texto
  const sanitized = {
    name: name.trim(),
    description: sanitizeHtml(description, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {}
    }),
    instructions: sanitizeHtml(instructions, {
      allowedTags: ['ol', 'ul', 'li', 'p', 'br'],
      allowedAttributes: {}
    })
  };

  return prisma.exercise.create({ data: sanitized });
}
```

**Frontend - Content Security Policy:**
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
      ]
    }
  ]
};

export default nextConfig;
```

---

### 3.3 Logging Frontend (Est. 1-2 días)

**Problema:** Sin visibility de errores en producción

```bash
pnpm add sentry-config
```

**Configurar Sentry o logger simple:**
```typescript
// lib/logging.ts
const isProduction = process.env.NODE_ENV === 'production';

export function logError(error: Error, context?: Record<string, any>) {
  console.error(error);

  if (isProduction) {
    // Enviar a servicio de logging (Sentry, LogRocket, etc.)
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'error',
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    });
  }
}

export function logWarning(message: string, context?: Record<string, any>) {
  console.warn(message);
  // Enviar a logging service si es importante
}
```

**Usar en componentes:**
```typescript
export function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      logError(error as Error, { email, action: 'login' });
      toast.error(getErrorMessage(error));
    }
  };
}
```

---

### 3.4 Documentación API & JSDoc (Est. 2 días)

**Agregar JSDoc a funciones críticas:**
```typescript
/**
 * Genera un entrenamiento personalizado usando IA
 * @param userId - ID del usuario
 * @param preferences - Preferencias del usuario (duración, equipamiento, etc.)
 * @param exerciseIds - IDs de ejercicios disponibles
 * @returns Promise<Workout> - Entrenamiento generado
 * @throws {AppError} Si OpenAI API falla o el usuario excede limite
 *
 * @example
 * const workout = await generateAIWorkout(userId, { duration: 45 }, exerciseIds);
 */
export async function generateAIWorkout(
  userId: string,
  preferences: WorkoutPreferences,
  exerciseIds: string[]
): Promise<Workout> {
  // ...
}
```

**Crear OpenAPI/Swagger docs:**
```bash
cd backend && pnpm add swagger-ui-express swagger-jsdoc
pnpm add -D @types/swagger-ui-express @types/swagger-jsdoc
```

```typescript
// backend/src/swagger.ts
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Anclora Impulso API',
      version: '1.0.0',
      description: 'API para fitness app con seguimiento de entrenamientos'
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
      { url: 'https://api.anclora-impulso.com', description: 'Production' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);
export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
```

```typescript
// En routes:
/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: List all exercises
 *     parameters:
 *       - name: category
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: List of exercises
 */
router.get('/api/exercises', exercisesController.getAllExercises);
```

**Deliverables:**
- [ ] Accessibility score > 90 (Lighthouse)
- [ ] Todos los inputs sanitizados
- [ ] Frontend logging funcional
- [ ] API documentation en /api-docs
- [ ] JSDoc en todas las funciones críticas

---

## 🟢 FASE 4: BAJA PRIORIDAD - MEJORAS AVANZADAS (SEMANAS 10-12)

**Objetivo:** Características de producción, optimizaciones, experiencia mejorada

### 4.1 Offline Capability & Service Worker (Est. 2-3 días)

```bash
pnpm add workbox-core workbox-precaching workbox-routing workbox-strategies
```

```typescript
// public/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache archivos estáticos
precacheAndRoute(self.__WB_MANIFEST);

// API calls: stale-while-revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({ cacheName: 'api-cache' })
);

// Images: cache-first
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'image-cache' })
);
```

```typescript
// hooks/use-offline.ts
export function useOffline() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  return isOnline;
}
```

### 4.2 PWA Features (Est. 1-2 días)

```json
{
  "name": "Anclora Impulso",
  "short_name": "Anclora",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4.3 Advanced Analytics (Est. 2 días)

```typescript
// lib/analytics.ts
import { useEffect } from 'react';

export function usePageView() {
  useEffect(() => {
    trackEvent('page_view', {
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, []);
}

function trackEvent(event: string, data?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: Date.now() })
    });
  }
}
```

### 4.4 Real-time Updates con WebSocket (Est. 3-4 días)

```typescript
// backend/src/websocket.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

export function setupWebSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    socket.join(`user:${userId}`);

    // Broadcast workout session updates
    socket.on('session:complete', (data) => {
      io.to(`user:${userId}`).emit('session:updated', data);
    });

    // Broadcast achievement unlocked
    socket.on('achievement:unlocked', (data) => {
      io.to(`user:${userId}`).emit('achievement:notification', data);
    });
  });
}
```

```typescript
// frontend/hooks/use-websocket.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useWebSocket(userId: string) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { userId }
    });

    socket.on('session:updated', (data) => {
      // Update local state with real-time data
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    });

    return () => socket.close();
  }, [userId]);
}
```

**Deliverables:**
- [ ] App funciona offline (lectura)
- [ ] Service Worker cachea recursos
- [ ] PWA instalable en móvil
- [ ] Analytics básico funcionando
- [ ] WebSocket para real-time updates

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1 ✅
```
SEGURIDAD & TESTING
- [ ] Tests unitarios backend (80%+ coverage)
- [ ] Tests e2e frontend (flujo crítico)
- [ ] CI/CD GitHub Actions
- [ ] SQL injection fixed
- [ ] Auth endpoints protegidos
- [ ] Tokens en httpOnly cookies
- [ ] Logs sin datos sensibles
- [ ] Error messages user-friendly
- [ ] console.log → logger

ESTIMADO: 2-3 semanas | CRÍTICO
```

### FASE 2 ✅
```
RENDIMIENTO & UX
- [ ] React Query implementado
- [ ] Paginación en listas
- [ ] Infinite scroll funcionando
- [ ] Error boundaries en app
- [ ] Loading states completos
- [ ] Rate limiting mejorado
- [ ] Auth checks centralizados
- [ ] Tests para nuevas features

ESTIMADO: 2-3 semanas | ALTA PRIORIDAD
```

### FASE 3 ✅
```
CALIDAD & ACCESIBILIDAD
- [ ] Lighthouse score > 90
- [ ] ARIA labels completos
- [ ] Semantic HTML arreglado
- [ ] Focus management en modales
- [ ] Input sanitization
- [ ] Frontend logging
- [ ] API documentation (Swagger)
- [ ] JSDoc en funciones críticas

ESTIMADO: 2-3 semanas | MEDIA PRIORIDAD
```

### FASE 4 ✅
```
MEJORAS AVANZADAS
- [ ] Service Worker para offline
- [ ] PWA instalable
- [ ] Analytics basico
- [ ] WebSocket real-time
- [ ] Image optimization con Next.js Image
- [ ] Bundle size optimization
- [ ] Performance monitoring
- [ ] Deployment optimization

ESTIMADO: 1-2 semanas | BAJA PRIORIDAD
```

---

## 🎯 ROADMAP TIMELINE

```
Semana 1-3:   FASE 1 (Crítica) - Testing, seguridad
Semana 4-6:   FASE 2 (Alta) - Performance, UX
Semana 7-9:   FASE 3 (Media) - Quality, a11y
Semana 10-12: FASE 4 (Baja) - Advanced features

TOTAL: ~3 meses para todas las mejoras
MÍNIMO VIABLE: Fase 1 + Fase 2 = ~5 semanas
```

---

## 💾 RECURSOS & REFERENCIAS

### Testing
- Jest: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Supertest: https://github.com/visionmedia/supertest

### Performance & Caching
- React Query: https://tanstack.com/query/latest
- SWR: https://swr.vercel.app/
- Workbox: https://developers.google.com/web/tools/workbox

### Security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Auth Best Practices: https://cheatsheetseries.owasp.org/

### Accessibility
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Axe DevTools: https://www.deque.com/axe/devtools/
- WebAIM: https://webaim.org/

### Monitoring
- Sentry: https://sentry.io/
- LogRocket: https://logrocket.com/
- New Relic: https://newrelic.com/

---

## 🤝 PRÓXIMOS PASOS

1. **Inmediato:** Iniciar FASE 1 (seguridad + testing)
2. **Prioridad:** Completar tests antes de cualquier feature nueva
3. **Gradual:** Fase 2 mientras se desarrollan nuevas features
4. **Opcional:** Fases 3-4 según necesidades

---

**Documento generado:** Noviembre 2025
**Última revisión:** v1.0
**Responsable:** Claude Code Analysis
