export interface RecommendedWorkoutPlan {
  title: string
  summary: string
  workoutType: "strength" | "cardio" | "hiit" | "flexibility" | "full_body"
  duration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  targetMuscles: string[]
  equipment: string[]
  weeklySplit: string[]
}

export type ProfileSex = "male" | "female"
export type TrainingGoal = "lose_weight" | "build_muscle" | "recomposition" | "maintain"
export type TrainingEnvironment = "gym" | "home" | "outdoor"
export type ExperienceLevel = "beginner" | "intermediate" | "advanced"
export type ProfileLanguage = "es" | "en"

export interface UserProfile {
  avatarDataUrl?: string | null
  sex?: ProfileSex | null
  age?: number | null
  heightCm?: number | null
  weightKg?: number | null
  targetWeightKg?: number | null
  timeframeWeeks?: number | null
  trainingDaysPerWeek?: number | null
  trainingGoal?: TrainingGoal | null
  preferredTrainingEnvironment?: TrainingEnvironment | null
  experienceLevel?: ExperienceLevel | null
  limitations?: string[]
  onboardingCompletedAt?: string | null
  remindersEnabled?: boolean
  reminderTime?: string | null
  reminderWorkout?: boolean
  reminderNutrition?: boolean
  reminderWeeklyReview?: boolean
  reminderReactivation?: boolean
  recommendedPlan?: RecommendedWorkoutPlan | null
}

const DEFAULT_PROFILE: UserProfile = {
  avatarDataUrl: null,
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  targetWeightKg: null,
  timeframeWeeks: null,
  trainingDaysPerWeek: null,
  trainingGoal: null,
  preferredTrainingEnvironment: null,
  experienceLevel: null,
  limitations: [],
  onboardingCompletedAt: null,
  remindersEnabled: true,
  reminderTime: "20:00",
  reminderWorkout: true,
  reminderNutrition: true,
  reminderWeeklyReview: true,
  reminderReactivation: true,
  recommendedPlan: null,
}

export function getProfileStorageKey(userId: string) {
  return `anclora-profile:${userId}`
}

export function getUserInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "Usuario"
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function calculateBmi(heightCm?: number | null, weightKg?: number | null) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null
  }

  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(1))
}

export function interpretBmi(bmi?: number | null) {
  if (!bmi) {
    return null
  }

  if (bmi < 18.5) return "Bajo peso"
  if (bmi < 25) return "En tu peso"
  if (bmi < 27) return "Ligero sobrepeso"
  if (bmi < 30) return "Sobrepeso"
  if (bmi < 35) return "Obesidad grado I"
  if (bmi < 40) return "Obesidad grado II"
  return "Obesidad grado III"
}

export function mergeUserProfile(profile?: Partial<UserProfile> | null): UserProfile {
  return {
    ...DEFAULT_PROFILE,
    ...profile,
  }
}

export function isProfileReadyForPlanGeneration(profile: UserProfile) {
  return Boolean(
    profile.sex &&
      profile.age &&
      profile.heightCm &&
      profile.weightKg &&
      profile.targetWeightKg &&
      profile.timeframeWeeks &&
      profile.trainingDaysPerWeek &&
      profile.trainingGoal &&
      profile.preferredTrainingEnvironment &&
      profile.experienceLevel,
  )
}

const PROFILE_COMPLETION_FIELDS = [
  "sex",
  "age",
  "heightCm",
  "weightKg",
  "targetWeightKg",
  "timeframeWeeks",
  "trainingDaysPerWeek",
  "trainingGoal",
  "preferredTrainingEnvironment",
  "experienceLevel",
] as const

export function getProfileCompletion(profile: UserProfile) {
  const missingFields = PROFILE_COMPLETION_FIELDS.filter((field) => {
    const value = profile[field]
    return value === null || value === undefined
  })

  return {
    percentage: Math.round(((PROFILE_COMPLETION_FIELDS.length - missingFields.length) / PROFILE_COMPLETION_FIELDS.length) * 100),
    missingFields,
    isComplete: missingFields.length === 0,
  }
}

