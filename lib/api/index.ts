import { apiClient } from './client';

// ========== TYPES ==========

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  rest: number;
  order: number;
  exercise: Exercise;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutExercise[];
}

export interface SessionSet {
  reps: number;
  weight: number;
  order: number;
}

export interface SessionExercise {
  exerciseId: string;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  completedAt: string;
  duration: number;
  notes?: string;
  workout: {
    id: string;
    name: string;
  };
  exercises: {
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
    };
    sets: SessionSet[];
  }[];
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export interface ProgressStats {
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  totalDuration: number;
  avgDuration: number;
  personalRecords: Array<{
    exercise_id: string;
    exercise_name: string;
    max_weight: number;
    date: string;
  }>;
}

export interface CompleteProgress {
  stats: ProgressStats;
  measurements: BodyMeasurement[];
  charts: {
    weight: Array<{ date: string; weight: number }>;
    bodyFat: Array<{ date: string; bodyFat: number }>;
    frequency: Array<{ week: string; count: number }>;
  };
}

// ========== EXERCISES API ==========

export const exercisesApi = {
  async getAll(filters?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Exercise[]>(`/exercises${query}`);
  },

  async getById(id: string): Promise<Exercise> {
    return apiClient.get<Exercise>(`/exercises/${id}`);
  },

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>('/exercises/meta/categories');
  },

  async getMuscleGroups(): Promise<string[]> {
    return apiClient.get<string[]>('/exercises/meta/muscle-groups');
  },

  async getEquipment(): Promise<string[]> {
    return apiClient.get<string[]>('/exercises/meta/equipment');
  },
};

// ========== WORKOUTS API ==========

export const workoutsApi = {
  async getAll(): Promise<Workout[]> {
    return apiClient.get<Workout[]>('/workouts');
  },

  async getById(id: string): Promise<Workout> {
    return apiClient.get<Workout>(`/workouts/${id}`);
  },

  async create(data: {
    name: string;
    exercises: Array<{
      exerciseId: string;
      sets: number;
      reps: number;
      rest: number;
      order: number;
    }>;
  }): Promise<Workout> {
    return apiClient.post<Workout>('/workouts', data);
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      exercises: Array<{
        exerciseId: string;
        sets: number;
        reps: number;
        rest: number;
        order: number;
      }>;
    }>
  ): Promise<Workout> {
    return apiClient.put<Workout>(`/workouts/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/workouts/${id}`);
  },

  async generate(params: {
    workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'full_body';
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    targetMuscles?: string[];
    equipment?: string[];
  }): Promise<Workout> {
    return apiClient.post<Workout>('/workouts/generate', params);
  },
};

// ========== SESSIONS API ==========

export const sessionsApi = {
  async getAll(limit?: number): Promise<WorkoutSession[]> {
    const query = limit ? `?limit=${limit}` : '';
    return apiClient.get<WorkoutSession[]>(`/sessions${query}`);
  },

  async getById(id: string): Promise<WorkoutSession> {
    return apiClient.get<WorkoutSession>(`/sessions/${id}`);
  },

  async create(data: {
    workoutId: string;
    duration: number;
    notes?: string;
    exercises: SessionExercise[];
  }): Promise<WorkoutSession> {
    return apiClient.post<WorkoutSession>('/sessions', data);
  },

  async update(
    id: string,
    data: Partial<{
      duration: number;
      notes?: string;
    }>
  ): Promise<WorkoutSession> {
    return apiClient.put<WorkoutSession>(`/sessions/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/sessions/${id}`);
  },
};

// ========== PROGRESS API ==========

export const progressApi = {
  async getStats(): Promise<ProgressStats> {
    return apiClient.get<ProgressStats>('/progress/stats');
  },

  async getComplete(): Promise<CompleteProgress> {
    return apiClient.get<CompleteProgress>('/progress/complete');
  },

  async getMeasurements(): Promise<BodyMeasurement[]> {
    return apiClient.get<BodyMeasurement[]>('/progress/measurements');
  },

  async createMeasurement(data: {
    date?: string;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  }): Promise<BodyMeasurement> {
    return apiClient.post<BodyMeasurement>('/progress/measurements', data);
  },

  async updateMeasurement(
    id: string,
    data: Partial<{
      date?: string;
      weight?: number;
      bodyFat?: number;
      chest?: number;
      waist?: number;
      hips?: number;
      arms?: number;
      thighs?: number;
    }>
  ): Promise<BodyMeasurement> {
    return apiClient.put<BodyMeasurement>(`/progress/measurements/${id}`, data);
  },

  async deleteMeasurement(id: string): Promise<void> {
    return apiClient.delete(`/progress/measurements/${id}`);
  },
};

// Export all
export * from './auth';
export { apiClient } from './client';
