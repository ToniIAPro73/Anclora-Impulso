"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t.auth.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <CardHeader className="text-center pb-4 pt-6">
            <div className="mx-auto w-11 h-11 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{t.auth.welcomeBack}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-xs">{t.auth.signInMessage}</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleLogin} className="space-y-4" aria-label="Login form">
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
                  className="h-9 text-sm border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.password}
                  <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  aria-required="true"
                  aria-describedby="password-error"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-sm border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              {error && (
                <div
                  id="login-error"
                  className="px-3 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? t.auth.signingIn : t.auth.signIn}
              </Button>
            </form>
            <div className="mt-4 text-center">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
