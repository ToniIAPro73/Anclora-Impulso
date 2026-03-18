"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, BarChart3, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react"

import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const selectedExercise = useMemo(
    () => summary?.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? summary?.exercises[0] ?? null,
    [selectedExerciseId, summary],
  )
  const selectedRecipe = useMemo(
    () => recipesSummary?.recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipesSummary?.recipes[0] ?? null,
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
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t.admin.restrictedDesc}
              </p>
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
  }

  const currentError = error ?? recipesError
  const loading = isLoading || isLoadingRecipes

  return (
    <div className="space-y-6 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.admin.title}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {t.admin.subtitle}
        </p>
      </div>

      {loading ? (
        <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            {t.admin.loading}
          </CardContent>
        </Card>
      ) : currentError || !summary || !recipesSummary ? (
        <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="py-12 text-center text-red-500">
            {currentError ?? t.admin.loadError}
          </CardContent>
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

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <Card className="ui-motion-card-subtle overflow-hidden border-0 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-slate-900">
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
                    ? summary.exercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => setSelectedExerciseId(exercise.id)}
                          className={`relative z-0 flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
                            selectedExercise?.id === exercise.id
                              ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-500/10"
                              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">{exercise.name}</p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {exercise.category} · {exercise.muscleGroup} · {exercise.equipment}
                              </p>
                            </div>
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                              {exercise.editorial?.qualityScore ?? 0}%
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                              {exercise.editorial?.editorialStatus ?? "review"}
                            </Badge>
                            {!exercise.editorial?.checks.hasImage ? <Badge variant="destructive" className="rounded-full">{t.admin.missingImage}</Badge> : null}
                            {!exercise.editorial?.checks.hasEnoughInstructions ? <Badge variant="destructive" className="rounded-full">{t.admin.weakInstructions}</Badge> : null}
                          </div>
                        </button>
                      ))
                    : recipesSummary.recipes.map((recipe) => (
                        <button
                          key={recipe.id}
                          type="button"
                          onClick={() => setSelectedRecipeId(recipe.id)}
                          className={`relative z-0 flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
                            selectedRecipe?.id === recipe.id
                              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-500/10"
                              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">{recipe.name}</p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {(recipe.tags ?? []).slice(0, 3).join(" · ") || "—"}
                              </p>
                            </div>
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                              {recipe.editorial?.qualityScore ?? 0}%
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                              {recipe.editorial?.editorialStatus ?? "review"}
                            </Badge>
                            {!recipe.editorial?.checks.hasImage ? <Badge variant="destructive" className="rounded-full">{t.admin.missingImage}</Badge> : null}
                            {!recipe.editorial?.checks.hasEnoughInstructions ? <Badge variant="destructive" className="rounded-full">{t.admin.weakInstructions}</Badge> : null}
                            {!recipe.editorial?.checks.hasTags ? <Badge variant="destructive" className="rounded-full">{t.admin.fewTags}</Badge> : null}
                            {!recipe.editorial?.checks.hasMacros ? <Badge variant="destructive" className="rounded-full">{t.admin.missingMacros}</Badge> : null}
                          </div>
                        </button>
                      ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle>{t.admin.quickEditor}</CardTitle>
                    <CardDescription>
                      {activeTab === "exercises" ? t.admin.exerciseEditorDesc : t.admin.recipeEditorDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeTab === "exercises" ? (
                      selectedExercise ? (
                        <>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{selectedExercise.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t.admin.currentScore}: {selectedExercise.editorial?.qualityScore ?? 0}% · {selectedExercise.editorial?.editorialStatus ?? "review"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.admin.description}</Label>
                            <Textarea value={exerciseForm.description} onChange={(event) => setExerciseForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28" />
                          </div>
                          <div className="space-y-2">
                            <Label>{t.admin.instructionsOnePerLine}</Label>
                            <Textarea value={exerciseForm.instructions} onChange={(event) => setExerciseForm((current) => ({ ...current, instructions: event.target.value }))} className="min-h-40" />
                          </div>
                          <Button disabled={isUpdating} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={handleSaveExercise}>
                            {t.admin.saveExercise}
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t.admin.selectExercise}</p>
                      )
                    ) : selectedRecipe ? (
                      <>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedRecipe.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t.admin.currentScore}: {selectedRecipe.editorial?.qualityScore ?? 0}% · {selectedRecipe.editorial?.editorialStatus ?? "review"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.admin.description}</Label>
                          <Textarea value={recipeForm.description} onChange={(event) => setRecipeForm((current) => ({ ...current, description: event.target.value }))} className="min-h-24" />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.admin.instructionsOnePerLine}</Label>
                          <Textarea value={recipeForm.instructions} onChange={(event) => setRecipeForm((current) => ({ ...current, instructions: event.target.value }))} className="min-h-32" />
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
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                        <Button disabled={isUpdatingRecipe} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" onClick={handleSaveRecipe}>
                          {t.admin.saveRecipe}
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t.admin.selectRecipe}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="ui-motion-card-subtle border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-500" />
                      {t.admin.eventsTitle}
                    </CardTitle>
                    <CardDescription>
                      {t.admin.eventsDesc}
                    </CardDescription>
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
                          <Badge variant="outline" className="rounded-full px-3 py-1">{event.count}</Badge>
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
            </div>
          </Tabs>
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
