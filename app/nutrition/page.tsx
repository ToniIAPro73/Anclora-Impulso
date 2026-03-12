"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useMealPlans, useNutritionSummary, useNutritionLogs } from "@/hooks/use-nutrition"
import { Apple, ChefHat, Flame, Beef, Wheat, Droplets, Plus, Sparkles, Calendar, UtensilsCrossed } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"

const DAY_NAMES_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function NutritionPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = language === 'es'
  const dayNames = t ? DAY_NAMES_ES : DAY_NAMES_EN

  const { mealPlans, isLoading, generateMealPlan, isGenerating } = useMealPlans()
  const { data: summary } = useNutritionSummary('day')
  const { logs, logNutrition, isLogging } = useNutritionLogs('day')

  const [generateOpen, setGenerateOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [generateParams, setGenerateParams] = useState({
    goal: '',
    difficulty: '' as '' | 'facil' | 'medio' | 'dificil',
  })
  const [logData, setLogData] = useState({
    mealType: 'almuerzo' as 'desayuno' | 'almuerzo' | 'cena' | 'snack',
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const handleGenerate = async () => {
    setGenerateError(null)
    try {
      await generateMealPlan({
        goal: generateParams.goal || undefined,
        difficulty: generateParams.difficulty || undefined,
      })
      setGenerateOpen(false)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : t ? 'Error al generar el plan' : 'Error generating plan')
    }
  }

  const handleLog = async () => {
    try {
      await logNutrition(logData)
      setLogOpen(false)
      setLogData({ mealType: 'almuerzo', name: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
    } catch (err) {
      console.error(err)
    }
  }

  const latestPlan = mealPlans[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t ? 'Nutrición' : 'Nutrition'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t ? 'Planes de comida y seguimiento nutricional' : 'Meal plans and nutrition tracking'}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t ? 'Registrar Comida' : 'Log Meal'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t ? 'Registrar Comida' : 'Log Meal'}</DialogTitle>
                <DialogDescription>
                  {t ? 'Añade los macros de tu comida' : 'Add your meal macros'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t ? 'Tipo de comida' : 'Meal type'}</Label>
                  <Select value={logData.mealType} onValueChange={(v) => setLogData(d => ({ ...d, mealType: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desayuno">{t ? 'Desayuno' : 'Breakfast'}</SelectItem>
                      <SelectItem value="almuerzo">{t ? 'Almuerzo' : 'Lunch'}</SelectItem>
                      <SelectItem value="cena">{t ? 'Cena' : 'Dinner'}</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t ? 'Nombre' : 'Name'}</Label>
                  <Input value={logData.name} onChange={(e) => setLogData(d => ({ ...d, name: e.target.value }))} placeholder={t ? 'Ej: Ensalada César' : 'E.g. Caesar Salad'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t ? 'Calorías' : 'Calories'}</Label>
                    <Input type="number" value={logData.calories} onChange={(e) => setLogData(d => ({ ...d, calories: +e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t ? 'Proteína (g)' : 'Protein (g)'}</Label>
                    <Input type="number" value={logData.protein} onChange={(e) => setLogData(d => ({ ...d, protein: +e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t ? 'Carbos (g)' : 'Carbs (g)'}</Label>
                    <Input type="number" value={logData.carbs} onChange={(e) => setLogData(d => ({ ...d, carbs: +e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t ? 'Grasa (g)' : 'Fat (g)'}</Label>
                    <Input type="number" value={logData.fat} onChange={(e) => setLogData(d => ({ ...d, fat: +e.target.value }))} />
                  </div>
                </div>
                <Button onClick={handleLog} disabled={isLogging} className="w-full">
                  {isLogging ? (t ? 'Guardando...' : 'Saving...') : (t ? 'Guardar' : 'Save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={generateOpen} onOpenChange={(v) => { setGenerateOpen(v); if (!v) setGenerateError(null) }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                {t ? 'Generar Plan IA' : 'Generate AI Plan'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t ? 'Generar Plan de Comidas' : 'Generate Meal Plan'}</DialogTitle>
                <DialogDescription>
                  {t ? 'La IA creará un plan semanal personalizado' : 'AI will create a personalized weekly plan'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t ? 'Objetivo' : 'Goal'}</Label>
                  <Select value={generateParams.goal} onValueChange={(v) => setGenerateParams(p => ({ ...p, goal: v }))}>
                    <SelectTrigger><SelectValue placeholder={t ? 'Seleccionar...' : 'Select...'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perdida_peso">{t ? 'Pérdida de peso' : 'Weight loss'}</SelectItem>
                      <SelectItem value="ganancia_muscular">{t ? 'Ganancia muscular' : 'Muscle gain'}</SelectItem>
                      <SelectItem value="mantenimiento">{t ? 'Mantenimiento' : 'Maintenance'}</SelectItem>
                      <SelectItem value="energia">{t ? 'Más energía' : 'More energy'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t ? 'Dificultad de recetas' : 'Recipe difficulty'}</Label>
                  <Select value={generateParams.difficulty} onValueChange={(v) => setGenerateParams(p => ({ ...p, difficulty: v as any }))}>
                    <SelectTrigger><SelectValue placeholder={t ? 'Cualquiera' : 'Any'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facil">{t ? 'Fácil' : 'Easy'}</SelectItem>
                      <SelectItem value="medio">{t ? 'Medio' : 'Medium'}</SelectItem>
                      <SelectItem value="dificil">{t ? 'Difícil' : 'Hard'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {generateError && (
                  <div className="px-3 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                    {generateError}
                  </div>
                )}
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                  {isGenerating ? (t ? 'Generando plan...' : 'Generating plan...') : (t ? 'Generar Plan Semanal' : 'Generate Weekly Plan')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen del día */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
              <p className="text-2xl font-bold">{summary.totals.calories}</p>
              <p className="text-xs text-muted-foreground">{t ? 'Calorías' : 'Calories'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Beef className="w-6 h-6 mx-auto text-red-500 mb-1" />
              <p className="text-2xl font-bold">{Math.round(summary.totals.protein)}g</p>
              <p className="text-xs text-muted-foreground">{t ? 'Proteína' : 'Protein'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Wheat className="w-6 h-6 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">{Math.round(summary.totals.carbs)}g</p>
              <p className="text-xs text-muted-foreground">{t ? 'Carbos' : 'Carbs'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Droplets className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold">{Math.round(summary.totals.fat)}g</p>
              <p className="text-xs text-muted-foreground">{t ? 'Grasa' : 'Fat'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan semanal más reciente */}
      {latestPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t ? 'Plan Semanal Actual' : 'Current Weekly Plan'}
                </CardTitle>
                <CardDescription>
                  {t ? 'Semana del' : 'Week of'} {new Date(latestPlan.weekStart).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/nutrition/meal-plans/${latestPlan.id}`)}>
                {t ? 'Ver Completo' : 'View Full'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="0">
              <TabsList className="w-full grid grid-cols-7">
                {dayNames.map((day, i) => (
                  <TabsTrigger key={i} value={String(i)} className="text-xs px-1">
                    {day.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {dayNames.map((_, dayIndex) => {
                const dayMeals = latestPlan.meals.filter((m) => m.dayOfWeek === dayIndex)
                return (
                  <TabsContent key={dayIndex} value={String(dayIndex)} className="space-y-3 mt-4">
                    {dayMeals.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {t ? 'Sin comidas para este día' : 'No meals for this day'}
                      </p>
                    ) : (
                      dayMeals.map((meal) => (
                        <Card key={meal.id} className="bg-muted/30">
                          <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed className="w-4 h-4 text-green-600" />
                                <span className="font-medium capitalize">{meal.mealType}</span>
                              </div>
                            </div>
                            {meal.recipes.map((mr) => (
                              <div key={mr.id} className="mt-2">
                                <p className="font-medium">{mr.recipe.name}</p>
                                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                  <span>{mr.recipe.calories} kcal</span>
                                  <span>P: {mr.recipe.protein}g</span>
                                  <span>C: {mr.recipe.carbs}g</span>
                                  <span>G: {mr.recipe.fat}g</span>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Comidas registradas hoy */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-600" />
              {t ? 'Registro de Hoy' : 'Today\'s Log'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="font-medium capitalize">{log.mealType}</span>
                  {log.name && <span className="text-muted-foreground ml-2">— {log.name}</span>}
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{log.calories} kcal</span>
                  <span>P:{log.protein}g</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {!isLoading && mealPlans.length === 0 && logs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t ? '¡Empieza tu plan nutricional!' : 'Start your nutrition plan!'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t ? 'Genera un plan de comidas con IA o registra tus comidas manualmente' : 'Generate an AI meal plan or log your meals manually'}
            </p>
            <Button onClick={() => setGenerateOpen(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              {t ? 'Generar Mi Primer Plan' : 'Generate My First Plan'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
