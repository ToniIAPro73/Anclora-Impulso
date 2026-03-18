"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  PencilLine,
  ShieldCheck,
} from "lucide-react"

import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useEditorialExercises } from "@/hooks/use-editorial-content"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"

function AdminContentInner() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const {
    summary,
    recipesSummary,
    isLoading,
    isLoadingRecipes,
    error,
    recipesError,
    updateExercise,
    updateRecipe,
    isUpdating,
    isUpdatingRecipe,
    eventsSummary,
  } = useEditorialExercises()
  const [activeTab, setActiveTab] = useState<"exercises" | "recipes">("exercises")
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const exerciseItemRefs = useRef<Array<HTMLDivElement | null>>([])
  const recipeItemRefs = useRef<Array<HTMLDivElement | null>>([])

  const selectedExercise = useMemo(
    () => summary?.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null,
    [selectedExerciseId, summary],
  )
  const selectedRecipe = useMemo(
    () => recipesSummary?.recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [selectedRecipeId, recipesSummary],
  )

  const [exerciseForm, setExerciseForm] = useState({
    description: "",
    instructions: "",
  })
  const [recipeForm, setRecipeForm] = useState({
    description: "",
    instructions: "",
    difficulty: "",
    tags: "",
    prepTime: "",
    cookTime: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  })

  useEffect(() => {
    if (!selectedExercise) return
    setExerciseForm({
      description: selectedExercise.description,
      instructions: selectedExercise.instructions.join("\n"),
    })
  }, [selectedExercise])

  useEffect(() => {
    if (!selectedRecipe) return
    setRecipeForm({
      description: selectedRecipe.description ?? "",
      instructions: selectedRecipe.instructions.join("\n"),
      difficulty: selectedRecipe.difficulty ?? "",
      tags: selectedRecipe.tags.join("\n"),
      prepTime: selectedRecipe.prepTime ? String(selectedRecipe.prepTime) : "",
      cookTime: selectedRecipe.cookTime ? String(selectedRecipe.cookTime) : "",
      calories: selectedRecipe.calories ? String(selectedRecipe.calories) : "",
      protein: selectedRecipe.protein ? String(selectedRecipe.protein) : "",
      carbs: selectedRecipe.carbs ? String(selectedRecipe.carbs) : "",
      fat: selectedRecipe.fat ? String(selectedRecipe.fat) : "",
    })
  }, [selectedRecipe])

  if (!user?.isAdmin) {
    return (
      <div className="px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
        <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <ShieldCheck className="h-12 w-12 text-orange-500" />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.admin.restrictedTitle}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.admin.restrictedDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveExercise = async () => {
    if (!selectedExercise) return
    await updateExercise({
      id: selectedExercise.id,
      data: {
        description: exerciseForm.description,
        instructions: exerciseForm.instructions
          .split("\n")
          .map((instruction) => instruction.trim())
          .filter(Boolean),
      },
    })
    setSelectedExerciseId(null)
  }

  const handleSaveRecipe = async () => {
    if (!selectedRecipe) return
    await updateRecipe({
      id: selectedRecipe.id,
      data: {
        description: recipeForm.description || null,
        instructions: recipeForm.instructions
          .split("\n")
          .map((instruction) => instruction.trim())
          .filter(Boolean),
        difficulty: recipeForm.difficulty || null,
        tags: recipeForm.tags
          .split("\n")
          .map((tag) => tag.trim())
          .filter(Boolean),
        prepTime: recipeForm.prepTime ? Number(recipeForm.prepTime) : null,
        cookTime: recipeForm.cookTime ? Number(recipeForm.cookTime) : null,
        calories: recipeForm.calories ? Number(recipeForm.calories) : null,
        protein: recipeForm.protein ? Number(recipeForm.protein) : null,
        carbs: recipeForm.carbs ? Number(recipeForm.carbs) : null,
        fat: recipeForm.fat ? Number(recipeForm.fat) : null,
      },
    })
    setSelectedRecipeId(null)
  }

  const currentError = error ?? recipesError
  const loading = isLoading || isLoadingRecipes
  const activeItems = activeTab === "exercises" ? (summary?.exercises ?? []) : (recipesSummary?.recipes ?? [])
  const editorialStep = Math.min(24, Math.max(4, Math.round(activeItems.length * 0.08)))

  const scrollEditorialQueue = (direction: "up" | "down") => {
    const refs = activeTab === "exercises" ? exerciseItemRefs.current : recipeItemRefs.current
    const viewportTop = 160
    const currentIndex = refs.findIndex((element) => {
      if (!element) return false
      const rect = element.getBoundingClientRect()
      return rect.bottom >= viewportTop && rect.top >= viewportTop - 24
    })
    const visibleIndex =
      currentIndex >= 0
        ? currentIndex
        : Math.max(
            0,
            refs.findIndex((element) => {
              if (!element) return false
              return element.getBoundingClientRect().bottom >= viewportTop
            }),
          )
    const targetIndex =
      direction === "down"
        ? Math.min(activeItems.length - 1, visibleIndex + editorialStep)
        : Math.max(0, visibleIndex - editorialStep)

    refs[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  return (
    <div className="space-y-6 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.admin.title}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{t.admin.subtitle}</p>
      </div>

      {loading ? (
        <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">{t.admin.loading}</CardContent>
        </Card>
      ) : currentError || !summary || !recipesSummary ? (
        <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="py-12 text-center text-red-500">{currentError ?? t.admin.loadError}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <Card className="border-0 bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-orange-400" />
                  {t.admin.catalog}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-semibold">{summary.total}</p>
                  <p className="mt-1 text-sm text-slate-300">{t.admin.catalogExercises}</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold">{recipesSummary.total}</p>
                  <p className="mt-1 text-sm text-slate-300">{t.admin.catalogRecipes}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t.admin.averageQuality}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{summary.averageQualityScore}%</p>
              </CardContent>
            </Card>
            <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t.admin.ready}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-emerald-600">{summary.byStatus.ready + recipesSummary.byStatus.ready}</p>
              </CardContent>
            </Card>
            <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t.admin.needsWork}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-orange-600">{summary.byStatus.needs_work + recipesSummary.byStatus.needs_work}</p>
              </CardContent>
            </Card>
            <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t.admin.eventsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{eventsSummary?.totalLast28Days ?? 0}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.admin.eventsLast28Days}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "exercises" | "recipes")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exercises">{t.admin.exercisesTab}</TabsTrigger>
              <TabsTrigger value="recipes">{t.admin.recipesTab}</TabsTrigger>
            </TabsList>

            {activeItems.length > 8 ? (
              <div className="pointer-events-none fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 sm:right-4">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => scrollEditorialQueue("up")}
                  className="pointer-events-auto h-11 w-11 rounded-2xl border border-slate-200/80 bg-white/72 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-950/70 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  aria-label={language === "es" ? `Subir ${editorialStep} elementos` : `Go up ${editorialStep} items`}
                >
                  <ChevronUp className="h-4.5 w-4.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => scrollEditorialQueue("down")}
                  className="pointer-events-auto h-11 w-11 rounded-2xl border border-slate-200/80 bg-white/72 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:translate-y-0.5 hover:bg-white hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-950/70 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  aria-label={language === "es" ? `Bajar ${editorialStep} elementos` : `Go down ${editorialStep} items`}
                >
                  <ChevronDown className="h-4.5 w-4.5" />
                </Button>
              </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <Card className="ui-motion-card-static overflow-hidden border-0 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    {activeTab === "exercises" ? t.admin.exerciseQueueTitle : t.admin.recipeQueueTitle}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "exercises" ? t.admin.exerciseQueueDesc : t.admin.recipeQueueDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative isolate space-y-3 overflow-hidden">
                  {activeTab === "exercises"
                    ? summary.exercises.map((exercise, index) => (
                        <div
                          key={exercise.id}
                          ref={(element) => {
                            exerciseItemRefs.current[index] = element
                          }}
                          className="relative z-0 flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-900"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">{exercise.name}</p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {exercise.category} · {exercise.muscleGroup} · {exercise.equipment}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-full px-3 py-1">
                                {exercise.editorial?.qualityScore ?? 0}%
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-slate-200 bg-white/85 px-3 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                onClick={() => setSelectedExerciseId(exercise.id)}
                              >
                                <PencilLine className="mr-2 h-4 w-4" />
                                {t.admin.editItem}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                              {exercise.editorial?.editorialStatus ?? "review"}
                            </Badge>
                            {!exercise.editorial?.checks.hasImage ? (
                              <Badge variant="destructive" className="rounded-full">
                                {t.admin.missingImage}
                              </Badge>
                            ) : null}
                            {!exercise.editorial?.checks.hasEnoughInstructions ? (
                              <Badge variant="destructive" className="rounded-full">
                                {t.admin.weakInstructions}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      ))
                    : recipesSummary.recipes.map((recipe, index) => (
                        <div
                          key={recipe.id}
                          ref={(element) => {
                            recipeItemRefs.current[index] = element
                          }}
                          className="relative z-0 flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-900"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">{recipe.name}</p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {(recipe.tags ?? []).slice(0, 3).join(" · ") || "—"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-full px-3 py-1">
                                {recipe.editorial?.qualityScore ?? 0}%
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-slate-200 bg-white/85 px-3 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                onClick={() => setSelectedRecipeId(recipe.id)}
                              >
                                <PencilLine className="mr-2 h-4 w-4" />
                                {t.admin.editItem}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                              {recipe.editorial?.editorialStatus ?? "review"}
                            </Badge>
                            {!recipe.editorial?.checks.hasImage ? (
                              <Badge variant="destructive" className="rounded-full">
                                {t.admin.missingImage}
                              </Badge>
                            ) : null}
                            {!recipe.editorial?.checks.hasEnoughInstructions ? (
                              <Badge variant="destructive" className="rounded-full">
                                {t.admin.weakInstructions}
                              </Badge>
                            ) : null}
                            {!recipe.editorial?.checks.hasTags ? (
                              <Badge variant="destructive" className="rounded-full">
                                {t.admin.fewTags}
                              </Badge>
                            ) : null}
                            {!recipe.editorial?.checks.hasMacros ? (
                              <Badge variant="destructive" className="rounded-full">
                                {t.admin.missingMacros}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      ))}
                </CardContent>
              </Card>

              <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    {t.admin.eventsTitle}
                  </CardTitle>
                  <CardDescription>{t.admin.eventsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl bg-slate-50/90 p-4 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t.admin.eventsLast28Days}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{eventsSummary?.totalLast28Days ?? 0}</p>
                  </div>
                  <div className="space-y-2">
                    {(eventsSummary?.topActions ?? []).slice(0, 5).map((event) => (
                      <div key={`${event.category}-${event.action}`} className="flex items-center justify-between rounded-2xl bg-slate-50/90 px-4 py-3 dark:bg-slate-900/50">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{event.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{event.category}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                          {event.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {!(eventsSummary?.topActions?.length) ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p className="text-sm">{t.admin.eventsEmpty}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </Tabs>

          <Dialog open={Boolean(selectedExerciseId && selectedExercise)} onOpenChange={(open) => !open && setSelectedExerciseId(null)}>
            <DialogContent className="max-w-[min(960px,calc(100%-1rem))] border-slate-200/80 bg-white/95 p-0 dark:border-slate-800/80 dark:bg-slate-950/95">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.8fr)_minmax(280px,0.2fr)]">
                <div className="space-y-5 p-5 sm:p-6">
                  <DialogHeader className="text-left">
                    <DialogTitle>{selectedExercise?.name ?? t.admin.exerciseQueueTitle}</DialogTitle>
                    <DialogDescription>{t.admin.exerciseEditorDesc}</DialogDescription>
                  </DialogHeader>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/70">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {selectedExercise?.category} · {selectedExercise?.muscleGroup} · {selectedExercise?.equipment}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {t.admin.currentScore}: {selectedExercise?.editorial?.qualityScore ?? 0}%
                      </Badge>
                      <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        {selectedExercise?.editorial?.editorialStatus ?? "review"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.admin.description}</Label>
                    <Textarea value={exerciseForm.description} onChange={(event) => setExerciseForm((current) => ({ ...current, description: event.target.value }))} className="min-h-32" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.admin.instructionsOnePerLine}</Label>
                    <Textarea value={exerciseForm.instructions} onChange={(event) => setExerciseForm((current) => ({ ...current, instructions: event.target.value }))} className="min-h-56" />
                  </div>
                  <DialogFooter className="border-t border-slate-200/70 px-0 pt-4 dark:border-slate-800/80">
                    <Button variant="outline" onClick={() => setSelectedExerciseId(null)}>
                      {t.common.cancel}
                    </Button>
                    <Button disabled={isUpdating} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={handleSaveExercise}>
                      {t.admin.saveExercise}
                    </Button>
                  </DialogFooter>
                </div>
                <aside className="border-t border-slate-200/70 bg-slate-50/60 p-5 dark:border-slate-800/80 dark:bg-slate-900/50 lg:border-l lg:border-t-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t.admin.editorialSignals}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!selectedExercise?.editorial?.checks.hasImage ? <Badge variant="destructive" className="rounded-full">{t.admin.missingImage}</Badge> : null}
                    {!selectedExercise?.editorial?.checks.hasEnoughInstructions ? <Badge variant="destructive" className="rounded-full">{t.admin.weakInstructions}</Badge> : null}
                  </div>
                </aside>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={Boolean(selectedRecipeId && selectedRecipe)} onOpenChange={(open) => !open && setSelectedRecipeId(null)}>
            <DialogContent className="max-w-[min(1080px,calc(100%-1rem))] border-slate-200/80 bg-white/95 p-0 dark:border-slate-800/80 dark:bg-slate-950/95">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.32fr)]">
                <div className="space-y-5 p-5 sm:p-6">
                  <DialogHeader className="text-left">
                    <DialogTitle>{selectedRecipe?.name ?? t.admin.recipeQueueTitle}</DialogTitle>
                    <DialogDescription>{t.admin.recipeEditorDesc}</DialogDescription>
                  </DialogHeader>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/70">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {t.admin.currentScore}: {selectedRecipe?.editorial?.qualityScore ?? 0}%
                      </Badge>
                      <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        {selectedRecipe?.editorial?.editorialStatus ?? "review"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.admin.description}</Label>
                    <Textarea value={recipeForm.description} onChange={(event) => setRecipeForm((current) => ({ ...current, description: event.target.value }))} className="min-h-24" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.admin.instructionsOnePerLine}</Label>
                    <Textarea value={recipeForm.instructions} onChange={(event) => setRecipeForm((current) => ({ ...current, instructions: event.target.value }))} className="min-h-40" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t.admin.difficulty}</Label>
                      <Input value={recipeForm.difficulty} onChange={(event) => setRecipeForm((current) => ({ ...current, difficulty: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.admin.tagsOnePerLine}</Label>
                      <Textarea value={recipeForm.tags} onChange={(event) => setRecipeForm((current) => ({ ...current, tags: event.target.value }))} className="min-h-24" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{t.admin.prepTime}</Label>
                      <Input type="number" value={recipeForm.prepTime} onChange={(event) => setRecipeForm((current) => ({ ...current, prepTime: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.admin.cookTime}</Label>
                      <Input type="number" value={recipeForm.cookTime} onChange={(event) => setRecipeForm((current) => ({ ...current, cookTime: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.admin.calories}</Label>
                      <Input type="number" value={recipeForm.calories} onChange={(event) => setRecipeForm((current) => ({ ...current, calories: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.admin.protein}</Label>
                      <Input type="number" value={recipeForm.protein} onChange={(event) => setRecipeForm((current) => ({ ...current, protein: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.admin.carbs}</Label>
                      <Input type="number" value={recipeForm.carbs} onChange={(event) => setRecipeForm((current) => ({ ...current, carbs: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.admin.fat}</Label>
                      <Input type="number" value={recipeForm.fat} onChange={(event) => setRecipeForm((current) => ({ ...current, fat: event.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter className="border-t border-slate-200/70 px-0 pt-4 dark:border-slate-800/80">
                    <Button variant="outline" onClick={() => setSelectedRecipeId(null)}>
                      {t.common.cancel}
                    </Button>
                    <Button disabled={isUpdatingRecipe} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" onClick={handleSaveRecipe}>
                      {t.admin.saveRecipe}
                    </Button>
                  </DialogFooter>
                </div>
                <aside className="border-t border-slate-200/70 bg-slate-50/60 p-5 dark:border-slate-800/80 dark:bg-slate-900/50 lg:border-l lg:border-t-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t.admin.editorialSignals}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!selectedRecipe?.editorial?.checks.hasImage ? <Badge variant="destructive" className="rounded-full">{t.admin.missingImage}</Badge> : null}
                    {!selectedRecipe?.editorial?.checks.hasEnoughInstructions ? <Badge variant="destructive" className="rounded-full">{t.admin.weakInstructions}</Badge> : null}
                    {!selectedRecipe?.editorial?.checks.hasTags ? <Badge variant="destructive" className="rounded-full">{t.admin.fewTags}</Badge> : null}
                    {!selectedRecipe?.editorial?.checks.hasMacros ? <Badge variant="destructive" className="rounded-full">{t.admin.missingMacros}</Badge> : null}
                  </div>
                </aside>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

export default function AdminContentPage() {
  return (
    <ProtectedDashboardPage>
      <AdminContentInner />
    </ProtectedDashboardPage>
  )
}
