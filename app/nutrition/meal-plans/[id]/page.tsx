"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Beef, ChefHat, Clock, Droplets, Flame, Plus, Search, UtensilsCrossed, Wheat } from "lucide-react"

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

const DAY_NAMES_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function getActiveRecipe(meal: Meal): Recipe | null {
  return meal.selectedRecipe ?? meal.recipes[0]?.recipe ?? null
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
  const { language } = useLanguage()
  const t = language === "es"
  const dayNames = t ? DAY_NAMES_ES : DAY_NAMES_EN

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

  const selectedMeal = useMemo(
    () => plan?.meals.find((meal) => meal.id === mealDialogId) ?? null,
    [mealDialogId, plan],
  )
  const selectedMealRecipe = selectedMeal ? getActiveRecipe(selectedMeal) : null

  const libraryQueryParams = useMemo(() => {
    if (!selectedMeal) return undefined

    return {
      query: libraryQuery || undefined,
      mealType: selectedMeal.mealType as "desayuno" | "almuerzo" | "cena" | "snack",
      dietType: (plan?.dietType as "ninguna" | "mediterranea" | "dash" | "ayuno_intermitente" | "alta_proteina" | undefined) ?? undefined,
      scope: libraryScope,
      limit: 24,
    }
  }, [libraryQuery, libraryScope, plan?.dietType, selectedMeal])

  const { data: recipeLibrary = [], isLoading: isLibraryLoading } = useRecipeLibrary(
    libraryQueryParams,
    { enabled: Boolean(selectedMeal) }
  )

  const openReplaceDialog = (meal: Meal) => {
    setMealDialogId(meal.id)
    setLibraryQuery("")
    setLibraryScope("all")
    setReplacementReason("")
    setCreateForm({
      ...DEFAULT_RECIPE_FORM,
      tags: meal.mealType,
    })
    setDialogError(null)
  }

  const closeDialog = () => {
    setMealDialogId(null)
    setDialogError(null)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      t ? "¿Quieres eliminar este plan nutricional?" : "Do you want to delete this nutrition plan?"
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
        <p className="text-muted-foreground">{t ? "Plan no encontrado" : "Plan not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/nutrition")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t ? "Volver" : "Go Back"}
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
            {t ? "Volver" : "Back"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t ? "Plan de Comidas" : "Meal Plan"}</h1>
            <p className="text-muted-foreground">
              {t ? "Semana del" : "Week of"} {new Date(plan.weekStart).toLocaleDateString()}
              {plan.goal && <Badge variant="outline" className="ml-2 capitalize">{plan.goal}</Badge>}
              {plan.dietType === "ayuno_intermitente" && <Badge variant="outline" className="ml-2">16:8</Badge>}
              {plan.dietType === "alta_proteina" && <Badge variant="outline" className="ml-2">{t ? "Alta proteína" : "High protein"}</Badge>}
            </p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          {t ? "Eliminar plan" : "Delete plan"}
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
                  {t ? "Sin comidas programadas" : "No meals scheduled"}
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
                                  {t ? "Ajustada" : "Adjusted"} -{Math.round((1 - meal.servingMultiplier) * 100)}%
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
                            <Button variant="outline" size="sm" onClick={() => openReplaceDialog(meal)}>
                              <Plus className="mr-2 h-4 w-4" />
                              {t ? "Cambiar comida" : "Swap meal"}
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
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t ? "Cambiar comida" : "Swap meal"}</DialogTitle>
            <DialogDescription>
              {selectedMealRecipe
                ? t
                  ? `Sustituye ${selectedMealRecipe.name} por una receta de biblioteca o crea una nueva.`
                  : `Replace ${selectedMealRecipe.name} with a library recipe or create your own.`
                : t
                  ? "Selecciona una alternativa para esta comida."
                  : "Select an alternative for this meal."}
            </DialogDescription>
          </DialogHeader>

          {dialogError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {dialogError}
            </div>
          ) : null}

          <Tabs defaultValue="library" className="space-y-4">
            <TabsList>
              <TabsTrigger value="library">{t ? "Biblioteca" : "Library"}</TabsTrigger>
              <TabsTrigger value="create">{t ? "Crear receta" : "Create recipe"}</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <div className="space-y-2">
                  <Label>{t ? "Buscar receta" : "Search recipe"}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={libraryQuery}
                      onChange={(event) => setLibraryQuery(event.target.value)}
                      placeholder={t ? "Nombre, ingrediente o tag" : "Name, ingredient or tag"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t ? "Visibilidad" : "Visibility"}</Label>
                  <Select value={libraryScope} onValueChange={(value) => setLibraryScope(value as "all" | "mine" | "public")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t ? "Todo" : "All"}</SelectItem>
                      <SelectItem value="public">{t ? "Biblioteca pública" : "Public library"}</SelectItem>
                      <SelectItem value="mine">{t ? "Mis recetas" : "My recipes"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t ? "Motivo del cambio" : "Swap reason"}</Label>
                <Input
                  value={replacementReason}
                  onChange={(event) => setReplacementReason(event.target.value)}
                  placeholder={t ? "Ej. no me gusta el pescado, quiero una opción más rápida..." : "e.g. I dislike fish, I want a faster option..."}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {isLibraryLoading ? (
                  <p className="text-sm text-muted-foreground">{t ? "Cargando biblioteca..." : "Loading library..."}</p>
                ) : recipeLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t ? "No hay recetas que encajen con ese filtro." : "No recipes matched that filter."}</p>
                ) : (
                  recipeLibrary.map((recipe) => (
                    <Card key={recipe.id} className="border-slate-200/70">
                      <CardHeader className="space-y-2 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">{recipe.name}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">{recipe.description || "—"}</CardDescription>
                          </div>
                          <Badge variant="outline">{recipe.source === "user" ? (t ? "Mía" : "Mine") : recipe.source}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{Math.round(recipe.calories || 0)} kcal</span>
                          <span>P: {recipe.protein || 0}g</span>
                          <span>C: {recipe.carbs || 0}g</span>
                          <span>G: {recipe.fat || 0}g</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {(recipe.tags || []).slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                        <Button
                          className="w-full"
                          disabled={replaceMealRecipe.isPending}
                          onClick={() => void handleReplaceWithExisting(recipe.id)}
                        >
                          {t ? "Usar esta receta" : "Use this recipe"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
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
                <Button disabled={createRecipe.isPending || replaceMealRecipe.isPending} onClick={() => void handleCreateAndReplace()}>
                  {t ? "Crear y usar en esta comida" : "Create and use for this meal"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
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
