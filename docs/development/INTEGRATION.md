# Guía de Integración Frontend-Backend

Esta guía explica cómo integrar el frontend de Anclora Impulso con el backend API.

## Configuración Inicial

### 1. Backend

```bash
cd backend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Neon

# Generar cliente de Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Poblar base de datos
pnpm prisma:seed

# Iniciar servidor
pnpm dev
```

El backend estará disponible en `http://localhost:3001`

### 2. Frontend

```bash
# En la raíz del proyecto

# Instalar dependencias (si no lo has hecho)
pnpm install

# El archivo .env.local ya está configurado
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Iniciar servidor de desarrollo
pnpm dev
```

El frontend estará disponible en `http://localhost:3000`

## Uso de la API en el Frontend

### Autenticación

```typescript
import { useAuth } from '@/lib/contexts/auth-context';

function MyComponent() {
  const { user, login, signup, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Usuario autenticado
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const handleSignup = async () => {
    try {
      await signup('user@example.com', 'password123', 'John Doe');
      // Usuario registrado y autenticado
    } catch (error) {
      console.error('Error al registrarse:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // Usuario desconectado
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <p>Bienvenido, {user.fullName}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Iniciar sesión</button>
          <button onClick={handleSignup}>Registrarse</button>
        </div>
      )}
    </div>
  );
}
```

### Ejercicios

```typescript
import { useExercises } from '@/hooks/use-exercises';

function ExerciseList() {
  const { exercises, isLoading, error } = useExercises({
    category: 'strength',
    muscleGroup: 'chest',
  });

  if (isLoading) return <div>Cargando ejercicios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          {exercise.name} - {exercise.difficulty}
        </li>
      ))}
    </ul>
  );
}
```

### Entrenamientos

```typescript
import { useWorkouts } from '@/hooks/use-workouts';

function WorkoutManager() {
  const {
    workouts,
    isLoading,
    error,
    createWorkout,
    deleteWorkout,
    generateWorkout,
  } = useWorkouts();

  const handleGenerate = async () => {
    try {
      const workout = await generateWorkout({
        workoutType: 'strength',
        duration: 45,
        difficulty: 'intermediate',
        targetMuscles: ['chest', 'arms'],
        equipment: ['dumbbells', 'bodyweight'],
      });
      console.log('Entrenamiento generado:', workout);
    } catch (error) {
      console.error('Error al generar entrenamiento:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id);
      console.log('Entrenamiento eliminado');
    } catch (error) {
      console.error('Error al eliminar entrenamiento:', error);
    }
  };

  if (isLoading) return <div>Cargando entrenamientos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleGenerate}>Generar entrenamiento con IA</button>
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            {workout.name}
            <button onClick={() => handleDelete(workout.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Progreso

```typescript
import { useProgress } from '@/hooks/use-progress';

function ProgressTracker() {
  const { progress, isLoading, error, addMeasurement, deleteMeasurement } = useProgress();

  const handleAddMeasurement = async () => {
    try {
      await addMeasurement({
        weight: 75.5,
        bodyFat: 15.2,
        chest: 100,
        waist: 85,
      });
      console.log('Medida agregada');
    } catch (error) {
      console.error('Error al agregar medida:', error);
    }
  };

  if (isLoading) return <div>Cargando progreso...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!progress) return <div>No hay datos de progreso</div>;

  return (
    <div>
      <h2>Estadísticas</h2>
      <p>Entrenamientos totales: {progress.stats.totalWorkouts}</p>
      <p>Esta semana: {progress.stats.workoutsThisWeek}</p>
      <p>Este mes: {progress.stats.workoutsThisMonth}</p>
      
      <h2>Récords Personales</h2>
      <ul>
        {progress.stats.personalRecords.map((record) => (
          <li key={record.exercise_id}>
            {record.exercise_name}: {record.max_weight} kg
          </li>
        ))}
      </ul>

      <button onClick={handleAddMeasurement}>Agregar medida</button>
    </div>
  );
}
```

## API Directa (sin hooks)

Si prefieres usar la API directamente sin hooks:

```typescript
import { exercisesApi, workoutsApi, sessionsApi, progressApi } from '@/lib/api';

