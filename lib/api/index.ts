import type { UserProfile } from '@/lib/user-profile';
import { apiClient } from './client';

// ========== TYPES ==========

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  trainingEnvironments: Array<'gym' | 'home' | 'outdoor'>;
  difficulty: string;
  description: string;
  instructions: string[];
  imageUrl?: string | null;
  videoUrl?: string | null;
  editorial?: {
    qualityScore: number;
    editorialStatus: 'ready' | 'review' | 'needs_work';
    autoEditorialStatus?: 'ready' | 'review' | 'needs_work';
    editorialNotes?: string | null;
    checks: {
      hasDescription: boolean;
      hasEnoughInstructions: boolean;
      hasEnvironment: boolean;
      hasImage: boolean;
      hasDifficulty: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesResponse {
  data: Exercise[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface EditorialSummary {
  total: number;
  averageQualityScore: number;
  byStatus: {
    ready: number;
    review: number;
    needs_work: number;
  };
  exercises: Exercise[];
}

export interface RecipeEditorialSummary {
  total: number;
  averageQualityScore: number;
  byStatus: {
    ready: number;
    review: number;
    needs_work: number;
  };
  recipes: Recipe[];
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

export interface RecommendationExplanation {
  headline: string;
  summary: string;
  reasons: string[];
  signals?: Array<{
    label: string;
    value: string;
  }>;
  nextBestAction?: {
    label: string;
    href: string;
  };
  adjustment?: string;
  focusMuscles?: string[];
  averageRest?: number | null;
}

export interface EngagementNudge {
  id: string;
  kind: 'onboarding' | 'workout' | 'nutrition' | 'weekly_review' | 'reactivation';
  priority: 'high' | 'medium' | 'low';
  href: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface NotificationDelivery {
  id: string;
  kind: string;
  channel: string;
  status: 'pending' | 'sent' | 'failed';
  subject: string;
  body: string;
  href?: string | null;
  failureReason?: string | null;
  createdAt: string;
  sentAt?: string | null;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutExercise[];
  explanation?: RecommendationExplanation;
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
  insights: {
    profileCompletion: number;
    missingProfileFields: string[];
    weeklyTarget: number | null;
    workoutsLast7Days: number;
    workoutsLast28Days: number;
    adherenceRate: number | null;
    nutritionLogDaysLast7: number;
    nutritionConsistencyRate: number | null;
    weightTrend: {
      direction: 'up' | 'down' | 'stable' | 'insufficient_data';
      deltaKg: number | null;
    };
    stagnationRisk: 'low' | 'medium' | 'high';
    workoutAdjustment: 'reduce' | 'maintain' | 'increase';
    nutritionAdjustment: 'reduce' | 'maintain' | 'increase';
    preferredMuscleGroups: string[];
    averageSessionDuration: number | null;
    explanation?: RecommendationExplanation;
  };
}

export type ProfilePayload = Omit<UserProfile, 'recommendedPlan'>;

// ========== EXERCISES API ==========

export const exercisesApi = {
  async getAll(filters?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    environment?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Exercise[] | ExercisesResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
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

  async getEditorialSummary(): Promise<EditorialSummary> {
    return apiClient.get<EditorialSummary>('/exercises/editorial/summary');
  },

  async bulkUpdateEditorial(data: {
    ids: string[];
    editorialOverrideStatus: 'ready' | 'review' | 'needs_work';
    editorialNotes?: string | null;
  }): Promise<Exercise[]> {
    return apiClient.post<Exercise[]>('/exercises/editorial/bulk-update', data);
  },

  async create(data: {
    name: string;
    category: string;
    muscleGroup: string;
    equipment: string;
    trainingEnvironments: Array<'gym' | 'home' | 'outdoor'>;
    difficulty: string;
    description: string;
    instructions: string[];
  }): Promise<Exercise> {
    return apiClient.post<Exercise>('/exercises', data);
  },

  async update(id: string, data: Partial<{
    name: string;
    category: string;
    muscleGroup: string;
    equipment: string;
    trainingEnvironments: Array<'gym' | 'home' | 'outdoor'>;
    difficulty: string;
    description: string;
    instructions: string[];
    editorialOverrideStatus: 'ready' | 'review' | 'needs_work' | null;
    editorialNotes: string | null;
  }>): Promise<Exercise> {
    return apiClient.put<Exercise>(`/exercises/${id}`, data);
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
    trainingEnvironment: 'gym' | 'home' | 'outdoor';
    targetMuscles?: string[];
    equipment?: string[];
    age?: number;
    sex?: 'male' | 'female';
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

export const profileApi = {
  async get(): Promise<ProfilePayload> {
    return apiClient.get<ProfilePayload>('/profile');
  },

  async update(data: Partial<ProfilePayload>): Promise<ProfilePayload> {
    return apiClient.put<ProfilePayload>('/profile', data);
  },
};

export const eventsApi = {
  async track(data: {
    action: string;
    category: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }) {
    return apiClient.post('/events', data);
  },

  async getSummary(): Promise<{
    totalLast28Days: number;
    last7Days: Array<{ action: string; count: number }>;
    topActions: Array<{ action: string; category: string; count: number }>;
    topSources: Array<{ source: string | null; count: number }>;
  }> {
    return apiClient.get('/events/summary');
  },
};

export const engagementApi = {
  async getNudges(): Promise<{
    reminderTime: string | null;
    remindersEnabled: boolean;
    nudges: EngagementNudge[];
  }> {
    return apiClient.get('/engagement/nudges');
  },
  async getDeliveries(): Promise<NotificationDelivery[]> {
    return apiClient.get('/engagement/deliveries');
  },
  async dispatchNow(): Promise<{ created: number; sent: number; failed: number }> {
    return apiClient.post('/engagement/admin/dispatch-now', {});
  },
  async getRecentDeliveries(): Promise<Array<NotificationDelivery & { user: { email: string; fullName: string } }>> {
    return apiClient.get('/engagement/admin/deliveries');
  },
};

// ========== NUTRITION TYPES ==========

export interface RecipeIngredient {
  id: string;
  quantity: number;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface Recipe {
  id: string;
  userId?: string | null;
  name: string;
  nameEn?: string;
  description?: string;
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings: number;
  difficulty?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  imageUrl?: string;
  tags: string[];
  source?: 'system' | 'ai' | 'user';
  isPublic?: boolean;
  isEditable?: boolean;
  mealTypes?: string[];
  dietTypes?: string[];
  goalTypes?: string[];
  ingredients: RecipeIngredient[];
  updatedAt: string;
  editorial?: {
    qualityScore: number;
    editorialStatus: 'ready' | 'review' | 'needs_work';
    autoEditorialStatus?: 'ready' | 'review' | 'needs_work';
    editorialNotes?: string | null;
    checks: {
      hasDescription: boolean;
      hasEnoughInstructions: boolean;
      hasImage: boolean;
      hasDifficulty: boolean;
      hasMacros: boolean;
      hasTags: boolean;
      hasIngredients: boolean;
    };
  };
}

export interface RecipeLibraryResponse {
  recipes: Recipe[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface MealRecipe {
  id: string;
  recipe: Recipe;
}

export interface Meal {
  id: string;
  dayOfWeek: number;
  mealType: string;
  servingMultiplier: number;
  adjustmentReason?: string | null;
  selectedRecipeId?: string | null;
  selectedRecipe?: Recipe | null;
  recipes: MealRecipe[];
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  goal?: string;
  dietType?: string | null;
  carryoverCaloriesApplied: number;
  createdAt: string;
  meals: Meal[];
  explanation?: RecommendationExplanation;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  consumedAt?: string | null;
  mealType: string;
  recipeId?: string;
  name?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface NutritionSummary {
  period: 'day' | 'week';
  totals: { calories: number; protein: number; carbs: number; fat: number; count: number };
  averages: { calories: number; protein: number; carbs: number; fat: number };
  logCount: number;
  intermittentFasting: {
    enabled: boolean;
    targetFastingHours: number;
    eatingWindowHours: number | null;
    fastingHours: number | null;
    firstIntakeAt: string | null;
    lastIntakeAt: string | null;
    snackCount: number;
    exceededWindow: boolean;
    carryoverCalories: number;
  };
}

// ========== NUTRITION API ==========

export const nutritionApi = {
  async generateMealPlan(params: {
    goal?: string;
    difficulty?: 'facil' | 'medio' | 'dificil';
    dietType?: 'ninguna' | 'mediterranea' | 'dash' | 'ayuno_intermitente' | 'alta_proteina';
    maxIngredients?: number;
    includeIngredients?: string[];
    dietaryRestrictions?: string[];
    age?: number;
    sex?: 'male' | 'female';
    weightKg?: number;
    targetWeightKg?: number;
    trainingDaysPerWeek?: number;
  }): Promise<MealPlan> {
    return apiClient.post<MealPlan>('/nutrition/meal-plans/generate', params);
  },

  async getMealPlans(): Promise<MealPlan[]> {
    return apiClient.get<MealPlan[]>('/nutrition/meal-plans');
  },

  async getMealPlanById(id: string): Promise<MealPlan> {
    return apiClient.get<MealPlan>(`/nutrition/meal-plans/${id}`);
  },

  async deleteMealPlan(id: string): Promise<void> {
    return apiClient.delete(`/nutrition/meal-plans/${id}`);
  },

  async getRecipeById(id: string): Promise<Recipe> {
    return apiClient.get<Recipe>(`/nutrition/recipes/${id}`);
  },

  async listRecipes(params?: {
    query?: string;
    mealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
    dietType?: 'ninguna' | 'mediterranea' | 'dash' | 'ayuno_intermitente' | 'alta_proteina';
    goalType?: string;
    source?: 'system' | 'ai' | 'user';
    scope?: 'all' | 'mine' | 'public';
    limit?: number;
    offset?: number;
  }): Promise<RecipeLibraryResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<RecipeLibraryResponse>(`/nutrition/recipes${suffix}`);
  },

  async createRecipe(
    data: {
      name: string;
      nameEn?: string | null;
      description?: string | null;
      instructions: string[];
      prepTime?: number | null;
      cookTime?: number | null;
      servings?: number;
      difficulty?: string | null;
      calories?: number | null;
      protein?: number | null;
      carbs?: number | null;
      fat?: number | null;
      fiber?: number | null;
      imageUrl?: string | null;
      tags?: string[];
      mealTypes?: Array<'desayuno' | 'almuerzo' | 'cena' | 'snack'>;
      dietTypes?: Array<'ninguna' | 'mediterranea' | 'dash' | 'ayuno_intermitente' | 'alta_proteina'>;
      goalTypes?: string[];
      ingredients: Array<{
        name: string;
        quantity: number;
        unit: string;
      }>;
    }
  ): Promise<Recipe> {
    return apiClient.post<Recipe>('/nutrition/recipes', data);
  },

  async replaceMealRecipe(
    mealId: string,
    data: {
      recipeId: string;
      reason?: string | null;
    }
  ): Promise<MealPlan> {
    return apiClient.post<MealPlan>(`/nutrition/meals/${mealId}/replace`, data);
  },

  async getRecipeEditorialSummary(): Promise<RecipeEditorialSummary> {
    return apiClient.get<RecipeEditorialSummary>('/nutrition/editorial/summary');
  },

  async updateRecipe(
    id: string,
    data: Partial<{
      name: string;
      nameEn: string | null;
      description: string | null;
      instructions: string[];
      prepTime: number | null;
      cookTime: number | null;
      difficulty: string | null;
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      fiber: number | null;
      imageUrl: string | null;
      tags: string[];
      editorialOverrideStatus: 'ready' | 'review' | 'needs_work' | null;
      editorialNotes: string | null;
    }>
  ): Promise<Recipe> {
    return apiClient.put<Recipe>(`/nutrition/recipes/${id}`, data);
  },

  async bulkUpdateRecipeEditorial(data: {
    ids: string[];
    editorialOverrideStatus: 'ready' | 'review' | 'needs_work';
    editorialNotes?: string | null;
  }): Promise<Recipe[]> {
    return apiClient.post<Recipe[]>('/nutrition/recipes/editorial/bulk-update', data);
  },

  async logNutrition(data: {
    mealType: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
    recipeId?: string;
    name?: string;
    consumedAt?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes?: string;
    date?: string;
  }): Promise<NutritionLog> {
    return apiClient.post<NutritionLog>('/nutrition/log', data);
  },

  async getLogs(period: 'day' | 'week' = 'day'): Promise<NutritionLog[]> {
    return apiClient.get<NutritionLog[]>(`/nutrition/logs?period=${period}`);
  },

  async getSummary(period: 'day' | 'week' = 'day'): Promise<NutritionSummary> {
    return apiClient.get<NutritionSummary>(`/nutrition/summary?period=${period}`);
  },
};

// ========== GAMIFICATION TYPES ==========

export interface GamificationStatus {
  id: string;
  userId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt?: string;
  xpProgress: number;
  xpToNextLevel: number;
  progressPercent: number;
}

export interface Achievement {
  id: string;
  key: string;
  nameEs: string;
  nameEn: string;
  descEs: string;
  descEn: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface XPEvent {
  id: string;
  userId: string;
  action: string;
  xp: number;
  createdAt: string;
}

// ========== GAMIFICATION API ==========

export const gamificationApi = {
  async getStatus(): Promise<GamificationStatus> {
    return apiClient.get<GamificationStatus>('/gamification/status');
  },

  async getAchievements(): Promise<Achievement[]> {
    return apiClient.get<Achievement[]>('/gamification/achievements');
  },

  async getXPHistory(limit = 20): Promise<XPEvent[]> {
    return apiClient.get<XPEvent[]>(`/gamification/xp-history?limit=${limit}`);
  },
};

// Export all
export * from './auth';
export { apiClient } from './client';
