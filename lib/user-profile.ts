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

export interface UserProfile {
  avatarDataUrl?: string | null
  age?: number | null
  heightCm?: number | null
  weightKg?: number | null
  targetWeightKg?: number | null
  timeframeWeeks?: number | null
  trainingDaysPerWeek?: number | null
  recommendedPlan?: RecommendedWorkoutPlan | null
}

const DEFAULT_PROFILE: UserProfile = {
  avatarDataUrl: null,
  age: null,
  heightCm: null,
  weightKg: null,
  targetWeightKg: null,
  timeframeWeeks: null,
  trainingDaysPerWeek: null,
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

export function buildRecommendedPlan(profile: UserProfile): RecommendedWorkoutPlan | null {
  const targetWeightKg = profile.targetWeightKg ?? null
  const weightKg = profile.weightKg ?? null
  const trainingDaysPerWeek = profile.trainingDaysPerWeek ?? null
  const timeframeWeeks = profile.timeframeWeeks ?? null

  if (!weightKg || !targetWeightKg || !trainingDaysPerWeek || !timeframeWeeks) {
    return null
  }

  const delta = Number((targetWeightKg - weightKg).toFixed(1))
  const wantsToLoseWeight = delta < 0
  const wantsToGainWeight = delta > 0

  const workoutType = wantsToLoseWeight
    ? (trainingDaysPerWeek >= 4 ? "hiit" : "cardio")
    : wantsToGainWeight
      ? "strength"
      : "full_body"

  const difficulty =
    trainingDaysPerWeek <= 2
      ? "beginner"
      : trainingDaysPerWeek <= 4
        ? "intermediate"
        : "advanced"

  const duration = trainingDaysPerWeek <= 2 ? 35 : trainingDaysPerWeek <= 4 ? 45 : 60

  const targetMuscles =
    wantsToLoseWeight
      ? ["legs", "core", "glutes"]
      : wantsToGainWeight
        ? ["chest", "back", "shoulders", "legs"]
        : ["legs", "back", "core"]

  const weeklySplit = wantsToLoseWeight
    ? [
        "Dia 1: Piernas + core + cardio suave",
        "Dia 2: Full body metabolico",
        "Dia 3: Cardio interválico + movilidad",
        "Dia 4: Fuerza global + core",
        "Dia 5: Caminata larga o cardio moderado",
      ]
    : wantsToGainWeight
      ? [
          "Dia 1: Pecho + hombro + triceps",
          "Dia 2: Espalda + biceps",
          "Dia 3: Piernas + gluteos",
          "Dia 4: Full body tecnico",
          "Dia 5: Accesorios + core",
        ]
      : [
          "Dia 1: Full body",
          "Dia 2: Tren inferior + core",
          "Dia 3: Tren superior",
          "Dia 4: Cardio + movilidad",
        ]

  const daysToUse = Math.max(1, Math.min(trainingDaysPerWeek, weeklySplit.length))
  const weeklySummary = wantsToLoseWeight
    ? `Objetivo de bajar ${Math.abs(delta)} kg en ${timeframeWeeks} semanas con ${trainingDaysPerWeek} dias de entreno.`
    : wantsToGainWeight
      ? `Objetivo de subir ${delta} kg en ${timeframeWeeks} semanas con ${trainingDaysPerWeek} dias de entreno.`
      : `Objetivo de recomposición corporal y mantenimiento durante ${timeframeWeeks} semanas.`

  return {
    title: wantsToLoseWeight ? "Plan de definición" : wantsToGainWeight ? "Plan de ganancia muscular" : "Plan de recomposición",
    summary: weeklySummary,
    workoutType,
    duration,
    difficulty,
    targetMuscles,
    equipment: ["bodyweight", "dumbbells"],
    weeklySplit: weeklySplit.slice(0, daysToUse),
  }
}
