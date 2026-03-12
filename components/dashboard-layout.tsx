import type React from "react"
import { Navigation } from "@/components/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="flex-1 overflow-hidden lg:pl-64">
        <main className="h-full overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
