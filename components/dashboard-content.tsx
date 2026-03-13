"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Dumbbell, TrendingUp, Calendar, Play, Plus, Trophy, Target, Clock, Activity, Loader2 } from "lucide-react"
import { useProgress } from "@/hooks/use-progress"
import { useLanguage } from "@/lib/contexts/language-context"
import { uiMotion } from "@/lib/ui-motion"
import { cn } from "@/lib/utils"

export function DashboardContent() {
  const { progress, isLoading } = useProgress()
  const { t, language } = useLanguage()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t.dashboard.loading}</p>
        </div>
      </div>
    )
  }

  const stats = progress?.stats || {
    totalWorkouts: 0,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    avgDuration: 0,
    personalRecords: [],
  }

  return (
    <div className="flex min-h-full flex-col gap-2.5 p-3 sm:gap-3 sm:p-4 lg:h-full">
      {/* Quick Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5">
        <Card className="min-w-0 min-h-[94px] border-0 bg-gradient-to-br from-blue-50 to-cyan-50 py-0 shadow-lg dark:from-blue-900/20 dark:to-cyan-900/20 xl:h-[96px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.78rem] leading-tight md:text-[0.86rem]">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="line-clamp-2">{t.dashboard.totalWorkouts}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <div className="text-[1.45rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.65rem]">{stats.totalWorkouts}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{stats.workoutsThisWeek} {t.dashboard.thisWeek}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[94px] border-0 bg-gradient-to-br from-green-50 to-emerald-50 py-0 shadow-lg dark:from-green-900/20 dark:to-emerald-900/20 xl:h-[96px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.78rem] leading-tight md:text-[0.86rem]">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="line-clamp-2">{t.dashboard.avgWorkoutTime}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <div className="text-[1.45rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.65rem]">
              {Math.round(stats.avgDuration / 60)}min
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.dashboard.perWorkout}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[94px] border-0 bg-gradient-to-br from-yellow-50 to-orange-50 py-0 shadow-lg dark:from-yellow-900/20 dark:to-orange-900/20 xl:h-[96px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.78rem] leading-tight md:text-[0.86rem]">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="line-clamp-2">{t.dashboard.personalRecords}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <div className="text-[1.45rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.65rem]">{stats.personalRecords.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.dashboard.achievementsLabel}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[94px] border-0 bg-gradient-to-br from-purple-50 to-pink-50 py-0 shadow-lg dark:from-purple-900/20 dark:to-pink-900/20 xl:h-[96px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.78rem] leading-tight md:text-[0.86rem]">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="line-clamp-2">{t.dashboard.thisMonth}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <div className="text-[1.45rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.65rem]">{stats.workoutsThisMonth}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.dashboard.thisMonthWorkouts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2.5">
        <Card className="min-w-0 min-h-[118px] border-0 bg-gradient-to-r from-orange-500 to-red-500 py-0 text-white hover:shadow-xl transition-shadow 2xl:h-[112px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.94rem] leading-tight">
              <Play className="h-4 w-4" />
              <span className="line-clamp-2">{t.dashboard.startWorkout}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2 text-[0.8rem] text-orange-100">{t.dashboard.startWorkoutDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <Button asChild variant="secondary" className="h-8 w-full rounded-xl bg-white/20 px-3 text-sm text-white border-0 hover:bg-white/30">
              <Link href="/workouts/generate">
                <Play className="mr-2 h-4 w-4" />
                {t.dashboard.startNow}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[118px] border-0 bg-gradient-to-r from-blue-500 to-cyan-500 py-0 text-white hover:shadow-xl transition-shadow 2xl:h-[112px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.94rem] leading-tight">
              <Dumbbell className="h-4 w-4" />
              <span className="line-clamp-2">{t.dashboard.exerciseLibrary}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2 text-[0.8rem] text-blue-100">{t.dashboard.exerciseLibraryDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <Button asChild variant="secondary" className="h-8 w-full rounded-xl bg-white/20 px-3 text-sm text-white border-0 hover:bg-white/30">
              <Link href="/exercises">
                <Dumbbell className="mr-2 h-4 w-4" />
                {t.dashboard.viewExercises}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[118px] border-0 bg-gradient-to-r from-purple-500 to-pink-500 py-0 text-white hover:shadow-xl transition-shadow 2xl:h-[112px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.94rem] leading-tight">
              <TrendingUp className="h-4 w-4" />
              <span className="line-clamp-2">{t.dashboard.viewProgress}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2 text-[0.8rem] text-purple-100">{t.dashboard.viewProgressDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3">
            <Button asChild variant="secondary" className="h-8 w-full rounded-xl bg-white/20 px-3 text-sm text-white border-0 hover:bg-white/30">
              <Link href="/progress">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t.dashboard.viewProgress}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      {stats.personalRecords.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  {t.dashboard.recentPersonalRecords}
                </CardTitle>
                <CardDescription>{t.dashboard.bestMarks}</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/progress">{t.dashboard.viewAll}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.personalRecords.slice(0, 5).map((record: any) => (
                <div
                  key={record.exercise_id}
                  className={cn("flex items-center justify-between rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/50", uiMotion.frame)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{record.exercise_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500">
                    {record.max_weight} kg
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {stats.totalWorkouts === 0 && (
        <Card className="min-h-0 border-0 bg-gradient-to-r from-orange-50 to-pink-50 py-0 shadow-lg dark:from-orange-900/20 dark:to-pink-900/20 lg:flex-1">
          <CardHeader className="gap-1 px-4 pb-1.5 pt-3 lg:px-5">
            <CardTitle className="flex items-center gap-2 text-[0.98rem] md:text-[1.02rem]">
              <Target className="h-4 w-4 text-orange-500" />
              {t.dashboard.getStartedTitle}
            </CardTitle>
            <CardDescription className="text-[0.8rem]">{t.dashboard.getStartedDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex h-full min-h-0 flex-col px-4 pt-1 pb-5 lg:px-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
              <div className={cn("flex min-h-[104px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  1
                </div>
                <div>
                  <h4 className="text-[0.94rem] font-semibold leading-tight text-gray-900 dark:text-white">{t.dashboard.stepOneTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{t.dashboard.stepOneDesc}</p>
                </div>
              </div>
              <div className={cn("flex min-h-[104px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  2
                </div>
                <div>
                  <h4 className="text-[0.94rem] font-semibold leading-tight text-gray-900 dark:text-white">{t.dashboard.stepTwoTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{t.dashboard.stepTwoDesc}</p>
                </div>
              </div>
              <div className={cn("flex min-h-[104px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  3
                </div>
                <div>
                  <h4 className="text-[0.94rem] font-semibold leading-tight text-gray-900 dark:text-white">{t.dashboard.stepThreeTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{t.dashboard.stepThreeDesc}</p>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-5 flex justify-stretch 2xl:justify-end">
                <Button asChild className="h-9 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 text-sm hover:from-orange-600 hover:to-pink-600 2xl:w-auto">
                  <Link href="/workouts/generate" className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.dashboard.generateFirstWorkout}
                  </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
