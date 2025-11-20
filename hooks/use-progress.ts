import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, type CompleteProgress, type BodyMeasurement } from '@/lib/api';

interface MeasurementData {
  date?: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

/**
 * Hook para obtener y gestionar el progreso del usuario
 * Usa React Query para caché automático
 */
export function useProgress() {
  const queryClient = useQueryClient();

  // Obtener progreso completo
  const progressQuery = useQuery<CompleteProgress>({
    queryKey: ['progress'],
    queryFn: () => progressApi.getComplete(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Agregar medida corporal
  const addMeasurementMutation = useMutation({
    mutationFn: (data: MeasurementData) => progressApi.createMeasurement(data),
    onSuccess: (newMeasurement) => {
      // Actualizar caché optimísticamente
      queryClient.setQueryData<CompleteProgress>(['progress'], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          measurements: [newMeasurement, ...prev.measurements],
        };
      });
    },
  });

  // Eliminar medida corporal
  const deleteMeasurementMutation = useMutation({
    mutationFn: (id: string) => progressApi.deleteMeasurement(id),
    onSuccess: (_, deletedId) => {
      // Actualizar caché
      queryClient.setQueryData<CompleteProgress>(['progress'], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          measurements: prev.measurements.filter((m) => m.id !== deletedId),
        };
      });
    },
  });

  return {
    progress: progressQuery.data ?? null,
    isLoading: progressQuery.isLoading,
    error: progressQuery.error?.message ?? null,
    refetch: progressQuery.refetch,

    // Mutations
    addMeasurement: addMeasurementMutation.mutateAsync,
    isAddingMeasurement: addMeasurementMutation.isPending,
    deleteMeasurement: deleteMeasurementMutation.mutateAsync,
    isDeletingMeasurement: deleteMeasurementMutation.isPending,

    // Errores de mutaciones
    addMeasurementError: addMeasurementMutation.error?.message,
    deleteMeasurementError: deleteMeasurementMutation.error?.message,
  };
}
