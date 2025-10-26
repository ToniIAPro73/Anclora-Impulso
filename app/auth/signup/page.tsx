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

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()
  const { t } = useLanguage()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch || "Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort || "Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      await signup(email, password, fullName)
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t.auth.signupError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.auth.startJourney || "Start Your Journey"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t.auth.createAccount || "Create your account and begin transforming your fitness"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.fullName || "Full Name"}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t.auth.fullNamePlaceholder || "Your full name"}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder || "At least 6 characters"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.auth.confirmPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t.auth.confirmPasswordPlaceholder || "Confirm your password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? t.auth.creatingAccount || "Creating account..." : t.auth.createAccount || "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.auth.alreadyHaveAccount || "Already have an account?"}{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
                >
                  {t.auth.signIn}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
