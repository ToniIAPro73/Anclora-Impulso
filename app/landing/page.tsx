"use client"

import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"
import { LanguageThemeSelector } from "@/components/language-theme-selector"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/contexts/language-context"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative overflow-hidden">
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <LanguageThemeSelector />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/5 dark:to-red-500/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
          <div className="text-center">
            <BrandLogo size={88} priority className="mx-auto mb-8 rounded-[28px]" imageClassName="p-3" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              <span className="text-balance">{t.home.title}</span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Anclora Impulso
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-8">
              {t.home.subtitle}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-x-6">
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 text-lg text-white hover:from-orange-600 hover:to-red-600 sm:w-auto"
              >
                <Link href="/auth/signup">{t.home.startJourney}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full bg-transparent px-8 py-3 text-lg sm:w-auto">
                <Link href="/auth/login">{t.home.signIn}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t.home.featuresTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t.home.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <CardTitle>{t.home.smartWorkouts}</CardTitle>
                <CardDescription>{t.home.smartWorkoutsDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <CardTitle>{t.home.progressTracking}</CardTitle>
                <CardDescription>{t.home.progressTrackingDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <CardTitle>{t.home.adaptiveProgramming}</CardTitle>
                <CardDescription>{t.home.adaptiveProgrammingDesc}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
