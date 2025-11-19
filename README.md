# Anclora Impulso 💪

Aplicación web completa de fitness con seguimiento de entrenamientos, generación inteligente de rutinas con IA, y análisis de progreso.

![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%20%7C%20PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Características

- ✅ **Autenticación segura** con JWT y bcrypt
- ✅ **Base de datos PostgreSQL** persistente (Neon)
- ✅ **Generador de entrenamientos con IA** (OpenAI)
- ✅ **Biblioteca de 20+ ejercicios** con filtros avanzados
- ✅ **Seguimiento de progreso** con gráficos y estadísticas
- ✅ **Récords personales** automáticos
- ✅ **Diseño responsive** con modo claro/oscuro
- ✅ **Internacionalización** (Español/Inglés)
- ✅ **100% gratuito** para desplegar

## 🏗️ Arquitectura

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TypeScript
- **Estilos:** Tailwind CSS 4
- **Componentes:** Radix UI + shadcn/ui
- **Gráficos:** Recharts
- **Deploy:** Vercel

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express.js + TypeScript
- **ORM:** Prisma
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **Seguridad:** Helmet, CORS, Rate Limiting
- **Deploy:** Railway / Render

### Base de Datos
- **Motor:** PostgreSQL 17
- **Hosting:** Neon (500 MB gratis)
- **Migraciones:** Prisma Migrate
- **Seed:** 20 ejercicios precargados

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+ (recomendado 22)
- pnpm (o npm/yarn)
- Cuenta en [Neon](https://neon.tech) (gratis)

### 1. Clonar el repositorio

```bash
git clone https://github.com/ToniIAPro73/Anclora-Impulso.git
cd Anclora-Impulso
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL de Neon

# Generar cliente de Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Poblar base de datos
pnpm prisma:seed

# Iniciar servidor (puerto 3001)
pnpm dev
```

### 3. Configurar Frontend

```bash
# Volver a la raíz
cd ..

# Instalar dependencias
pnpm install

# El .env.local ya está configurado para desarrollo
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Iniciar servidor (puerto 3000)
pnpm dev
```

### 4. Abrir la aplicación

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
Anclora-Impulso/
├── app/                      # Páginas de Next.js (App Router)
│   ├── auth/                 # Autenticación (login, signup)
│   ├── dashboard/            # Panel principal
│   ├── exercises/            # Biblioteca de ejercicios
│   ├── workouts/             # Entrenamientos
│   └── progress/             # Seguimiento de progreso
├── components/               # Componentes React
│   ├── ui/                   # Componentes UI de Radix
│   ├── dashboard-*.tsx       # Componentes del dashboard
│   ├── exercise-library.tsx  # Biblioteca de ejercicios
│   ├── workout-generator.tsx # Generador de entrenamientos
│   └── progress-tracker.tsx  # Seguimiento de progreso
├── lib/                      # Lógica de negocio
│   ├── api/                  # Cliente API y servicios
│   ├── contexts/             # Contextos de React
│   └── translations/         # Archivos de traducción
├── hooks/                    # Custom hooks
│   ├── use-exercises.ts      # Hook para ejercicios
│   ├── use-workouts.ts       # Hook para entrenamientos
│   └── use-progress.ts       # Hook para progreso
├── backend/                  # Backend API
│   ├── src/
│   │   ├── config/           # Configuración
│   │   ├── middleware/       # Middleware
│   │   ├── routes/           # Rutas de la API
│   │   ├── controllers/      # Controladores
│   │   ├── services/         # Lógica de negocio
│   │   └── utils/            # Utilidades
│   └── prisma/
│       ├── schema.prisma     # Esquema de la BD
│       └── seed.ts           # Datos iniciales
├── INTEGRATION.md            # Guía de integración
├── DEPLOY.md                 # Guía de despliegue
└── README.md                 # Este archivo
```

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/register        # Registrar usuario
POST   /api/auth/login           # Iniciar sesión
GET    /api/auth/me              # Usuario actual
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
POST   /api/workouts             # Crear entrenamiento
POST   /api/workouts/generate    # Generar con IA
PUT    /api/workouts/:id         # Actualizar
DELETE /api/workouts/:id         # Eliminar
```

### Sesiones
```
GET    /api/sessions             # Listar sesiones
POST   /api/sessions             # Registrar sesión
PUT    /api/sessions/:id         # Actualizar
DELETE /api/sessions/:id         # Eliminar
```

### Progreso
```
GET    /api/progress/stats           # Estadísticas
GET    /api/progress/complete        # Progreso completo
GET    /api/progress/measurements    # Medidas corporales
POST   /api/progress/measurements    # Agregar medida
```

## 🧪 Testing

### Backend

```bash
cd backend

# Ejecutar tests (cuando estén implementados)
pnpm test

# Ver cobertura
pnpm test:coverage
```

### Frontend

```bash
# Ejecutar tests (cuando estén implementados)
pnpm test

# Ver cobertura
pnpm test:coverage
```

## 📦 Scripts Disponibles

### Frontend

- `pnpm dev` - Iniciar en modo desarrollo
- `pnpm build` - Compilar para producción
- `pnpm start` - Iniciar servidor de producción
- `pnpm lint` - Ejecutar linter

### Backend

- `pnpm dev` - Iniciar en modo desarrollo con hot-reload
- `pnpm build` - Compilar TypeScript
- `pnpm start` - Iniciar servidor de producción
- `pnpm prisma:generate` - Generar cliente de Prisma
- `pnpm prisma:migrate` - Ejecutar migraciones
- `pnpm prisma:studio` - Abrir Prisma Studio (GUI)
- `pnpm prisma:seed` - Poblar base de datos

## 🌐 Despliegue

Sigue la [Guía de Despliegue](DEPLOY.md) para desplegar en producción de forma **100% gratuita**:

- **Base de datos:** Neon PostgreSQL (500 MB)
- **Backend:** Railway (500 horas/mes)
- **Frontend:** Vercel (ilimitado)

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT con expiración configurable
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de entrada con Zod
- ✅ Sanitización de errores en producción

## 🌍 Internacionalización

La aplicación soporta múltiples idiomas:

- 🇪🇸 Español (por defecto)
- 🇬🇧 Inglés

Los archivos de traducción están en `lib/translations/`.

## 🎨 Temas

- 🌞 Modo claro
- 🌙 Modo oscuro
- 🖥️ Sistema (automático)

## 📱 Responsive

La aplicación es completamente responsive y funciona en:

- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más información.

## 👨‍💻 Autor

**Toni IA Pro**

- GitHub: [@ToniIAPro73](https://github.com/ToniIAPro73)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el framework
- [Prisma](https://www.prisma.io/) por el ORM
- [Neon](https://neon.tech/) por la base de datos gratuita
- [Radix UI](https://www.radix-ui.com/) por los componentes
- [shadcn/ui](https://ui.shadcn.com/) por el diseño
- [Vercel](https://vercel.com/) por el hosting
- [Railway](https://railway.app/) por el hosting del backend

## 📚 Documentación Adicional

- [Guía de Integración](INTEGRATION.md) - Cómo integrar frontend y backend
- [Guía de Despliegue](DEPLOY.md) - Cómo desplegar en producción
- [Backend README](backend/README.md) - Documentación del backend

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/ToniIAPro73/Anclora-Impulso/issues) con:

- Descripción del bug
- Pasos para reproducirlo
- Comportamiento esperado
- Screenshots (si aplica)
- Información del sistema (OS, navegador, etc.)

## 💡 Solicitar Features

Para solicitar nuevas funcionalidades, abre un [issue](https://github.com/ToniIAPro73/Anclora-Impulso/issues) con:

- Descripción de la funcionalidad
- Caso de uso
- Beneficios esperados
- Mockups o ejemplos (si aplica)

## 📊 Roadmap

- [ ] Tests automatizados (Jest, React Testing Library)
- [ ] Integración con wearables (Fitbit, Apple Watch)
- [ ] App móvil (React Native)
- [ ] Modo offline con sincronización
- [ ] Compartir entrenamientos con amigos
- [ ] Comunidad y foros
- [ ] Planes de entrenamiento predefinidos
- [ ] Nutrición y dietas
- [ ] Gamificación (logros, badges)
- [ ] Integración con redes sociales

## 🔗 Links Útiles

- [Demo en vivo](https://anclora-impulso.vercel.app) (próximamente)
- [Documentación de la API](https://api.anclora-impulso.com/docs) (próximamente)
- [Blog](https://blog.anclora-impulso.com) (próximamente)

---

**¡Construido con ❤️ para la comunidad fitness!**
