import { useState, useEffect } from 'react';
import { progressApi, type CompleteProgress, type BodyMeasurement } from '@/lib/api';

export function useProgress() {
  const [progress, setProgress] = useState<CompleteProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await progressApi.getComplete();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar progreso');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const addMeasurement = async (data: {
    date?: string;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  }) => {
    const newMeasurement = await progressApi.createMeasurement(data);
    
    // Actualizar estado local
    if (progress) {
      setProgress({
        ...progress,
        measurements: [newMeasurement, ...progress.measurements],
      });
    }
    
    return newMeasurement;
  };

  const deleteMeasurement = async (id: string) => {
    await progressApi.deleteMeasurement(id);
    
    // Actualizar estado local
    if (progress) {
      setProgress({
        ...progress,
        measurements: progress.measurements.filter((m) => m.id !== id),
      });
    }
  };

  return {
    progress,
    isLoading,
    error,
    addMeasurement,
    deleteMeasurement,
    refetch: fetchProgress,
  };
}
