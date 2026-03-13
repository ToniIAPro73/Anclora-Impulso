"use client"

import { ExerciseLibrary } from "@/components/exercise-library"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"

export default function ExercisesPage() {
  return (
    <ProtectedDashboardPage>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Biblioteca de Ejercicios</h1>
          <p className="text-gray-600 dark:text-gray-400">Descubre y aprende la forma correcta de cientos de ejercicios</p>
        </div>
        <ExerciseLibrary />
      </div>
    </ProtectedDashboardPage>
  )
}
