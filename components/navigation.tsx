"use client"

import { type Dispatch, type SetStateAction, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Apple,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Home,
  LogOut,
  Menu,
  Trophy,
  TrendingUp,
  X,
  Zap,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { XPBar } from "@/components/xp-bar"
import { Button } from "@/components/ui/button"
import { uiMotion } from "@/lib/ui-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/auth-context"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Nutrition", href: "/nutrition", icon: Apple },
  { name: "Generate Workout", href: "/workouts/generate", icon: Zap },
  { name: "Exercises", href: "/exercises", icon: BookOpen },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Achievements", href: "/achievements", icon: Trophy },
]

interface NavigationProps {
  isCollapsed: boolean
  setIsCollapsed: Dispatch<SetStateAction<boolean>>
}

export function Navigation({ isCollapsed, setIsCollapsed }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleSignOut = async () => {
    logout()
    window.location.replace("/auth/login")
  }

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem("anclora-impulso-sidebar-collapsed", String(next))
      return next
    })
  }

  return (
    <>
      <nav
        className={cn(
          "hidden lg:flex lg:fixed lg:inset-y-0 lg:z-40 lg:flex-col lg:border-r lg:border-orange-200/70 lg:bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,247,237,0.76))] lg:backdrop-blur-xl dark:lg:border-orange-400/10 dark:lg:bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(3,7,32,0.92))]",
          "transition-[width,padding] duration-300",
          isCollapsed ? "lg:w-24" : "lg:w-64",
        )}
      >
        <div className={cn("relative px-4 pt-4", isCollapsed ? "px-3" : "px-4 pb-5")}>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            title={isCollapsed ? "Expandir" : "Contraer"}
            className={cn(
              "absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200/80 bg-white/90 text-slate-600 shadow-sm dark:border-orange-400/10 dark:bg-slate-900/80 dark:text-slate-300",
              uiMotion.frame,
            )}
          >
            {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>

          <div
            className={cn(
              "flex items-center pt-14 transition-all duration-300",
              isCollapsed ? "justify-center pb-2" : "flex-col justify-center pb-2 text-center",
            )}
          >
            <BrandLogo
              size={isCollapsed ? 46 : 92}
              priority
              className="shrink-0"
              imageClassName={cn(isCollapsed ? "" : "drop-shadow-[0_18px_34px_rgba(59,130,246,0.24)]")}
            />
            <div
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "max-h-0 max-w-0 overflow-hidden opacity-0 pointer-events-none" : "mt-5 max-w-[190px] opacity-100",
              )}
            >
              <p className="text-[1.95rem] font-semibold leading-[0.92] tracking-[-0.05em] text-slate-900 dark:text-white">
                <span className="block">Anclora</span>
                <span className="block">Impulso</span>
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-orange-600/80 dark:text-orange-300/80">
                Momentum Fitness
              </p>
            </div>
          </div>
        </div>

        <div className={cn("px-4 pt-4", isCollapsed ? "px-3" : "px-4")}>
          <div className="h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent dark:via-orange-400/20" />
        </div>

        <div className={cn("flex-1 space-y-2 overflow-y-auto px-4 py-5", isCollapsed ? "px-3" : "px-4")}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "group flex items-center rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
                  uiMotion.frame,
                  isCollapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "border-orange-300/80 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_18px_32px_-22px_rgba(239,68,68,0.7)]"
                    : "border-transparent bg-white/60 text-slate-700 hover:border-orange-200/80 hover:bg-white/90 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-orange-400/15 dark:hover:bg-slate-900/70",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[140px] opacity-100",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>

        <div className={cn("space-y-3 border-t border-orange-200/70 p-4 dark:border-orange-400/10", isCollapsed && "px-3")}>
          <div className={cn(isCollapsed && "hidden")}>
            <XPBar />
          </div>
          <Button onClick={handleSignOut} variant="outline" className={cn("w-full rounded-2xl bg-white/80 dark:bg-slate-950/70", isCollapsed && "px-0")}>
            <LogOut className="h-4 w-4" />
            <span className={cn("transition-all duration-300", isCollapsed && "max-w-0 opacity-0 pointer-events-none")}>
              Sign Out
            </span>
          </Button>
        </div>
      </nav>

      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b border-orange-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <BrandLogo size={42} priority className="rounded-2xl" />
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">Anclora Impulso</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-orange-600/80 dark:text-orange-300/80">
                Momentum Fitness
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="rounded-2xl bg-white/80 dark:bg-slate-950/70">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-b border-orange-200/70 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/95">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
                      uiMotion.frame,
                      isActive
                        ? "border-orange-300/80 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_18px_32px_-22px_rgba(239,68,68,0.7)]"
                        : "border-transparent bg-white/70 text-slate-700 hover:border-orange-200/80 hover:bg-white dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-orange-400/15 dark:hover:bg-slate-900/70",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              <XPBar />
              <Button onClick={handleSignOut} variant="outline" className="mt-3 w-full rounded-2xl bg-white/80 dark:bg-slate-950/70">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
