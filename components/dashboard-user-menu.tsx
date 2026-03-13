"use client"

import { LogOut, UserCircle, ChevronDown } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { cn } from "@/lib/utils"

export function DashboardUserMenu() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Usuario"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-12 rounded-full border-orange-200/80 bg-white/80 pl-1 pr-3 dark:border-orange-400/10 dark:bg-slate-950/70"
        >
          <BrandLogo size={38} className="rounded-full border-orange-300/70 shadow-none" imageClassName="p-1.5" />
          <span className="hidden max-w-[120px] truncate text-sm text-slate-700 dark:text-slate-200 sm:inline">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl border-orange-200/80 bg-white/95 p-2 backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/95">
        <DropdownMenuLabel className="px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-orange-600/80 dark:text-orange-300/80">Anclora Impulso</p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-xl px-3 py-2.5">
          <UserCircle className="mr-2 h-4 w-4" />
          <span className={cn("text-sm")}>{t.navigation.profile}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout()
            window.location.replace("/auth/login")
          }}
          className="rounded-xl px-3 py-2.5 text-red-600 focus:text-red-700 dark:text-red-300 dark:focus:text-red-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-sm">{t.navigation.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
