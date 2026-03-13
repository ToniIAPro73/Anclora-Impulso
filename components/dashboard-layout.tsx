"use client"

import { useEffect, useState, type ReactNode } from "react"

import { DashboardHeader } from "@/components/dashboard-header"
import { Navigation } from "@/components/navigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const savedState = window.localStorage.getItem("anclora-impulso-sidebar-collapsed")
    if (savedState === "true") {
      setIsCollapsed(true)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex flex-1 flex-col overflow-hidden transition-[padding] duration-300 ${isCollapsed ? "lg:pl-24" : "lg:pl-64"}`}>
        <DashboardHeader />
        <main className="h-full overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
