"use client"

import { WorkoutGenerator } from "@/components/workout-generator"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"

export default function GenerateWorkoutPage() {
  return (
    <ProtectedDashboardPage>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generar Entrenamiento</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea un entrenamiento personalizado basado en tus objetivos y preferencias
          </p>
        </div>
        <WorkoutGenerator />
      </div>
    </ProtectedDashboardPage>
  )
}
