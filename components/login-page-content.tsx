"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Mail, Github } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { useLanguage } from "@/lib/contexts/language-context"
import { uiMotion } from "@/lib/ui-motion"
import { cn } from "@/lib/utils"

type LoginPageContentProps = {
  defaultEmail?: string
  defaultPassword?: string
}

export function LoginPageContent({ defaultEmail = "", defaultPassword = "" }: LoginPageContentProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState(defaultPassword)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authApi.login({ email, password })
      router.replace("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t.auth.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.25),_transparent_38%),linear-gradient(135deg,_rgba(255,247,237,1)_0%,_rgba(255,237,213,0.85)_42%,_rgba(255,255,255,1)_100%)] p-6 dark:bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),_transparent_36%),linear-gradient(135deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,0.96)_48%,_rgba(30,41,59,0.92)_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[10%] h-28 w-28 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute bottom-[12%] right-[10%] h-36 w-36 rounded-full bg-red-300/20 blur-3xl dark:bg-red-500/10" />
        <div className="absolute left-[50%] top-[55%] h-24 w-24 rounded-full bg-amber-200/30 blur-2xl dark:bg-amber-300/10" />
      </div>

      <div className="relative w-full max-w-md">
        <Card className="border-white/70 bg-white/78 shadow-[0_32px_80px_-40px_rgba(234,88,12,0.45)] backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/82">
          <CardHeader className="pb-4 pt-6 text-center">
            <BrandLogo size={72} priority className="mx-auto mb-3" />
            <div className="mx-auto mb-2 h-px w-16 bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Anclora Impulso</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <form onSubmit={handleLogin} className="space-y-3" aria-label="Login form">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.email}
                  <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  aria-required="true"
                  aria-describedby="email-error"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-2xl border-orange-200/80 bg-white/75 text-sm dark:border-orange-400/10 dark:bg-slate-900/70 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.password}
                  <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    aria-required="true"
                    aria-describedby="password-error"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-2xl border-orange-200/80 bg-white/75 pr-10 text-sm dark:border-orange-400/10 dark:bg-slate-900/70 focus:border-orange-500 dark:focus:border-orange-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              {error && (
                <div
                  id="login-error"
                  className="rounded-2xl border border-red-200/80 bg-red-50/90 px-3 py-3 text-xs text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-300"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="h-11 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 text-sm font-semibold text-white hover:from-orange-600 hover:via-red-500 hover:to-rose-600"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? t.auth.signingIn : t.auth.signIn}
              </Button>
            </form>
            <div className="mt-2 text-center">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div className={cn("mt-2 rounded-2xl border border-orange-100/80 bg-white/50 px-4 py-2.5 text-center dark:border-orange-400/10 dark:bg-slate-900/40", uiMotion.frame)}>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t.auth.noAccount}{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
                >
                  {t.auth.signUp}
                </Link>
              </p>
            </div>
            {/* Social login — disabled (OAuth not configured) */}
            <div className="mt-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-orange-200/40 dark:bg-orange-400/10" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-600">
                  {t.auth.socialAccess}
                </span>
                <div className="h-px flex-1 bg-orange-200/40 dark:bg-orange-400/10" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled
                  title={t.auth.socialComingSoon}
                  className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-orange-200/50 text-xs font-medium text-gray-400 opacity-50 cursor-not-allowed dark:border-orange-400/10 dark:text-gray-600"
                >
                  <Mail size={14} aria-hidden="true" /> {t.auth.google}
                </button>
                <button
                  type="button"
                  disabled
                  title={t.auth.socialComingSoon}
                  className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-orange-200/50 text-xs font-medium text-gray-400 opacity-50 cursor-not-allowed dark:border-orange-400/10 dark:text-gray-600"
                >
                  <Github size={14} aria-hidden="true" /> {t.auth.github}
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-500">
              {t.auth.legalPrefix}{" "}
              <Link href="/terms" className="underline hover:text-orange-600 dark:hover:text-orange-400">
                {t.auth.terms}
              </Link>{" "}
              {t.auth.legalMiddle}{" "}
              <Link href="/privacy" className="underline hover:text-orange-600 dark:hover:text-orange-400">
                {t.auth.privacy}
              </Link>
              {t.auth.legalSuffix}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
