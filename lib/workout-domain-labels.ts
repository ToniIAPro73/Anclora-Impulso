export type AppLanguage = "es" | "en"

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "glutes",
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export const EQUIPMENT_TYPES = [
  "bodyweight",
  "dumbbells",
  "barbell",
  "kettlebell",
  "resistance_bands",
  "pull_up_bar",
  "cables",
  "machine",
  "jump_rope",
] as const

export type Equipment = (typeof EQUIPMENT_TYPES)[number]

const MUSCLE_GROUP_LABELS: Record<AppLanguage, Record<MuscleGroup, string>> = {
  es: {
    chest: "Pecho",
    back: "Espalda",
    shoulders: "Hombros",
    arms: "Brazos",
    legs: "Piernas",
    core: "Core",
    glutes: "Glúteos",
  },
  en: {
    chest: "Chest",
    back: "Back",
    shoulders: "Shoulders",
    arms: "Arms",
    legs: "Legs",
    core: "Core",
    glutes: "Glutes",
  },
}

const EQUIPMENT_LABELS: Record<AppLanguage, Record<Equipment, string>> = {
  es: {
    bodyweight: "Peso corporal",
    dumbbells: "Mancuernas",
    barbell: "Barra",
    kettlebell: "Kettlebell",
    resistance_bands: "Bandas de resistencia",
    pull_up_bar: "Barra de dominadas",
    cables: "Poleas",
    machine: "Máquina",
    jump_rope: "Comba",
  },
  en: {
    bodyweight: "Bodyweight",
    dumbbells: "Dumbbells",
    barbell: "Barbell",
    kettlebell: "Kettlebell",
    resistance_bands: "Resistance bands",
    pull_up_bar: "Pull-up bar",
    cables: "Cables",
    machine: "Machine",
    jump_rope: "Jump rope",
  },
}

const DIFFICULTY_LABELS: Record<AppLanguage, Record<string, string>> = {
  es: {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  },
  en: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
}

const CATEGORY_LABELS: Record<AppLanguage, Record<string, string>> = {
  es: {
    strength: "Fuerza",
    cardio: "Cardio",
    flexibility: "Flexibilidad",
    balance: "Equilibrio",
  },
  en: {
    strength: "Strength",
    cardio: "Cardio",
    flexibility: "Flexibility",
    balance: "Balance",
  },
}

function formatUnknownDomainValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getMuscleGroupLabel(language: AppLanguage, muscleGroup: string) {
  if (isMuscleGroup(muscleGroup)) {
    return MUSCLE_GROUP_LABELS[language][muscleGroup as MuscleGroup]
  }

  return formatUnknownDomainValue(muscleGroup)
}

export function getEquipmentLabel(language: AppLanguage, equipment: string) {
  if (isEquipment(equipment)) {
    return EQUIPMENT_LABELS[language][equipment as Equipment]
  }

  return formatUnknownDomainValue(equipment)
}

export function getDifficultyLabel(language: AppLanguage, difficulty: string) {
  return DIFFICULTY_LABELS[language][difficulty] ?? formatUnknownDomainValue(difficulty)
}

export function getCategoryLabel(language: AppLanguage, category: string) {
  return CATEGORY_LABELS[language][category] ?? formatUnknownDomainValue(category)
}

export function isMuscleGroup(value: string): value is MuscleGroup {
  return MUSCLE_GROUPS.includes(value as MuscleGroup)
}

export function isEquipment(value: string): value is Equipment {
  return EQUIPMENT_TYPES.includes(value as Equipment)
}
