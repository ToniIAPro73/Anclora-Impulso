import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi, exercisesApi, type EditorialSummary } from '@/lib/api';

export function useEditorialExercises() {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery<EditorialSummary>({
    queryKey: ['editorial-exercises'],
    queryFn: () => exercisesApi.getEditorialSummary(),
    staleTime: 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof exercisesApi.update>[1] }) =>
      exercisesApi.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editorial-exercises'] });
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });
      await eventsApi.track({
        action: 'exercise_updated',
        category: 'editorial',
        source: 'admin_content',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof exercisesApi.create>[0]) => exercisesApi.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editorial-exercises'] });
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });
      await eventsApi.track({
        action: 'exercise_created',
        category: 'editorial',
        source: 'admin_content',
      });
    },
  });

  const eventsSummaryQuery = useQuery({
    queryKey: ['product-events-summary'],
    queryFn: () => eventsApi.getSummary(),
    staleTime: 60 * 1000,
  });

  return {
    summary: summaryQuery.data ?? null,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error instanceof Error ? summaryQuery.error.message : null,
    updateExercise: updateMutation.mutateAsync,
    createExercise: createMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,
    eventsSummary: eventsSummaryQuery.data ?? null,
    isLoadingEventsSummary: eventsSummaryQuery.isLoading,
  };
}
