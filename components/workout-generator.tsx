"use client"

import { useState } from "react"
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

interface WorkoutPreferences {
  workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'full_body'
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetMuscles: string[]
  equipment: string[]
  workoutName: string
}

export function WorkoutGenerator() {
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    workoutType: 'strength',
    duration: 45,
    difficulty: 'beginner',
    targetMuscles: [],
    equipment: ['bodyweight'],
    workoutName: '',
  })
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { generateWorkout } = useWorkouts()
  const router = useRouter()

  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes']
  const equipmentTypes = ['bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar']

  const handleGenerateWorkout = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const workout = await generateWorkout({
        workoutType: preferences.workoutType,
        duration: preferences.duration,
        difficulty: preferences.difficulty,
        targetMuscles: preferences.targetMuscles.length > 0 ? preferences.targetMuscles : undefined,
        equipment: preferences.equipment.length > 0 ? preferences.equipment : undefined,
      })

      // Si se proporcionó un nombre personalizado, actualizarlo
      if (preferences.workoutName) {
        // Aquí podrías hacer un update del workout si quieres
        workout.name = preferences.workoutName
      }

      setGeneratedWorkout(workout)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar entrenamiento')
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
              Preferencias del Entrenamiento
            </CardTitle>
            <CardDescription>Personaliza tu entrenamiento según tus objetivos y equipo disponible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nombre del Entrenamiento (Opcional)</Label>
                <Input
                  placeholder="ej., Sesión de Fuerza Matutina"
                  value={preferences.workoutName}
                  onChange={(e) => setPreferences({ ...preferences, workoutName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Entrenamiento</Label>
                <Select
                  value={preferences.workoutType}
                  onValueChange={(value: any) => setPreferences({ ...preferences, workoutType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Fuerza</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="flexibility">Flexibilidad</SelectItem>
                    <SelectItem value="full_body">Cuerpo Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duración (minutos)</Label>
                <Select
                  value={preferences.duration.toString()}
                  onValueChange={(value) => setPreferences({ ...preferences, duration: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nivel de Dificultad</Label>
                <Select
                  value={preferences.difficulty}
                  onValueChange={(value: any) => setPreferences({ ...preferences, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Grupos Musculares Objetivo (Opcional)</Label>
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
              <Label>Equipo Disponible</Label>
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
                      {equipment.replace('_', ' ')}
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
                  Generando Entrenamiento...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generar Entrenamiento con IA
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
                    ¡Entrenamiento Generado!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Tu entrenamiento personalizado está listo para comenzar
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
                      {generatedWorkout.exercises.length} ejercicios
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
                        <Badge variant="outline">Descanso: {workoutExercise.rest}s</Badge>
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
                  Comenzar Entrenamiento
                </Button>
                <Button onClick={handleGenerateAnother} variant="outline" size="lg">
                  Generar Otro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
