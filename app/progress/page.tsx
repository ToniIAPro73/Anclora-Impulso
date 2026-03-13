"use client"

import { ProgressTracker } from "@/components/progress-tracker"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"

export default function ProgressPage() {
  return (
    <ProtectedDashboardPage>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Seguimiento de Progreso</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitorea tu viaje fitness y celebra tus logros
          </p>
        </div>
        <ProgressTracker />
      </div>
    </ProtectedDashboardPage>
  )
}
