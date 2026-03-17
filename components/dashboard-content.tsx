"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Dumbbell, TrendingUp, Calendar, Play, Plus, Trophy, Target, Clock, Activity, Loader2, Apple, ArrowRight, CheckCircle2, Flame } from "lucide-react"
import { useProgress } from "@/hooks/use-progress"
import { useMealPlans, useNutritionSummary } from "@/hooks/use-nutrition"
import { useWorkouts } from "@/hooks/use-workouts"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { uiMotion } from "@/lib/ui-motion"
import { cn } from "@/lib/utils"
import { getProfileCompletion } from "@/lib/user-profile"
import { OnboardingDialog } from "@/components/onboarding-dialog"

export function DashboardContent() {
  const { profile, user } = useAuth()
  const { progress, isLoading } = useProgress()
  const { data: nutritionSummary, isLoading: isNutritionLoading } = useNutritionSummary("day")
  const { mealPlans } = useMealPlans()
  const { workouts } = useWorkouts()
  const { t, language } = useLanguage()
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [draftWorkoutId, setDraftWorkoutId] = useState<string | null>(null)

  const stats = progress?.stats || {
    totalWorkouts: 0,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    avgDuration: 0,
    personalRecords: [],
  }
  const hasNutritionData = Boolean(nutritionSummary && nutritionSummary.logCount > 0)
  const latestMealPlan = mealPlans[0]
  const nutritionCalories = nutritionSummary?.totals.calories ?? 0
  const nutritionProtein = Math.round(nutritionSummary?.totals.protein ?? 0)
  const showGettingStarted = stats.totalWorkouts === 0
  const progressInsights = progress?.insights
  const profileCompletion = useMemo(() => getProfileCompletion(profile), [profile])
  const latestWorkout = workouts[0] ?? null
  const weeklyTarget = progressInsights?.weeklyTarget ?? profile.trainingDaysPerWeek ?? null
  const weeklyConsistency = progressInsights?.adherenceRate ? Math.round(progressInsights.adherenceRate * 100) : 0
  const nutritionConsistency = progressInsights?.nutritionConsistencyRate ? Math.round(progressInsights.nutritionConsistencyRate * 100) : 0
  const needsOnboarding = !profile.onboardingCompletedAt || !profileCompletion.isComplete

  useEffect(() => {
    if (!user || workouts.length === 0) {
      setDraftWorkoutId(null)
      return
    }

    const foundDraft = workouts.find((workout) =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(`anclora-active-workout:${user.id}:${workout.id}`),
    )

    setDraftWorkoutId(foundDraft?.id ?? null)
  }, [user, workouts])

  useEffect(() => {
    if (needsOnboarding) {
      setOnboardingOpen(true)
    }
  }, [needsOnboarding])

  const primaryAction = needsOnboarding
    ? {
        href: null,
        label: language === "es" ? "Completar onboarding" : "Complete onboarding",
        description:
          language === "es"
            ? "Rellena tu perfil para desbloquear recomendaciones y un dashboard más útil."
            : "Complete your profile to unlock better recommendations and a more useful dashboard.",
        icon: CheckCircle2,
        onClick: () => setOnboardingOpen(true),
      }
    : draftWorkoutId
      ? {
          href: `/workouts/${draftWorkoutId}/start`,
          label: language === "es" ? "Reanudar entrenamiento" : "Resume workout",
          description:
            language === "es"
              ? "Tienes una sesión guardada parcialmente y lista para continuar."
              : "You have a partially saved session ready to resume.",
          icon: Play,
          onClick: undefined,
        }
      : latestWorkout
        ? {
            href: `/workouts/${latestWorkout.id}/start`,
            label: language === "es" ? "Empezar entrenamiento" : "Start workout",
            description:
              language === "es"
                ? "Tu siguiente mejor acción es ejecutar el plan más reciente."
                : "Your next best action is to run your most recent plan.",
            icon: Flame,
            onClick: undefined,
          }
        : {
            href: "/workouts/generate",
            label: language === "es" ? "Generar entrenamiento" : "Generate workout",
            description:
              language === "es"
                ? "No tienes un plan activo. Genera uno adaptado a tu perfil."
                : "You do not have an active plan yet. Generate one for your profile.",
            icon: Plus,
            onClick: undefined,
          }
  const PrimaryActionIcon = primaryAction.icon
  const quickActions = [
    {
      href: "/workouts/generate",
      title: t.dashboard.startWorkout,
      description: t.dashboard.startWorkoutDesc,
      cta: t.dashboard.startNow,
      icon: Play,
      className: "from-orange-500 to-red-500",
      textClassName: "text-orange-100",
    },
    {
      href: "/exercises",
      title: t.dashboard.exerciseLibrary,
      description: t.dashboard.exerciseLibraryDesc,
      cta: t.dashboard.viewExercises,
      icon: Dumbbell,
      className: "from-blue-500 to-cyan-500",
      textClassName: "text-blue-100",
    },
    {
      href: "/progress",
      title: t.dashboard.viewProgress,
      description: t.dashboard.viewProgressDesc,
      cta: t.dashboard.viewProgress,
      icon: TrendingUp,
      className: "from-purple-500 to-pink-500",
      textClassName: "text-purple-100",
    },
    {
      href: "/nutrition",
      title: t.dashboard.nutritionHub,
      description: latestMealPlan ? t.dashboard.nutritionHubPlanDesc : t.dashboard.nutritionHubEmptyDesc,
      cta: latestMealPlan ? t.dashboard.viewNutrition : t.dashboard.startNutrition,
      icon: Apple,
      className: "from-emerald-500 to-teal-500",
      textClassName: "text-emerald-100",
    },
  ]

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

  return (
    <div className="flex min-h-full flex-col gap-2.5 p-3 sm:gap-3 sm:p-4 lg:h-full lg:gap-2 lg:overflow-hidden">
      <OnboardingDialog open={onboardingOpen} onOpenChange={setOnboardingOpen} />

      <Card className="border-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl">
        <CardContent className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border-0 bg-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                {language === "es" ? "Centro de acción" : "Action hub"}
              </Badge>
              <Badge className="rounded-full border-0 bg-orange-500/20 px-3 py-1 text-[11px] text-orange-100">
                {weeklyTarget ? `${stats.workoutsThisWeek}/${weeklyTarget} ${language === "es" ? "sesiones esta semana" : "sessions this week"}` : (language === "es" ? "Sin objetivo semanal" : "No weekly target")}
              </Badge>
            </div>

            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {needsOnboarding
                  ? language === "es"
                    ? "Completa tu base para activar la personalización real"
                    : "Complete your base profile to unlock real personalization"
                  : language === "es"
                    ? "Tu siguiente mejor acción ya está preparada"
                    : "Your next best action is ready"}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                {primaryAction.description}
              </p>
            </div>

            {primaryAction.href ? (
              <Button asChild className="h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 text-sm font-semibold hover:from-orange-600 hover:to-pink-600">
                <Link href={primaryAction.href}>
                  <PrimaryActionIcon className="mr-2 h-4 w-4" />
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button onClick={primaryAction.onClick} className="h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 text-sm font-semibold hover:from-orange-600 hover:to-pink-600">
                <PrimaryActionIcon className="mr-2 h-4 w-4" />
                {primaryAction.label}
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {language === "es" ? "Perfil" : "Profile"}
              </p>
              <p className="mt-2 text-3xl font-semibold">{profileCompletion.percentage}%</p>
              <Progress value={profileCompletion.percentage} className="mt-3 h-2.5 bg-white/10" />
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {language === "es" ? "Adherencia semanal" : "Weekly adherence"}
              </p>
              <p className="mt-2 text-3xl font-semibold">{weeklyConsistency}%</p>
              <p className="mt-2 text-xs text-slate-300">
                {language === "es"
                  ? "Mide si tu ritmo reciente coincide con el objetivo semanal."
                  : "Measures whether your recent pace matches your weekly target."}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {language === "es" ? "Registro nutricional" : "Nutrition logging"}
              </p>
              <p className="mt-2 text-3xl font-semibold">{nutritionConsistency}%</p>
              <p className="mt-2 text-xs text-slate-300">
                {language === "es"
                  ? "Días con registros en la última semana."
                  : "Days with logs during the last week."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2 lg:flex-none">
        <Card className="min-w-0 min-h-[86px] border-0 bg-gradient-to-br from-blue-50 to-cyan-50 py-0 shadow-lg dark:from-blue-900/20 dark:to-cyan-900/20 lg:min-h-[78px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-3 lg:pb-0.5 lg:pt-2.5">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.74rem] leading-tight md:text-[0.82rem]">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              <span className="line-clamp-2">{t.dashboard.totalWorkouts}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3 lg:px-3 lg:pb-2.5">
            <div className="text-[1.25rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.45rem] lg:text-[1.15rem]">{stats.totalWorkouts}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{stats.workoutsThisWeek} {t.dashboard.thisWeek}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[86px] border-0 bg-gradient-to-br from-green-50 to-emerald-50 py-0 shadow-lg dark:from-green-900/20 dark:to-emerald-900/20 lg:min-h-[78px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-3 lg:pb-0.5 lg:pt-2.5">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.74rem] leading-tight md:text-[0.82rem]">
              <Clock className="h-3.5 w-3.5 text-green-500" />
              <span className="line-clamp-2">{t.dashboard.avgWorkoutTime}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3 lg:px-3 lg:pb-2.5">
            <div className="text-[1.25rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.45rem] lg:text-[1.15rem]">
              {Math.round(stats.avgDuration / 60)}min
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.dashboard.perWorkout}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[86px] border-0 bg-gradient-to-br from-yellow-50 to-orange-50 py-0 shadow-lg dark:from-yellow-900/20 dark:to-orange-900/20 lg:min-h-[78px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-3 lg:pb-0.5 lg:pt-2.5">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.74rem] leading-tight md:text-[0.82rem]">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              <span className="line-clamp-2">{t.dashboard.personalRecords}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3 lg:px-3 lg:pb-2.5">
            <div className="text-[1.25rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.45rem] lg:text-[1.15rem]">{stats.personalRecords.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.dashboard.achievementsLabel}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[86px] border-0 bg-gradient-to-br from-purple-50 to-pink-50 py-0 shadow-lg dark:from-purple-900/20 dark:to-pink-900/20 lg:min-h-[78px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-3 lg:pb-0.5 lg:pt-2.5">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.74rem] leading-tight md:text-[0.82rem]">
              <Calendar className="h-3.5 w-3.5 text-purple-500" />
              <span className="line-clamp-2">{t.dashboard.thisMonth}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3 lg:px-3 lg:pb-2.5">
            <div className="text-[1.25rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.45rem] lg:text-[1.15rem]">{stats.workoutsThisMonth}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.dashboard.thisMonthWorkouts}</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[86px] border-0 bg-gradient-to-br from-emerald-50 to-lime-50 py-0 shadow-lg dark:from-emerald-900/20 dark:to-lime-900/20 lg:min-h-[78px]">
          <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-3 lg:pb-0.5 lg:pt-2.5">
            <CardTitle className="flex min-w-0 items-center gap-2 text-[0.74rem] leading-tight md:text-[0.82rem]">
              <Apple className="h-3.5 w-3.5 text-emerald-500" />
              <span className="line-clamp-2">{t.dashboard.nutritionToday}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-3 lg:px-3 lg:pb-2.5">
            <div className="text-[1.25rem] font-bold leading-none text-gray-900 dark:text-white md:text-[1.45rem] lg:text-[1.15rem]">
              {isNutritionLoading ? "..." : nutritionCalories}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {hasNutritionData ? `${nutritionProtein}g ${t.dashboard.proteinLabel}` : t.dashboard.noMealsLogged}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4 lg:gap-2 lg:flex-none">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.href} className={`min-w-0 min-h-[102px] border-0 bg-gradient-to-r ${action.className} py-0 text-white hover:shadow-xl transition-shadow lg:min-h-[96px]`}>
              <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-3 lg:pb-0.5 lg:pt-2.5">
                <CardTitle className="flex min-w-0 items-center gap-2 text-[0.88rem] leading-tight lg:text-[0.8rem]">
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{action.title}</span>
                </CardTitle>
                <CardDescription className={cn("line-clamp-2 text-[0.78rem] lg:text-[0.72rem]", action.textClassName)}>
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pt-0 pb-3 lg:px-3 lg:pb-2.5">
                <Button asChild variant="secondary" className="h-8 w-full rounded-xl bg-white/20 px-3 text-sm text-white border-0 hover:bg-white/30 lg:h-7 lg:px-2 lg:text-[0.78rem]">
                  <Link href={action.href}>
                    <Icon className="mr-2 h-4 w-4 lg:h-3.5 lg:w-3.5" />
                    {action.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Personal Records */}
      {profile.recommendedPlan ? (
        <Card className="ui-motion-card-subtle border-0 shadow-lg bg-gradient-to-r from-orange-50 to-rose-50 backdrop-blur-sm dark:from-orange-900/20 dark:to-rose-900/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  {profile.recommendedPlan.title}
                </CardTitle>
                <CardDescription>{profile.recommendedPlan.summary}</CardDescription>
              </div>
              <Button asChild className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                <Link href="/workouts/generate">{t.dashboard.startNow}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {profile.recommendedPlan.weeklySplit.map((session) => (
              <div key={session} className={cn("rounded-2xl bg-white/75 p-4 text-sm text-slate-700 shadow-sm dark:bg-slate-950/45 dark:text-slate-200", uiMotion.frame)}>
                {session}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

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
      {showGettingStarted && (
        <Card className="ui-motion-card-subtle min-h-0 border-0 bg-gradient-to-r from-orange-50 to-pink-50 py-0 shadow-lg dark:from-orange-900/20 dark:to-pink-900/20 lg:flex-1 lg:overflow-hidden">
          <CardHeader className="gap-1 px-4 pb-1 pt-3 lg:px-4 lg:pb-0 lg:pt-2.5">
            <CardTitle className="flex items-center gap-2 text-[0.98rem] md:text-[1.02rem] lg:text-[0.96rem]">
              <Target className="h-4 w-4 text-orange-500" />
              {t.dashboard.getStartedTitle}
            </CardTitle>
            <CardDescription className="text-[0.8rem] lg:text-[0.74rem]">{t.dashboard.getStartedDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex h-full min-h-0 flex-col gap-3 px-4 pt-1 pb-4 lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.85fr)] lg:grid-rows-[1fr] lg:gap-2 lg:px-4 lg:pb-3">
            <div className="grid min-h-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:gap-2">
              <div className={cn("flex min-h-[84px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30 lg:min-h-[72px] lg:px-3 lg:py-2.5", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">1</div>
                <div className="min-w-0">
                  <h4 className="text-[0.9rem] font-semibold leading-tight text-gray-900 dark:text-white lg:text-[0.82rem]">{t.dashboard.stepOneTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 lg:text-[0.72rem]">{t.dashboard.stepOneDesc}</p>
                </div>
              </div>
              <div className={cn("flex min-h-[84px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30 lg:min-h-[72px] lg:px-3 lg:py-2.5", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">2</div>
                <div className="min-w-0">
                  <h4 className="text-[0.9rem] font-semibold leading-tight text-gray-900 dark:text-white lg:text-[0.82rem]">{t.dashboard.stepTwoTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 lg:text-[0.72rem]">{t.dashboard.stepTwoDesc}</p>
                </div>
              </div>
              <div className={cn("flex min-h-[84px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30 lg:min-h-[72px] lg:px-3 lg:py-2.5", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">3</div>
                <div className="min-w-0">
                  <h4 className="text-[0.9rem] font-semibold leading-tight text-gray-900 dark:text-white lg:text-[0.82rem]">{t.dashboard.stepThreeTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 lg:text-[0.72rem]">{t.dashboard.stepThreeDesc}</p>
                </div>
              </div>
              <div className={cn("flex min-h-[84px] items-start gap-3 rounded-2xl border border-orange-100/80 bg-white/60 px-4 py-3 dark:border-orange-400/10 dark:bg-slate-900/30 lg:min-h-[72px] lg:px-3 lg:py-2.5", uiMotion.frame)}>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">4</div>
                <div className="min-w-0">
                  <h4 className="text-[0.9rem] font-semibold leading-tight text-gray-900 dark:text-white lg:text-[0.82rem]">{t.dashboard.stepFourTitle}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 lg:text-[0.72rem]">{t.dashboard.stepFourDesc}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-2.5 lg:grid-rows-2 lg:gap-2">
              <div className={cn("flex min-h-[84px] flex-col justify-between rounded-2xl border border-orange-200/70 bg-white/65 px-4 py-3 dark:border-orange-400/15 dark:bg-slate-900/30 lg:min-h-[72px] lg:px-3 lg:py-2.5", uiMotion.frame)}>
                <div>
                  <h4 className="text-[0.92rem] font-semibold text-gray-900 dark:text-white lg:text-[0.82rem]">{t.dashboard.generateFirstWorkout}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 lg:text-[0.72rem]">{t.dashboard.stepTwoDesc}</p>
                </div>
                <Button asChild className="mt-3 h-8 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 text-sm hover:from-orange-600 hover:to-pink-600 lg:mt-2 lg:h-7 lg:px-3 lg:text-[0.78rem]">
                  <Link href="/workouts/generate" className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4 lg:h-3.5 lg:w-3.5" />
                    {t.dashboard.startNow}
                  </Link>
                </Button>
              </div>
              <div className={cn("flex min-h-[84px] flex-col justify-between rounded-2xl border border-emerald-300/70 bg-white/65 px-4 py-3 dark:border-emerald-500/20 dark:bg-slate-900/30 lg:min-h-[72px] lg:px-3 lg:py-2.5", uiMotion.frame)}>
                <div>
                  <h4 className="text-[0.92rem] font-semibold text-gray-900 dark:text-white lg:text-[0.82rem]">{t.dashboard.generateFirstMealPlan}</h4>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 lg:text-[0.72rem]">{t.dashboard.stepFourDesc}</p>
                </div>
                <Button asChild variant="outline" className="mt-3 h-8 w-full rounded-2xl border-emerald-300/70 bg-white/60 px-4 text-sm text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-slate-900/20 dark:text-emerald-300 dark:hover:bg-emerald-950/30 lg:mt-2 lg:h-7 lg:px-3 lg:text-[0.78rem]">
                  <Link href="/nutrition" className="whitespace-nowrap">
                    <Apple className="mr-2 h-4 w-4 lg:h-3.5 lg:w-3.5" />
                    {t.dashboard.viewNutrition}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