// Ejercicios
const exercises = await exercisesApi.getAll({ category: 'strength' });
const exercise = await exercisesApi.getById('exercise-id');

// Entrenamientos
const workouts = await workoutsApi.getAll();
const workout = await workoutsApi.create({
  name: 'Mi entrenamiento',
  exercises: [
    {
      exerciseId: 'exercise-id',
      sets: 3,
      reps: 10,
      rest: 60,
      order: 0,
    },
  ],
});

// Sesiones
const sessions = await sessionsApi.getAll();
const session = await sessionsApi.create({
  workoutId: 'workout-id',
  duration: 3600,
  notes: 'Buen entrenamiento',
  exercises: [
    {
      exerciseId: 'exercise-id',
      sets: [
        { reps: 10, weight: 20, order: 0 },
        { reps: 10, weight: 20, order: 1 },
        { reps: 10, weight: 20, order: 2 },
      ],
    },
  ],
});

// Progreso
const stats = await progressApi.getStats();
const completeProgress = await progressApi.getComplete();
const measurements = await progressApi.getMeasurements();
```

## Manejo de Errores

Todos los métodos de la API pueden lanzar errores. Asegúrate de manejarlos:

```typescript
try {
  const workout = await workoutsApi.create(data);
  // Éxito
} catch (error) {
  if (error instanceof Error) {
    // Mostrar mensaje de error al usuario
    console.error(error.message);
  }
}
```

## Tokens y Autenticación

Los tokens JWT se manejan automáticamente:

- El `accessToken` se almacena en `localStorage` y se incluye en cada request
- El `refreshToken` se almacena en `localStorage` para renovar el `accessToken`
- Al hacer `logout()`, ambos tokens se eliminan

## Variables de Entorno

### Desarrollo

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Producción

```env
# .env.production
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

## Próximos Pasos

1. **Reemplazar componentes existentes** para usar los nuevos hooks y API
2. **Eliminar código de IndexedDB** (ya no se necesita)
3. **Actualizar páginas** para usar la nueva autenticación
4. **Agregar loading states** y manejo de errores en toda la UI
5. **Implementar optimistic updates** para mejor UX

## Componentes a Actualizar

### Páginas que necesitan actualización:

- ✅ `app/auth/login/page.tsx` - Ya usa el nuevo contexto
- ✅ `app/auth/signup/page.tsx` - Ya usa el nuevo contexto
- ✅ `app/dashboard/page.tsx` - Ya usa el nuevo contexto
- ⚠️ `app/exercises/page.tsx` - Actualizar para usar `useExercises`
- ⚠️ `app/workouts/generate/page.tsx` - Actualizar para usar `useWorkouts`
- ⚠️ `app/progress/page.tsx` - Actualizar para usar `useProgress`

### Componentes que necesitan actualización:

- ⚠️ `components/exercise-library.tsx` - Usar API en lugar de IndexedDB
- ⚠️ `components/workout-generator.tsx` - Usar API en lugar de lógica local
- ⚠️ `components/progress-tracker.tsx` - Usar API en lugar de IndexedDB
- ⚠️ `components/dashboard-content.tsx` - Usar datos reales de la API

## Migración Gradual

Puedes migrar gradualmente:

1. Mantén el código de IndexedDB como fallback
2. Intenta usar la API primero
3. Si falla, usa IndexedDB
4. Una vez que todo funcione, elimina IndexedDB

```typescript
try {
  // Intentar usar API
  const exercises = await exercisesApi.getAll();
  return exercises;
} catch (error) {
  // Fallback a IndexedDB
  const exercises = await db.getAll('exercises');
  return exercises;
}
```
