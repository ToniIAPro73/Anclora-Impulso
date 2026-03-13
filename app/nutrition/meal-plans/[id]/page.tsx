"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { useMealPlan } from "@/hooks/use-nutrition"
import { ArrowLeft, Clock, ChefHat, Flame, Beef, Wheat, Droplets, UtensilsCrossed } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"

const DAY_NAMES_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function MealPlanDetailPageContent({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { language } = useLanguage()
  const t = language === 'es'
  const dayNames = t ? DAY_NAMES_ES : DAY_NAMES_EN

  const { data: plan, isLoading, error } = useMealPlan(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t ? 'Plan no encontrado' : 'Plan not found'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/nutrition')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t ? 'Volver' : 'Go Back'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/nutrition')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t ? 'Volver' : 'Back'}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {t ? 'Plan de Comidas' : 'Meal Plan'}
          </h1>
          <p className="text-muted-foreground">
            {t ? 'Semana del' : 'Week of'} {new Date(plan.weekStart).toLocaleDateString()}
            {plan.goal && <Badge variant="outline" className="ml-2 capitalize">{plan.goal}</Badge>}
          </p>
        </div>
      </div>

      <Tabs defaultValue="0">
        <TabsList className="w-full grid grid-cols-7">
          {dayNames.map((day, i) => (
            <TabsTrigger key={i} value={String(i)} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {dayNames.map((dayName, dayIndex) => {
          const dayMeals = plan.meals.filter((m) => m.dayOfWeek === dayIndex)
          const dayCalories = dayMeals.reduce(
            (total, meal) => total + meal.recipes.reduce((s, mr) => s + (mr.recipe.calories || 0), 0),
            0
          )

          return (
            <TabsContent key={dayIndex} value={String(dayIndex)} className="space-y-4 mt-4">
              {/* Resumen del día */}
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">{dayName}</h2>
                <Badge variant="secondary">{dayCalories} kcal</Badge>
              </div>

              {dayMeals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t ? 'Sin comidas programadas' : 'No meals scheduled'}
                </p>
              ) : (
                dayMeals.map((meal) => (
                  <div key={meal.id}>
                    {meal.recipes.map((mr) => (
                      <Card key={mr.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <UtensilsCrossed className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600 capitalize">{meal.mealType}</span>
                              </div>
                              <CardTitle className="text-lg">{mr.recipe.name}</CardTitle>
                              {mr.recipe.description && (
                                <CardDescription className="mt-1">{mr.recipe.description}</CardDescription>
                              )}
                            </div>
                            {mr.recipe.difficulty && (
                              <Badge variant="outline">{mr.recipe.difficulty}</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Macros */}
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-2">
                              <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                              <p className="text-sm font-bold">{mr.recipe.calories}</p>
                              <p className="text-xs text-muted-foreground">kcal</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2">
                              <Beef className="w-4 h-4 mx-auto text-red-500 mb-1" />
                              <p className="text-sm font-bold">{mr.recipe.protein}g</p>
                              <p className="text-xs text-muted-foreground">{t ? 'Prot' : 'Prot'}</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
                              <Wheat className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                              <p className="text-sm font-bold">{mr.recipe.carbs}g</p>
                              <p className="text-xs text-muted-foreground">{t ? 'Carb' : 'Carb'}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                              <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                              <p className="text-sm font-bold">{mr.recipe.fat}g</p>
                              <p className="text-xs text-muted-foreground">{t ? 'Grasa' : 'Fat'}</p>
                            </div>
                          </div>

                          {/* Tiempo de preparación */}
                          {(mr.recipe.prepTime || mr.recipe.cookTime) && (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              {mr.recipe.prepTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {t ? 'Prep:' : 'Prep:'} {mr.recipe.prepTime} min
                                </span>
                              )}
                              {mr.recipe.cookTime && (
                                <span className="flex items-center gap-1">
                                  <ChefHat className="w-3 h-3" />
                                  {t ? 'Cocción:' : 'Cook:'} {mr.recipe.cookTime} min
                                </span>
                              )}
                            </div>
                          )}

                          {/* Ingredientes */}
                          {mr.recipe.ingredients && mr.recipe.ingredients.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">{t ? 'Ingredientes' : 'Ingredients'}</h4>
                              <ul className="grid grid-cols-2 gap-1 text-sm">
                                {mr.recipe.ingredients.map((ri) => (
                                  <li key={ri.id} className="text-muted-foreground">
                                    • {ri.quantity} {ri.ingredient.unit} {ri.ingredient.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Instrucciones */}
                          {mr.recipe.instructions && (mr.recipe.instructions as string[]).length > 0 && (
                            <div>
                              <Separator className="my-3" />
                              <h4 className="font-medium mb-2">{t ? 'Instrucciones' : 'Instructions'}</h4>
                              <ol className="space-y-2 text-sm text-muted-foreground">
                                {(mr.recipe.instructions as string[]).map((step, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="font-bold text-foreground min-w-[20px]">{i + 1}.</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

export default function MealPlanDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedDashboardPage>
      <MealPlanDetailPageContent params={params} />
    </ProtectedDashboardPage>
  )
}
