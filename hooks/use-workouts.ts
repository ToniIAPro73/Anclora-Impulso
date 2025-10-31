import { useState, useEffect } from 'react';
import { workoutsApi, type Workout } from '@/lib/api';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workoutsApi.getAll();
      setWorkouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar entrenamientos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const createWorkout = async (data: {
    name: string;
    exercises: Array<{
      exerciseId: string;
      sets: number;
      reps: number;
      rest: number;
      order: number;
    }>;
  }) => {
    const newWorkout = await workoutsApi.create(data);
    setWorkouts((prev) => [newWorkout, ...prev]);
    return newWorkout;
  };

  const deleteWorkout = async (id: string) => {
    await workoutsApi.delete(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const generateWorkout = async (params: {
    workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'full_body';
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    targetMuscles?: string[];
    equipment?: string[];
  }) => {
    const newWorkout = await workoutsApi.generate(params);
    setWorkouts((prev) => [newWorkout, ...prev]);
    return newWorkout;
  };

  return {
    workouts,
    isLoading,
    error,
    createWorkout,
    deleteWorkout,
    generateWorkout,
    refetch: fetchWorkouts,
  };
}
