import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi, exercisesApi, nutritionApi, type EditorialSummary, type RecipeEditorialSummary } from '@/lib/api';

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

  const bulkExerciseMutation = useMutation({
    mutationFn: (data: Parameters<typeof exercisesApi.bulkUpdateEditorial>[0]) =>
      exercisesApi.bulkUpdateEditorial(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editorial-exercises'] });
      await eventsApi.track({
        action: 'exercise_editorial_bulk_updated',
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

  const recipesSummaryQuery = useQuery<RecipeEditorialSummary>({
    queryKey: ['editorial-recipes'],
    queryFn: () => nutritionApi.getRecipeEditorialSummary(),
    staleTime: 60 * 1000,
  });

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof nutritionApi.updateRecipe>[1] }) =>
      nutritionApi.updateRecipe(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editorial-recipes'] });
      await queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      await eventsApi.track({
        action: 'recipe_updated',
        category: 'editorial',
        source: 'admin_content',
      });
    },
  });

  const bulkRecipeMutation = useMutation({
    mutationFn: (data: Parameters<typeof nutritionApi.bulkUpdateRecipeEditorial>[0]) =>
      nutritionApi.bulkUpdateRecipeEditorial(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editorial-recipes'] });
      await eventsApi.track({
        action: 'recipe_editorial_bulk_updated',
        category: 'editorial',
        source: 'admin_content',
      });
    },
  });

  return {
    summary: summaryQuery.data ?? null,
    recipesSummary: recipesSummaryQuery.data ?? null,
    isLoading: summaryQuery.isLoading,
    isLoadingRecipes: recipesSummaryQuery.isLoading,
    error: summaryQuery.error instanceof Error ? summaryQuery.error.message : null,
    recipesError: recipesSummaryQuery.error instanceof Error ? recipesSummaryQuery.error.message : null,
    updateExercise: updateMutation.mutateAsync,
    bulkUpdateExerciseEditorial: bulkExerciseMutation.mutateAsync,
    updateRecipe: updateRecipeMutation.mutateAsync,
    bulkUpdateRecipeEditorial: bulkRecipeMutation.mutateAsync,
    createExercise: createMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isBulkUpdating: bulkExerciseMutation.isPending,
    isUpdatingRecipe: updateRecipeMutation.isPending,
    isBulkUpdatingRecipe: bulkRecipeMutation.isPending,
    isCreating: createMutation.isPending,
    eventsSummary: eventsSummaryQuery.data ?? null,
    isLoadingEventsSummary: eventsSummaryQuery.isLoading,
  };
}
