"use client"

import { DashboardContent } from "@/components/dashboard-content"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"

export default function DashboardPage() {
  return (
    <ProtectedDashboardPage>
      <DashboardContent />
    </ProtectedDashboardPage>
  )
}
