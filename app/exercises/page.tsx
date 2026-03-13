"use client"

import { ExerciseLibrary } from "@/components/exercise-library"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { useLanguage } from "@/lib/contexts/language-context"

export default function ExercisesPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <ProtectedDashboardPage>
      <div className="p-6 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSpanish ? "Biblioteca de Ejercicios" : "Exercise Library"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSpanish
              ? "Descubre y aprende la ejecución correcta de cada ejercicio"
              : "Discover exercises and learn the correct execution of each one"}
          </p>
        </div>
        <ExerciseLibrary />
      </div>
    </ProtectedDashboardPage>
  )
}
