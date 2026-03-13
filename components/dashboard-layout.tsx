"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard-header"
import { Navigation } from "@/components/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const isDashboardRoute = pathname === "/dashboard"

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
        <main
          className={cn(
            "h-full overflow-y-auto overflow-x-hidden",
            isDashboardRoute && "lg:overflow-hidden"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
