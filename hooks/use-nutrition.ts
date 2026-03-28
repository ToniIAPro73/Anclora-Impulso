import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi, type MealPlan, type NutritionLog, type NutritionSummary, type Recipe } from '@/lib/api';

export function useMealPlans() {
  const queryClient = useQueryClient();

  const plansQuery = useQuery<MealPlan[]>({
    queryKey: ['mealPlans'],
    queryFn: () => nutritionApi.getMealPlans(),
    staleTime: 5 * 60 * 1000,
  });

  const generateMutation = useMutation({
    mutationFn: (params: Parameters<typeof nutritionApi.generateMealPlan>[0]) =>
      nutritionApi.generateMealPlan(params),
    onSuccess: (newPlan) => {
      queryClient.setQueryData<MealPlan[]>(['mealPlans'], (prev) =>
        prev ? [newPlan, ...prev] : [newPlan]
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => nutritionApi.deleteMealPlan(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<MealPlan[]>(['mealPlans'], (prev) =>
        prev ? prev.filter((plan) => plan.id !== deletedId) : prev
      );
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.invalidateQueries({ queryKey: ['mealPlan', deletedId] });
    },
  });

  return {
    mealPlans: plansQuery.data ?? [],
    isLoading: plansQuery.isLoading,
    error: plansQuery.error?.message ?? null,
    refetch: plansQuery.refetch,
    generateMealPlan: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error?.message,
    deleteMealPlan: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error?.message,
  };
}

export function useMealPlan(id: string) {
  return useQuery<MealPlan>({
    queryKey: ['mealPlan', id],
    queryFn: () => nutritionApi.getMealPlanById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useRecipeLibrary(
  params?: Parameters<typeof nutritionApi.listRecipes>[0],
  options?: { enabled?: boolean }
) {
  return useQuery<Recipe[]>({
    queryKey: ['recipeLibrary', params],
    queryFn: () => nutritionApi.listRecipes(params),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof nutritionApi.createRecipe>[0]) => nutritionApi.createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeLibrary'] });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
  });
}

export function useReplaceMealRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mealId, data }: { mealId: string; data: Parameters<typeof nutritionApi.replaceMealRecipe>[1] }) =>
      nutritionApi.replaceMealRecipe(mealId, data),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.setQueryData(['mealPlan', updatedPlan.id], updatedPlan);
    },
  });
}

export function useNutritionLogs(period: 'day' | 'week' = 'day') {
  const queryClient = useQueryClient();

  const logsQuery = useQuery<NutritionLog[]>({
    queryKey: ['nutritionLogs', period],
    queryFn: () => nutritionApi.getLogs(period),
    staleTime: 2 * 60 * 1000,
  });

  const logMutation = useMutation({
    mutationFn: (data: Parameters<typeof nutritionApi.logNutrition>[0]) =>
      nutritionApi.logNutrition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionLogs'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary'] });
    },
  });

  return {
    logs: logsQuery.data ?? [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error?.message ?? null,
    logNutrition: logMutation.mutateAsync,
    isLogging: logMutation.isPending,
  };
}

export function useNutritionSummary(period: 'day' | 'week' = 'day') {
  return useQuery<NutritionSummary>({
    queryKey: ['nutritionSummary', period],
    queryFn: () => nutritionApi.getSummary(period),
    staleTime: 2 * 60 * 1000,
  });
}
