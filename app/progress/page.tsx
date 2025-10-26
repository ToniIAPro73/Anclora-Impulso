"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { db } from "@/lib/storage/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProgressTracker } from "@/components/progress-tracker"

export default function ProgressPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [measurements, setMeasurements] = useState([])
  const [personalRecords, setPersonalRecords] = useState([])
  const [workoutSessions, setWorkoutSessions] = useState([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Fetch body measurements
      db.getByIndex("measurements", "userId", user.id).then((data) => {
        setMeasurements(data)
      })

      // Fetch workout sessions
      db.getByIndex("sessions", "userId", user.id).then((data) => {
        setWorkoutSessions(data.slice(0, 30))
      })
    }
  }, [user])

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Progress Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your fitness journey and celebrate your achievements
          </p>
        </div>
        <ProgressTracker
          user={user}
          profile={{ full_name: user.fullName, fitness_level: "intermediate" }}
          measurements={measurements}
          personalRecords={personalRecords}
          workoutSessions={workoutSessions}
        />
      </div>
    </DashboardLayout>
  )
}
