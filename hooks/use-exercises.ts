import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { exercisesApi, type Exercise, type ExercisesResponse } from '@/lib/api';

export interface ExerciseFilters {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  environment?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
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
 * Hook para infinite scroll local sobre la lista de ejercicios.
 * El backend devuelve la colección completa, así que la paginación
 * se resuelve en cliente manteniendo una API estable para la UI.
 */
export function useExercisesInfinite(filters?: Omit<ExerciseFilters, 'page'>) {
  const query = useInfiniteQuery<ExercisesResponse>({
    queryKey: ['exercises-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await exercisesApi.getAll({
        ...filters,
        page: pageParam as number,
        limit: 20,
      });

      if (Array.isArray(response)) {
        const page = pageParam as number;
        const limit = 20;
        const total = response.length;
        const pages = Math.max(1, Math.ceil(total / limit));

        return {
          data: response.slice((page - 1) * limit, page * limit),
          pagination: {
            page,
            limit,
            total,
            pages,
            hasMore: page < pages,
          },
        };
      }

      return response;
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
