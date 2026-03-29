"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Beef, ChefHat, ChevronLeft, ChevronRight, Clock, Droplets, Flame, Search, UtensilsCrossed, Wheat } from "lucide-react"

import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRecipe, useMealPlan, useMealPlans, useRecipeLibrary, useReplaceMealRecipe } from "@/hooks/use-nutrition"
import type { Meal, Recipe } from "@/lib/api"
import { useLanguage } from "@/lib/contexts/language-context"
import {
  ANCLORA_MODAL_HEADER_CLASS,
  buildResponsiveModalClass,
} from "@/lib/ui-contracts"

const DAY_NAMES_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const NUTRITION_PRIMARY_TAB =
  "rounded-xl border border-transparent px-4 py-2 text-sm font-semibold data-[state=active]:border-emerald-400/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:via-emerald-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-[0_10px_28px_-16px_rgba(16,185,129,0.95)]"
const RECIPES_PER_PAGE = 6

function formatNutritionGoal(goal?: string | null, isSpanish = true) {
  if (!goal) return ""

  const labels: Record<string, { es: string; en: string }> = {
    perdida_peso: { es: "Pérdida de peso", en: "Weight loss" },
    ganancia_muscular: { es: "Ganancia muscular", en: "Muscle gain" },
    recomposicion: { es: "Recomposición", en: "Recomposition" },
    mantenimiento: { es: "Mantenimiento", en: "Maintenance" },
    energia: { es: "Más energía", en: "More energy" },
    lose_weight: { es: "Pérdida de peso", en: "Weight loss" },
    build_muscle: { es: "Ganancia muscular", en: "Muscle gain" },
    maintain: { es: "Mantenimiento", en: "Maintenance" },
  }

  const match = labels[goal]
  if (match) return isSpanish ? match.es : match.en

  return goal.replaceAll("_", " ")
}

function getActiveRecipe(meal: Meal): Recipe | null {
  return meal.selectedRecipe ?? meal.recipes[0]?.recipe ?? null
}

function formatRecipeSource(source: Recipe["source"], isSpanish = true) {
  switch (source) {
    case "user":
      return isSpanish ? "Mía" : "Mine"
    case "ai":
      return isSpanish ? "IA" : "AI"
    case "system":
    default:
      return isSpanish ? "Sistema" : "System"
  }
}

type CreateRecipeFormState = {
  name: string
  description: string
  instructions: string
  prepTime: string
  cookTime: string
  servings: string
  difficulty: "facil" | "medio" | "dificil"
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  tags: string
  goalTypes: string
  ingredients: string
}

const DEFAULT_RECIPE_FORM: CreateRecipeFormState = {
  name: "",
  description: "",
  instructions: "",
  prepTime: "",
  cookTime: "",
  servings: "1",
  difficulty: "facil",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  tags: "",
  goalTypes: "",
  ingredients: "",
}

