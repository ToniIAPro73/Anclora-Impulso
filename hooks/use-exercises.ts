import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { exercisesApi, type Exercise } from '@/lib/api';

export interface ExerciseFilters {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ExercisesResponse {
  data: Exercise[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

/**
 * Hook para obtener ejercicios con caché automático
 * Usa React Query para:
 * - Deduplicación de requests
 * - Caching automático (5 min)
 * - Sincronización entre tabs
 * - Refetch en background
 */
export function useExercises(filters?: ExerciseFilters) {
  const query = useQuery<Exercise[]>({
    queryKey: ['exercises', filters],
    queryFn: async () => {
      const response = await exercisesApi.getAll(filters);
      // Si la respuesta es un objeto con data, extrae solo los ejercicios
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ExercisesResponse).data;
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    exercises: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Hook para infinite scroll de ejercicios
 * Carga automáticamente la siguiente página al llegar al final
 */
export function useExercisesInfinite(filters?: Omit<ExerciseFilters, 'page'>) {
  const query = useInfiniteQuery<ExercisesResponse>({
    queryKey: ['exercises-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await exercisesApi.getAll({
        ...filters,
        page: pageParam,
        limit: 20,
      });
      return response as ExercisesResponse;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    exercises: query.data?.pages.flatMap((page) => page.data) ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error?.message ?? null,
  };
}
