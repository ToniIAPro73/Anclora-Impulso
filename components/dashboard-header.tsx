"use client"

import { useMemo } from "react"
import { Globe, Moon, Monitor, Sun } from "lucide-react"

import { DashboardUserMenu } from "@/components/dashboard-user-menu"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { useTheme } from "@/lib/contexts/theme-context"

export function DashboardHeader() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  const welcomeMessage = useMemo(() => {
    const name = user?.fullName || user?.email?.split("@")[0] || "Usuario"
    return `${t.dashboard.welcome}, ${name}`
  }, [t, user?.email, user?.fullName])

  return (
    <header className="sticky top-0 z-30 flex min-h-18 flex-col justify-center gap-3 border-b border-orange-200/70 bg-white/78 px-4 py-3 backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/82 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[clamp(1rem,1.8vw,1.85rem)] font-semibold leading-tight text-slate-900 dark:text-white">
          {welcomeMessage}
        </h2>
        <p className="truncate text-[clamp(0.72rem,0.95vw,0.92rem)] text-slate-600 dark:text-slate-400">
          {t.dashboard.readyMessage}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 rounded-2xl bg-white/80 px-3 dark:bg-slate-950/70">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </span>
              <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
                {theme === "system" ? t.dashboard.autoTheme : theme === "light" ? t.settings.light : t.settings.dark}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              {t.settings.light}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              {t.settings.dark}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              {t.settings.system}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 rounded-2xl bg-white/80 px-3 dark:bg-slate-950/70">
              <Globe className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{language === "es" ? "ES" : "EN"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => setLanguage("es")}>{t.settings.spanish}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>{t.settings.english}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DashboardUserMenu />
      </div>
    </header>
  )
}
