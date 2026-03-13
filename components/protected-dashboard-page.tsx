"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ErrorBoundary } from "@/components/error-boundary"
import { ErrorHandlerSetup } from "@/components/error-handler-setup"
import { useAuth, AuthProvider } from "@/lib/contexts/auth-context"
import { ReactQueryProvider } from "@/lib/providers/query-client"

function ProtectedDashboardInner({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login")
    }
  }, [isLoading, router, user])

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

  return <DashboardLayout>{children}</DashboardLayout>
}

export function ProtectedDashboardPage({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ErrorHandlerSetup />
      <ReactQueryProvider>
        <AuthProvider>
          <ProtectedDashboardInner>{children}</ProtectedDashboardInner>
        </AuthProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  )
}