function MealPlanDetailPageContent() {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === "string" ? params.id : ""
  const router = useRouter()
  const { language, t: copy } = useLanguage()
  const t = language === "es"
  const dayNames = t ? DAY_NAMES_ES : DAY_NAMES_EN
  const nutritionCopy = copy.nutrition

  const { data: plan, isLoading, error } = useMealPlan(id)
  const { deleteMealPlan, isDeleting } = useMealPlans()
  const replaceMealRecipe = useReplaceMealRecipe()
  const createRecipe = useCreateRecipe()

  const [mealDialogId, setMealDialogId] = useState<string | null>(null)
  const [libraryQuery, setLibraryQuery] = useState("")
  const [libraryScope, setLibraryScope] = useState<"all" | "mine" | "public">("all")
  const [replacementReason, setReplacementReason] = useState("")
  const [createForm, setCreateForm] = useState<CreateRecipeFormState>(DEFAULT_RECIPE_FORM)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [libraryPage, setLibraryPage] = useState(0)

  const selectedMeal = useMemo(
    () => plan?.meals.find((meal) => meal.id === mealDialogId) ?? null,
    [mealDialogId, plan],
  )
  const selectedMealRecipe = selectedMeal ? getActiveRecipe(selectedMeal) : null
  const deferredLibraryQuery = useDeferredValue(libraryQuery)

  const libraryQueryParams = useMemo(() => {
    if (!selectedMeal) return undefined

    return {
      query: deferredLibraryQuery || undefined,
      mealType: selectedMeal.mealType as "desayuno" | "almuerzo" | "cena" | "snack",
      dietType: (plan?.dietType as "ninguna" | "mediterranea" | "dash" | "ayuno_intermitente" | "alta_proteina" | undefined) ?? undefined,
      scope: libraryScope,
      limit: 24,
    }
  }, [deferredLibraryQuery, libraryScope, plan?.dietType, selectedMeal])

  const {
    data: recipeLibraryPages,
    isLoading: isLibraryLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRecipeLibrary(
    libraryQueryParams,
    { enabled: Boolean(selectedMeal), cacheKey: selectedMeal?.id ?? null }
  )

  const recipeLibrary = useMemo(() => {
    const dedupedRecipes = new Map<string, Recipe>()

    for (const page of recipeLibraryPages?.pages ?? []) {
      for (const recipe of page.recipes) {
        dedupedRecipes.set(recipe.id, recipe)
      }
    }

    return Array.from(dedupedRecipes.values())
  }, [recipeLibraryPages])

  const totalRecipeMatches = recipeLibraryPages?.pages.at(-1)?.pagination.total ?? 0
  const visibleRecipes = recipeLibrary.slice(
    libraryPage * RECIPES_PER_PAGE,
    (libraryPage + 1) * RECIPES_PER_PAGE,
  )
  const loadedRecipePages = Math.max(1, Math.ceil(recipeLibrary.length / RECIPES_PER_PAGE))
  const totalRecipePages = Math.max(1, Math.ceil(totalRecipeMatches / RECIPES_PER_PAGE))
  const recipeWindowStart = totalRecipeMatches === 0 ? 0 : libraryPage * RECIPES_PER_PAGE + 1
  const recipeWindowEnd = Math.min(totalRecipeMatches, recipeWindowStart + visibleRecipes.length - 1)

  const openReplaceDialog = (meal: Meal) => {
    setMealDialogId(meal.id)
    setLibraryQuery("")
    setLibraryScope("all")
    setReplacementReason("")
    setLibraryPage(0)
    setCreateForm({
      ...DEFAULT_RECIPE_FORM,
      tags: meal.mealType,
    })
    setDialogError(null)
  }

  const closeDialog = () => {
    setMealDialogId(null)
    setDialogError(null)
    setLibraryPage(0)
  }

  const handleLibraryPageChange = async (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLibraryPage((current) => Math.max(0, current - 1))
      return
    }

    if (libraryPage + 1 < loadedRecipePages) {
      setLibraryPage((current) => current + 1)
      return
    }

    if (!hasNextPage || isFetchingNextPage) {
      return
    }

    const result = await fetchNextPage()
    const newRecipes = result.data?.pages.at(-1)?.recipes.length ?? 0
    if (newRecipes > 0) {
      setLibraryPage((current) => current + 1)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      nutritionCopy.deletePlanConfirm
    )
    if (!confirmed) return

    await deleteMealPlan(id)
    router.push("/nutrition")
  }

  const handleReplaceWithExisting = async (recipeId: string) => {
    if (!selectedMeal) return

    try {
      setDialogError(null)
      await replaceMealRecipe.mutateAsync({
        mealId: selectedMeal.id,
        data: {
          recipeId,
          reason: replacementReason || (t ? "Sustitución manual desde biblioteca" : "Manual swap from recipe library"),
        },
      })
      closeDialog()
    } catch (mutationError) {
      setDialogError(mutationError instanceof Error ? mutationError.message : (t ? "No se pudo sustituir la receta." : "Could not replace recipe."))
    }
  }

  const handleCreateAndReplace = async () => {
    if (!selectedMeal) return

    const instructionList = createForm.instructions
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)

    const ingredientLines = createForm.ingredients
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)

    if (!createForm.name.trim() || instructionList.length === 0 || ingredientLines.length === 0) {
      setDialogError(t ? "Nombre, instrucciones e ingredientes son obligatorios." : "Name, instructions and ingredients are required.")
      return
    }

    try {
      const parsedIngredients = ingredientLines.map((line) => {
        const [name, quantityRaw, unit] = line.split("|").map((part) => part.trim())
        const quantity = Number(quantityRaw)

        if (!name || !unit || Number.isNaN(quantity) || quantity <= 0) {
          throw new Error(t ? `Ingrediente inválido: ${line}` : `Invalid ingredient row: ${line}`)
        }

        return { name, quantity, unit }
      })

      setDialogError(null)

      const createdRecipe = await createRecipe.mutateAsync({
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        instructions: instructionList,
        prepTime: createForm.prepTime ? Number(createForm.prepTime) : null,
        cookTime: createForm.cookTime ? Number(createForm.cookTime) : null,
        servings: createForm.servings ? Number(createForm.servings) : 1,
        difficulty: createForm.difficulty,
        calories: createForm.calories ? Number(createForm.calories) : null,
        protein: createForm.protein ? Number(createForm.protein) : null,
        carbs: createForm.carbs ? Number(createForm.carbs) : null,
        fat: createForm.fat ? Number(createForm.fat) : null,
        fiber: createForm.fiber ? Number(createForm.fiber) : null,
        tags: createForm.tags.split("\n").map((value) => value.trim()).filter(Boolean),
        mealTypes: [selectedMeal.mealType as "desayuno" | "almuerzo" | "cena" | "snack"],
        dietTypes: plan?.dietType ? [plan.dietType as "ninguna" | "mediterranea" | "dash" | "ayuno_intermitente" | "alta_proteina"] : [],
        goalTypes: createForm.goalTypes.split("\n").map((value) => value.trim()).filter(Boolean),
        ingredients: parsedIngredients,
      })

      await replaceMealRecipe.mutateAsync({
        mealId: selectedMeal.id,
        data: {
          recipeId: createdRecipe.id,
          reason: replacementReason || (t ? "Receta creada por el usuario" : "User-created recipe"),
        },
      })

      closeDialog()
    } catch (mutationError) {
      setDialogError(mutationError instanceof Error ? mutationError.message : (t ? "No se pudo crear y asignar la receta." : "Could not create and assign recipe."))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{nutritionCopy.mealPlanNotFound}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/nutrition")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {nutritionCopy.backToNutrition}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/nutrition")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {nutritionCopy.backToNutrition}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{nutritionCopy.detailTitle}</h1>
            <p className="text-muted-foreground">
              {nutritionCopy.weekOf} {new Date(plan.weekStart).toLocaleDateString()}
              {plan.goal && <Badge variant="outline" className="ml-2">{formatNutritionGoal(plan.goal, t)}</Badge>}
              {plan.dietType === "ayuno_intermitente" && <Badge variant="outline" className="ml-2">16:8</Badge>}
              {plan.dietType === "alta_proteina" && <Badge variant="outline" className="ml-2">{t ? "Alta proteína" : "High protein"}</Badge>}
            </p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          {nutritionCopy.deletePlan}
        </Button>
      </div>

      <Tabs defaultValue="0">
        <TabsList className="grid w-full grid-cols-7">
          {dayNames.map((day, i) => (
            <TabsTrigger key={i} value={String(i)} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {dayNames.map((dayName, dayIndex) => {
          const dayMeals = plan.meals.filter((meal) => meal.dayOfWeek === dayIndex)
          const dayCalories = dayMeals.reduce((total, meal) => {
            const recipe = getActiveRecipe(meal)
            return total + Math.round((recipe?.calories || 0) * meal.servingMultiplier)
          }, 0)

          return (
            <TabsContent key={dayIndex} value={String(dayIndex)} className="mt-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">{dayName}</h2>
                <Badge variant="secondary">{dayCalories} kcal</Badge>
              </div>

              {dayMeals.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {nutritionCopy.noMealsScheduled}
                </p>
              ) : (
                dayMeals.map((meal) => {
                  const recipe = getActiveRecipe(meal)

                  if (!recipe) {
                    return null
                  }

                  return (
                    <Card key={meal.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium capitalize text-green-600">{meal.mealType}</span>
                              {meal.servingMultiplier < 1 && (
                                <Badge variant="secondary" className="text-[10px]">
                              {nutritionCopy.adjusted} -{Math.round((1 - meal.servingMultiplier) * 100)}%
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                            {recipe.description && (
                              <CardDescription className="mt-1">{recipe.description}</CardDescription>
                            )}
                            {meal.adjustmentReason && (
                              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{meal.adjustmentReason}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {recipe.difficulty && <Badge variant="outline">{recipe.difficulty}</Badge>}
                            <Button variant="success" size="sm" onClick={() => openReplaceDialog(meal)}>
                              {nutritionCopy.swapMeal}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-950/30">
                            <Flame className="mx-auto mb-1 h-4 w-4 text-orange-500" />
                            <p className="text-sm font-bold">{Math.round((recipe.calories || 0) * meal.servingMultiplier)}</p>
                            <p className="text-xs text-muted-foreground">kcal</p>
                          </div>
                          <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/30">
                            <Beef className="mx-auto mb-1 h-4 w-4 text-red-500" />
                            <p className="text-sm font-bold">{recipe.protein}g</p>
                            <p className="text-xs text-muted-foreground">Prot</p>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
                            <Wheat className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                            <p className="text-sm font-bold">{recipe.carbs}g</p>
                            <p className="text-xs text-muted-foreground">{t ? "Carb" : "Carb"}</p>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
                            <Droplets className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                            <p className="text-sm font-bold">{recipe.fat}g</p>
                            <p className="text-xs text-muted-foreground">{t ? "Grasa" : "Fat"}</p>
                          </div>
                        </div>

                        {(recipe.prepTime || recipe.cookTime) && (
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {recipe.prepTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {t ? "Prep:" : "Prep:"} {recipe.prepTime} min
                              </span>
                            )}
                            {recipe.cookTime && (
                              <span className="flex items-center gap-1">
                                <ChefHat className="h-3 w-3" />
                                {t ? "Cocción:" : "Cook:"} {recipe.cookTime} min
                              </span>
                            )}
                          </div>
                        )}

                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-medium">{t ? "Ingredientes" : "Ingredients"}</h4>
                            <ul className="grid grid-cols-2 gap-1 text-sm">
                              {recipe.ingredients.map((ri) => (
                                <li key={ri.id} className="text-muted-foreground">
                                  • {ri.quantity} {ri.ingredient.unit} {ri.ingredient.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {recipe.instructions && recipe.instructions.length > 0 && (
                          <div>
                            <Separator className="my-3" />
                            <h4 className="mb-2 font-medium">{t ? "Instrucciones" : "Instructions"}</h4>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                              {recipe.instructions.map((step, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="min-w-[20px] font-bold text-foreground">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <Dialog open={Boolean(selectedMeal)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent
          showCloseButton={false}
          className={`grid max-h-[calc(100dvh-0.5rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden ${buildResponsiveModalClass("lg:max-w-[1460px] xl:max-w-[1540px]")}`}
        >
          <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-4 overflow-hidden p-4 sm:p-5 lg:p-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-4 top-4 z-10 rounded-full border-slate-700/70 bg-slate-900/45 px-5 text-slate-100 hover:bg-slate-800/70 dark:border-slate-700/80 dark:bg-slate-900/45 sm:right-5 sm:top-5 lg:right-6 lg:top-6"
            onClick={closeDialog}
          >
            {copy.common.close}
          </Button>
          <DialogHeader className={ANCLORA_MODAL_HEADER_CLASS}>
            <DialogTitle>{nutritionCopy.swapMealTitle}</DialogTitle>
            <DialogDescription>
              {selectedMealRecipe
                ? t
                  ? `Sustituye ${selectedMealRecipe.name} por una receta de biblioteca o crea una nueva.`
                  : `Replace ${selectedMealRecipe.name} with a library recipe or create your own.`
                : t
                  ? nutritionCopy.swapMealFallback
                  : nutritionCopy.swapMealFallback}
            </DialogDescription>
          </DialogHeader>

          {dialogError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {dialogError}
            </div>
          ) : null}

          <Tabs defaultValue="library" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
            <TabsList className="h-auto w-fit rounded-2xl bg-slate-900/10 p-1 dark:bg-slate-800/60">
              <TabsTrigger value="library" className={NUTRITION_PRIMARY_TAB}>{nutritionCopy.library}</TabsTrigger>
              <TabsTrigger value="create" className={NUTRITION_PRIMARY_TAB}>{nutritionCopy.createRecipe}</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-0 grid min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)_auto] gap-4 overflow-hidden">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-2">
                  <Label>{nutritionCopy.searchRecipe}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={libraryQuery}
                      onChange={(event) => {
                        setLibraryQuery(event.target.value)
                        setLibraryPage(0)
                      }}
                      placeholder={t ? "Nombre, ingrediente o tag" : "Name, ingredient or tag"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{nutritionCopy.visibility}</Label>
                  <Select
                    value={libraryScope}
                    onValueChange={(value) => {
                      setLibraryScope(value as "all" | "mine" | "public")
                      setLibraryPage(0)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{nutritionCopy.allVisibility}</SelectItem>
                      <SelectItem value="public">{nutritionCopy.publicLibrary}</SelectItem>
                      <SelectItem value="mine">{nutritionCopy.myRecipes}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{nutritionCopy.swapReason}</Label>
                <Input
                  value={replacementReason}
                  onChange={(event) => setReplacementReason(event.target.value)}
                  placeholder={nutritionCopy.swapReasonPlaceholder}
                />
              </div>

              {!isLibraryLoading && totalRecipeMatches > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t
                    ? `Mostrando ${recipeWindowStart}-${recipeWindowEnd} de ${totalRecipeMatches} recetas compatibles`
                    : `Showing ${recipeWindowStart}-${recipeWindowEnd} of ${totalRecipeMatches} matching recipes`}
                </p>
              ) : null}

              <div className="min-h-0 overflow-hidden">
                {isLibraryLoading ? (
                  <p className="text-sm text-muted-foreground">{nutritionCopy.libraryLoading}</p>
                ) : recipeLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{nutritionCopy.libraryEmpty}</p>
                ) : (
                  <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
                  {visibleRecipes.map((recipe) => (
                    <Card key={recipe.id} className="ui-motion-card-subtle flex h-full min-h-0 flex-col gap-3 border-slate-200/70 py-3 shadow-sm">
                      <CardHeader className="space-y-2 px-4 pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="line-clamp-2 text-sm leading-6">{recipe.name}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2 text-xs leading-5">{recipe.description || "—"}</CardDescription>
                          </div>
                          <Badge variant="outline">{formatRecipeSource(recipe.source, t)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span>{Math.round(recipe.calories || 0)} kcal</span>
                          <span>P: {recipe.protein || 0}g</span>
                          <span>C: {recipe.carbs || 0}g</span>
                          <span>G: {recipe.fat || 0}g</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-0">
                        <div className="flex min-h-[24px] flex-wrap gap-1.5">
                          {(recipe.tags || []).slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                        <Button
                          variant="success"
                          className="mt-auto w-full"
                          disabled={replaceMealRecipe.isPending}
                          onClick={() => void handleReplaceWithExisting(recipe.id)}
                        >
                          {nutritionCopy.useThisRecipe}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </div>

              {!isLibraryLoading && recipeLibrary.length > 0 ? (
                <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-slate-800/80">
                  <p className="text-xs text-muted-foreground">
                    {`${nutritionCopy.pageLabel} ${libraryPage + 1} ${t ? "de" : "of"} ${totalRecipePages}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => void handleLibraryPageChange("prev")}
                      disabled={libraryPage === 0 || replaceMealRecipe.isPending}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t ? "Anterior" : "Previous"}
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      className="rounded-xl"
                      onClick={() => void handleLibraryPageChange("next")}
                      disabled={
                        replaceMealRecipe.isPending ||
                        isFetchingNextPage ||
                        (libraryPage + 1 >= loadedRecipePages && !hasNextPage)
                      }
                    >
                      {isFetchingNextPage ? (t ? "Cargando..." : "Loading...") : (t ? "Siguiente" : "Next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="create" className="mt-0 min-h-0 overflow-y-auto pr-1">
              <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t ? "Nombre" : "Name"}</Label>
                    <Input
                      value={createForm.name}
                      onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder={t ? "Ej. Bowl de pavo y arroz" : "e.g. Turkey rice bowl"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t ? "Descripción" : "Description"}</Label>
                    <Textarea
                      value={createForm.description}
                      onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                      className="min-h-[96px]"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{t ? "Prep" : "Prep"}</Label>
                      <Input type="number" value={createForm.prepTime} onChange={(event) => setCreateForm((current) => ({ ...current, prepTime: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t ? "Cocción" : "Cook"}</Label>
                      <Input type="number" value={createForm.cookTime} onChange={(event) => setCreateForm((current) => ({ ...current, cookTime: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t ? "Raciones" : "Servings"}</Label>
                      <Input type="number" value={createForm.servings} onChange={(event) => setCreateForm((current) => ({ ...current, servings: event.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t ? "Dificultad" : "Difficulty"}</Label>
                    <Select
                      value={createForm.difficulty}
                      onValueChange={(value) => setCreateForm((current) => ({ ...current, difficulty: value as "facil" | "medio" | "dificil" }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facil">{t ? "Fácil" : "Easy"}</SelectItem>
                        <SelectItem value="medio">{t ? "Medio" : "Medium"}</SelectItem>
                        <SelectItem value="dificil">{t ? "Difícil" : "Hard"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>kcal</Label>
                      <Input type="number" value={createForm.calories} onChange={(event) => setCreateForm((current) => ({ ...current, calories: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t ? "Proteína" : "Protein"}</Label>
                      <Input type="number" value={createForm.protein} onChange={(event) => setCreateForm((current) => ({ ...current, protein: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t ? "Carbohidratos" : "Carbs"}</Label>
                      <Input type="number" value={createForm.carbs} onChange={(event) => setCreateForm((current) => ({ ...current, carbs: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t ? "Grasas" : "Fat"}</Label>
                      <Input type="number" value={createForm.fat} onChange={(event) => setCreateForm((current) => ({ ...current, fat: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t ? "Fibra" : "Fiber"}</Label>
                      <Input type="number" value={createForm.fiber} onChange={(event) => setCreateForm((current) => ({ ...current, fiber: event.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t ? "Tags (uno por línea)" : "Tags (one per line)"}</Label>
                    <Textarea
                      value={createForm.tags}
                      onChange={(event) => setCreateForm((current) => ({ ...current, tags: event.target.value }))}
                      className="min-h-[92px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t ? "Objetivos compatibles (uno por línea)" : "Compatible goals (one per line)"}</Label>
                    <Textarea
                      value={createForm.goalTypes}
                      onChange={(event) => setCreateForm((current) => ({ ...current, goalTypes: event.target.value }))}
                      className="min-h-[92px]"
                      placeholder={t ? "perdida_peso\nmantenimiento\nganancia_muscular" : "weight_loss\nmaintenance\nmuscle_gain"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t ? "Ingredientes" : "Ingredients"}</Label>
                    <Textarea
                      value={createForm.ingredients}
                      onChange={(event) => setCreateForm((current) => ({ ...current, ingredients: event.target.value }))}
                      className="min-h-[144px]"
                      placeholder={t ? "Formato: nombre | cantidad | unidad\nEj.\npollo | 180 | g\narroz integral | 80 | g" : "Format: name | quantity | unit\nE.g.\nchicken | 180 | g\nbrown rice | 80 | g"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t ? "Instrucciones (una por línea)" : "Instructions (one per line)"}</Label>
                    <Textarea
                      value={createForm.instructions}
                      onChange={(event) => setCreateForm((current) => ({ ...current, instructions: event.target.value }))}
                      className="min-h-[144px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="success" disabled={createRecipe.isPending || replaceMealRecipe.isPending} onClick={() => void handleCreateAndReplace()}>
                  {t ? "Crear y usar en esta comida" : "Create and use for this meal"}
                </Button>
              </div>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MealPlanDetailPage() {
  return (
    <ProtectedDashboardPage>
      <MealPlanDetailPageContent />
    </ProtectedDashboardPage>
  )
}
