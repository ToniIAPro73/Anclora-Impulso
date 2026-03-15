"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWorkouts } from "@/hooks/use-workouts"
import { useRouter } from "next/navigation"
import { Loader2, Zap, Clock, Target, Dumbbell, Play, CheckCircle2 } from "lucide-react"
import type { Workout } from "@/lib/api"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLanguage } from "@/lib/contexts/language-context"

interface WorkoutPreferences {
  workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'full_body'
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  trainingEnvironment: 'gym' | 'home' | 'outdoor'
  targetMuscles: string[]
  equipment: string[]
  workoutName: string
}

export function WorkoutGenerator() {
  const { profile } = useAuth()
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    workoutType: 'strength',
    duration: 45,
    difficulty: 'beginner',
    trainingEnvironment: 'gym',
    targetMuscles: [],
    equipment: ['bodyweight'],
    workoutName: '',
  })
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { generateWorkout } = useWorkouts()
  const router = useRouter()

  useEffect(() => {
    if (!profile.recommendedPlan) {
      return
    }

    setPreferences((current) => ({
      ...current,
      workoutType: profile.recommendedPlan?.workoutType ?? current.workoutType,
      duration: profile.recommendedPlan?.duration ?? current.duration,
      difficulty: profile.recommendedPlan?.difficulty ?? current.difficulty,
      targetMuscles: profile.recommendedPlan?.targetMuscles ?? current.targetMuscles,
      equipment: profile.recommendedPlan?.equipment ?? current.equipment,
      workoutName: current.workoutName || profile.recommendedPlan?.title || current.workoutName,
    }))
  }, [profile.recommendedPlan])

  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes']
  const environmentEquipmentMap: Record<WorkoutPreferences["trainingEnvironment"], string[]> = {
    gym: ['bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'cables', 'machine'],
    home: ['bodyweight', 'dumbbells', 'resistance_bands'],
    outdoor: ['bodyweight', 'jump_rope', 'pull_up_bar'],
  }
  const equipmentTypes = environmentEquipmentMap[preferences.trainingEnvironment]

  useEffect(() => {
    setPreferences((current) => ({
      ...current,
      equipment: current.equipment.filter((equipment) => environmentEquipmentMap[current.trainingEnvironment].includes(equipment)),
    }))
  }, [preferences.trainingEnvironment])

  const handleGenerateWorkout = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const workout = await generateWorkout({
        workoutType: preferences.workoutType,
        duration: preferences.duration,
        difficulty: preferences.difficulty,
        trainingEnvironment: preferences.trainingEnvironment,
        targetMuscles: preferences.targetMuscles.length > 0 ? preferences.targetMuscles : undefined,
        equipment: preferences.equipment.length > 0 ? preferences.equipment : undefined,
        age: profile.age ?? undefined,
        sex: profile.sex ?? undefined,
      })

      // Si se proporcionó un nombre personalizado, actualizarlo
      if (preferences.workoutName) {
        // Aquí podrías hacer un update del workout si quieres
        workout.name = preferences.workoutName
      }

      setGeneratedWorkout(workout)
    } catch (err) {
      setError(err instanceof Error ? err.message : isSpanish ? "Error al generar entrenamiento" : "Error generating workout")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartWorkout = () => {
    if (generatedWorkout) {
      router.push(`/workouts/${generatedWorkout.id}`)
    }
  }

  const handleGenerateAnother = () => {
    setGeneratedWorkout(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {!generatedWorkout ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              {isSpanish ? "Preferencias del Entrenamiento" : "Workout Preferences"}
            </CardTitle>
            <CardDescription>{isSpanish ? "Personaliza tu entrenamiento según tus objetivos y equipo disponible" : "Customize your workout based on your goals and available equipment"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.recommendedPlan ? (
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  {isSpanish ? "Propuesta cargada desde tu perfil" : "Proposal loaded from your profile"}
                </p>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{profile.recommendedPlan.summary}</p>
              </div>
            ) : null}
            {profile.age && profile.age >= 40 ? (
              <div className="rounded-2xl border border-orange-200/70 bg-orange-50/80 p-4 text-sm text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                {isSpanish
                  ? `Este entrenamiento se ajustará con criterios 40+: más prioridad a fuerza, movilidad, recuperación y composición corporal${profile.sex ? ` para ${profile.sex === "female" ? "mujer" : "hombre"}` : ""}.`
                  : `This workout will use 40+ rules: more emphasis on strength, mobility, recovery and body composition${profile.sex ? ` for a ${profile.sex === "female" ? "female" : "male"} profile` : ""}.`}
              </div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isSpanish ? "Nombre del Entrenamiento (Opcional)" : "Workout Name (Optional)"}</Label>
                <Input
                  placeholder={isSpanish ? "ej., Sesión de Fuerza Matutina" : "e.g., Morning Strength Session"}
                  value={preferences.workoutName}
                  onChange={(e) => setPreferences({ ...preferences, workoutName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Tipo de Entrenamiento" : "Workout Type"}</Label>
                <Select
                  value={preferences.workoutType}
                  onValueChange={(value: any) => setPreferences({ ...preferences, workoutType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">{isSpanish ? "Fuerza" : "Strength"}</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="flexibility">{isSpanish ? "Flexibilidad" : "Flexibility"}</SelectItem>
                    <SelectItem value="full_body">{isSpanish ? "Cuerpo Completo" : "Full Body"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Duración (minutos)" : "Duration (minutes)"}</Label>
                <Select
                  value={preferences.duration.toString()}
                  onValueChange={(value) => setPreferences({ ...preferences, duration: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">{isSpanish ? "20 minutos" : "20 minutes"}</SelectItem>
                    <SelectItem value="30">{isSpanish ? "30 minutos" : "30 minutes"}</SelectItem>
                    <SelectItem value="45">{isSpanish ? "45 minutos" : "45 minutes"}</SelectItem>
                    <SelectItem value="60">{isSpanish ? "60 minutos" : "60 minutes"}</SelectItem>
                    <SelectItem value="90">{isSpanish ? "90 minutos" : "90 minutes"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Nivel de Dificultad" : "Difficulty Level"}</Label>
                <Select
                  value={preferences.difficulty}
                  onValueChange={(value: any) => setPreferences({ ...preferences, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{isSpanish ? "Principiante" : "Beginner"}</SelectItem>
                    <SelectItem value="intermediate">{isSpanish ? "Intermedio" : "Intermediate"}</SelectItem>
                    <SelectItem value="advanced">{isSpanish ? "Avanzado" : "Advanced"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Entorno de entrenamiento" : "Training environment"}</Label>
                <Select
                  value={preferences.trainingEnvironment}
                  onValueChange={(value: WorkoutPreferences["trainingEnvironment"]) =>
                    setPreferences({ ...preferences, trainingEnvironment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">{isSpanish ? "Gimnasio" : "Gym"}</SelectItem>
                    <SelectItem value="home">{isSpanish ? "Casa" : "Home"}</SelectItem>
                    <SelectItem value="outdoor">{isSpanish ? "Aire libre" : "Outdoor"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>{isSpanish ? "Grupos Musculares Objetivo (Opcional)" : "Target Muscle Groups (Optional)"}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {muscleGroups.map((muscle) => (
                  <div key={muscle} className="flex items-center space-x-2">
                    <Checkbox
                      id={muscle}
                      checked={preferences.targetMuscles.includes(muscle)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPreferences({
                            ...preferences,
                            targetMuscles: [...preferences.targetMuscles, muscle],
                          })
                        } else {
                          setPreferences({
                            ...preferences,
                            targetMuscles: preferences.targetMuscles.filter((m) => m !== muscle),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={muscle}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                    >
                      {muscle}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>{isSpanish ? "Equipo Disponible" : "Available Equipment"}</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {preferences.trainingEnvironment === 'home'
                  ? isSpanish
                    ? "Equipamiento mínimo doméstico: peso corporal, mancuernas y bandas."
                    : "Minimal home setup: bodyweight, dumbbells and bands."
                  : preferences.trainingEnvironment === 'outdoor'
                    ? isSpanish
                      ? "Opciones compatibles con sesiones en parque o al aire libre."
                      : "Options that fit park or outdoor sessions."
                    : isSpanish
                      ? "Incluye equipamiento propio de sala de musculación."
                      : "Includes standard gym-floor equipment."}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipmentTypes.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={preferences.equipment.includes(equipment)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPreferences({
                            ...preferences,
                            equipment: [...preferences.equipment, equipment],
                          })
                        } else {
                          setPreferences({
                            ...preferences,
                            equipment: preferences.equipment.filter((e) => e !== equipment),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={equipment}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                    >
                      {equipment.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={handleGenerateWorkout}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSpanish ? "Generando Entrenamiento..." : "Generating Workout..."}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {isSpanish ? "Generar Entrenamiento con IA" : "Generate AI Workout"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {isSpanish ? "¡Entrenamiento Generado!" : "Workout Generated!"}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {isSpanish ? "Tu entrenamiento personalizado está listo para comenzar" : "Your personalized workout is ready to start"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Workout */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{generatedWorkout.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {preferences.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {preferences.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {generatedWorkout.exercises.length} {isSpanish ? "ejercicios" : "exercises"}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedWorkout.exercises.map((workoutExercise, index) => (
                <div key={workoutExercise.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{workoutExercise.exercise.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {workoutExercise.exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">
                          {workoutExercise.sets} series × {workoutExercise.reps} reps
                        </Badge>
                        <Badge variant="outline">{isSpanish ? "Descanso" : "Rest"}: {workoutExercise.rest}s</Badge>
                        <Badge variant="outline" className="capitalize">
                          {workoutExercise.exercise.muscleGroup}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="flex gap-3">
                <Button
                  onClick={handleStartWorkout}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isSpanish ? "Comenzar Entrenamiento" : "Start Workout"}
                </Button>
                <Button onClick={handleGenerateAnother} variant="outline" size="lg">
                  {isSpanish ? "Generar Otro" : "Generate Another"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
