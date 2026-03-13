"use client"

import { useMemo } from "react"
import { Activity, Globe, Moon, Monitor, Sun } from "lucide-react"

import { DashboardUserMenu } from "@/components/dashboard-user-menu"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { useTheme } from "@/lib/contexts/theme-context"

export function DashboardHeader() {
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()

  const welcomeMessage = useMemo(() => {
    const name = user?.fullName || user?.email?.split("@")[0] || "Usuario"
    return language === "es" ? `Bienvenido de nuevo, ${name}` : `Welcome back, ${name}`
  }, [language, user?.email, user?.fullName])

  const statusMessage = language === "es"
    ? "¿Listo para alcanzar tus objetivos de fitness hoy?"
    : "Ready to push your fitness goals today?"

  return (
    <header className="sticky top-0 z-30 flex min-h-20 flex-col justify-center gap-3 border-b border-orange-200/70 bg-white/78 px-4 py-4 backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/82 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white md:text-xl">{welcomeMessage}</h2>
        <p className="truncate text-xs text-slate-600 dark:text-slate-400 md:text-sm">{statusMessage}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        <div className="hidden items-center gap-2 rounded-2xl border border-orange-200/70 bg-white/75 px-3 py-2 text-xs text-slate-600 dark:border-orange-400/10 dark:bg-slate-900/65 dark:text-slate-300 lg:flex">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span>{language === "es" ? "Estado: activo" : "Status: active"}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-2xl bg-white/80 px-3 dark:bg-slate-950/70">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </span>
              <span className="ml-4 text-xs font-semibold uppercase tracking-[0.16em]">
                {theme === "system" ? "Auto" : theme === "light" ? "Light" : "Dark"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              Auto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 rounded-2xl bg-white/80 px-3 dark:bg-slate-950/70">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">{language === "es" ? "ES" : "EN"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DashboardUserMenu />
      </div>
    </header>
  )
}