export function buildRecommendedPlan(profile: UserProfile, language: ProfileLanguage = "es"): RecommendedWorkoutPlan | null {
  const age = profile.age ?? null
  const sex = profile.sex ?? null
  const targetWeightKg = profile.targetWeightKg ?? null
  const weightKg = profile.weightKg ?? null
  const trainingDaysPerWeek = profile.trainingDaysPerWeek ?? null
  const timeframeWeeks = profile.timeframeWeeks ?? null
  const trainingGoal = profile.trainingGoal ?? null
  const experienceLevel = profile.experienceLevel ?? null
  const preferredTrainingEnvironment = profile.preferredTrainingEnvironment ?? null
  const isFortyPlus = typeof age === "number" && age >= 40

  if (!weightKg || !targetWeightKg || !trainingDaysPerWeek || !timeframeWeeks) {
    return null
  }

  const delta = Number((targetWeightKg - weightKg).toFixed(1))
  const wantsToLoseWeight = trainingGoal ? trainingGoal === "lose_weight" : delta < 0
  const wantsToGainWeight = trainingGoal ? trainingGoal === "build_muscle" : delta > 0
  const wantsRecomposition = trainingGoal === "recomposition"

  const workoutType = isFortyPlus
    ? wantsToLoseWeight
      ? "strength"
      : wantsToGainWeight
        ? "strength"
        : "full_body"
    : wantsToLoseWeight
      ? (trainingDaysPerWeek >= 4 ? "hiit" : "cardio")
      : wantsToGainWeight
        ? "strength"
        : wantsRecomposition
          ? "strength"
          : "full_body"

  const difficulty =
    experienceLevel ?? (trainingDaysPerWeek <= 2
      ? "beginner"
      : trainingDaysPerWeek <= 4
        ? "intermediate"
        : isFortyPlus
          ? "intermediate"
          : "advanced")

  const duration = isFortyPlus
    ? trainingDaysPerWeek <= 2
      ? 30
      : trainingDaysPerWeek <= 4
        ? 40
        : 50
    : trainingDaysPerWeek <= 2
      ? 35
      : trainingDaysPerWeek <= 4
        ? 45
        : 60

  const targetMuscles =
    isFortyPlus && sex === "female"
      ? ["legs", "glutes", "back", "core"]
      : isFortyPlus && sex === "male"
        ? ["legs", "back", "core", "chest"]
        : wantsToLoseWeight
      ? ["legs", "core", "glutes"]
      : wantsToGainWeight
        ? ["chest", "back", "shoulders", "legs"]
        : ["legs", "back", "core"]

  const weeklySplit = isFortyPlus
    ? sex === "female"
      ? [
          language === "es" ? "Dia 1: Fuerza tren inferior + core" : "Day 1: Lower body strength + core",
          language === "es" ? "Dia 2: Tren superior + movilidad" : "Day 2: Upper body + mobility",
          language === "es" ? "Dia 3: Cardio moderado + caminata activa" : "Day 3: Moderate cardio + active walk",
          language === "es" ? "Dia 4: Fuerza global + estabilidad" : "Day 4: Full-body strength + stability",
          language === "es" ? "Dia 5: Movilidad + cardio suave" : "Day 5: Mobility + light cardio",
        ]
      : sex === "male"
        ? [
            language === "es" ? "Dia 1: Fuerza full body + core" : "Day 1: Full-body strength + core",
            language === "es" ? "Dia 2: Cardio moderado + movilidad" : "Day 2: Moderate cardio + mobility",
            language === "es" ? "Dia 3: Piernas + espalda" : "Day 3: Legs + back",
            language === "es" ? "Dia 4: Empujes, tracciones y core" : "Day 4: Push, pull and core",
            language === "es" ? "Dia 5: Caminata larga o cardio suave" : "Day 5: Long walk or light cardio",
          ]
        : [
            language === "es" ? "Dia 1: Fuerza global" : "Day 1: Full-body strength",
            language === "es" ? "Dia 2: Cardio moderado + movilidad" : "Day 2: Moderate cardio + mobility",
            language === "es" ? "Dia 3: Tren inferior + core" : "Day 3: Lower body + core",
            language === "es" ? "Dia 4: Tren superior + estabilidad" : "Day 4: Upper body + stability",
            language === "es" ? "Dia 5: Caminata larga o movilidad" : "Day 5: Long walk or mobility",
          ]
    : wantsToLoseWeight
      ? [
          language === "es" ? "Dia 1: Piernas + core + cardio suave" : "Day 1: Legs + core + light cardio",
          language === "es" ? "Dia 2: Full body metabolico" : "Day 2: Metabolic full body",
          language === "es" ? "Dia 3: Cardio interválico + movilidad" : "Day 3: Interval cardio + mobility",
          language === "es" ? "Dia 4: Fuerza global + core" : "Day 4: Full-body strength + core",
          language === "es" ? "Dia 5: Caminata larga o cardio moderado" : "Day 5: Long walk or moderate cardio",
        ]
      : wantsToGainWeight
        ? [
            language === "es" ? "Dia 1: Pecho + hombro + triceps" : "Day 1: Chest + shoulders + triceps",
            language === "es" ? "Dia 2: Espalda + biceps" : "Day 2: Back + biceps",
            language === "es" ? "Dia 3: Piernas + gluteos" : "Day 3: Legs + glutes",
            language === "es" ? "Dia 4: Full body tecnico" : "Day 4: Technical full body",
            language === "es" ? "Dia 5: Accesorios + core" : "Day 5: Accessories + core",
          ]
        : [
            language === "es" ? "Dia 1: Full body" : "Day 1: Full body",
            language === "es" ? "Dia 2: Tren inferior + core" : "Day 2: Lower body + core",
            language === "es" ? "Dia 3: Tren superior" : "Day 3: Upper body",
            language === "es" ? "Dia 4: Cardio + movilidad" : "Day 4: Cardio + mobility",
          ]

  const daysToUse = Math.max(1, Math.min(trainingDaysPerWeek, weeklySplit.length))
  const weeklySummary = isFortyPlus
    ? wantsToLoseWeight
      ? language === "es"
        ? `Plan 40+ para bajar ${Math.abs(delta)} kg en ${timeframeWeeks} semanas, priorizando fuerza, proteina y recuperacion con ${trainingDaysPerWeek} dias de entreno.`
        : `40+ plan to lose ${Math.abs(delta)} kg in ${timeframeWeeks} weeks, prioritizing strength, protein and recovery across ${trainingDaysPerWeek} training days.`
      : wantsToGainWeight
        ? language === "es"
          ? `Plan 40+ para subir ${delta} kg con foco en masa muscular, fuerza y recuperacion durante ${timeframeWeeks} semanas.`
          : `40+ plan to gain ${delta} kg with emphasis on muscle mass, strength and recovery over ${timeframeWeeks} weeks.`
        : language === "es"
          ? `Plan 40+ de recomposicion corporal con fuerza, movilidad y constancia durante ${timeframeWeeks} semanas.`
          : `40+ body recomposition plan with strength, mobility and consistency over ${timeframeWeeks} weeks.`
    : wantsToLoseWeight
      ? language === "es"
        ? `Objetivo de bajar ${Math.abs(delta)} kg en ${timeframeWeeks} semanas con ${trainingDaysPerWeek} dias de entreno.`
        : `Goal: lose ${Math.abs(delta)} kg in ${timeframeWeeks} weeks with ${trainingDaysPerWeek} training days.`
      : wantsToGainWeight
        ? language === "es"
          ? `Objetivo de subir ${delta} kg en ${timeframeWeeks} semanas con ${trainingDaysPerWeek} dias de entreno.`
          : `Goal: gain ${delta} kg in ${timeframeWeeks} weeks with ${trainingDaysPerWeek} training days.`
        : language === "es"
          ? `Objetivo de recomposición corporal y mantenimiento durante ${timeframeWeeks} semanas.`
          : `Goal: body recomposition and maintenance over ${timeframeWeeks} weeks.`

  return {
    title:
      wantsToLoseWeight
        ? language === "es"
          ? "Plan de definición"
          : "Cutting plan"
        : wantsToGainWeight
          ? language === "es"
            ? "Plan de ganancia muscular"
            : "Muscle gain plan"
          : language === "es"
            ? "Plan de recomposición"
            : "Recomposition plan",
    summary: weeklySummary,
    workoutType,
    duration,
    difficulty,
    targetMuscles,
    equipment:
      preferredTrainingEnvironment === "gym"
        ? ["machines", "barbell", "dumbbells"]
        : preferredTrainingEnvironment === "outdoor"
          ? ["bodyweight", "resistance_bands"]
          : ["bodyweight", "dumbbells", "resistance_bands"],
    weeklySplit: weeklySplit.slice(0, daysToUse),
  }
}
