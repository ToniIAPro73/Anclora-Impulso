"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { db, type Exercise } from "@/lib/storage/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExerciseLibrary } from "@/components/exercise-library"

export default function ExercisesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Fetch exercises from IndexedDB
    db.getAll<Exercise>("exercises").then((data) => {
      setExercises(data)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Exercise Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover and learn proper form for hundreds of exercises</p>
        </div>
        <ExerciseLibrary exercises={exercises} />
      </div>
    </DashboardLayout>
  )
}
