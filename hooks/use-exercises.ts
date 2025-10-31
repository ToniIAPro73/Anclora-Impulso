import { useState, useEffect } from 'react';
import { exercisesApi, type Exercise } from '@/lib/api';

export function useExercises(filters?: {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await exercisesApi.getAll(filters);
        setExercises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar ejercicios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [filters?.category, filters?.muscleGroup, filters?.equipment, filters?.difficulty, filters?.search]);

  return { exercises, isLoading, error };
}
