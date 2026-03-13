"use client"

import { WorkoutGenerator } from "@/components/workout-generator"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { useLanguage } from "@/lib/contexts/language-context"

export default function GenerateWorkoutPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <ProtectedDashboardPage>
      <div className="p-6 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSpanish ? "Generar Entrenamiento" : "Generate Workout"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSpanish
              ? "Crea un entrenamiento personalizado según tus objetivos y preferencias"
              : "Create a personalized workout based on your goals and preferences"}
          </p>
        </div>
        <WorkoutGenerator />
      </div>
    </ProtectedDashboardPage>
  )
}
