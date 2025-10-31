"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { WorkoutGenerator } from "@/components/workout-generator"

export default function GenerateWorkoutPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generar Entrenamiento</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea un entrenamiento personalizado basado en tus objetivos y preferencias
          </p>
        </div>
        <WorkoutGenerator />
      </div>
    </DashboardLayout>
  )
}
