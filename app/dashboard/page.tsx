"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { db } from "@/lib/storage/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [recentSessions, setRecentSessions] = useState([])
  const [recentRecords, setRecentRecords] = useState([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Fetch recent workout sessions
      db.getByIndex("sessions", "userId", user.id).then((sessions) => {
        setRecentSessions(sessions.slice(0, 5))
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
      <DashboardContent
        user={user}
        profile={{ full_name: user.fullName, fitness_level: "intermediate" }}
        recentSessions={recentSessions}
        recentRecords={recentRecords}
      />
    </DashboardLayout>
  )
}
