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
import { db, type Workout } from "@/lib/storage/db"
import { useRouter } from "next/navigation"
import { Loader2, Zap, Clock, Target, Dumbbell, Play } from "lucide-react"

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  equipment: string
  difficulty_level: string
  muscle_groups: string[]
  instructions: string[]
}

interface WorkoutGeneratorProps {
  user: any
  profile: any
  exercises: Exercise[]
}

interface WorkoutPreferences {
  workoutType: string
  duration: number
  difficulty: string
  targetMuscles: string[]
  equipment: string[]
  workoutName: string
}

export function WorkoutGenerator({ user, profile, exercises }: WorkoutGeneratorProps) {
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    workoutType: profile?.preferred_workout_type || "mixed",
    duration: 45,
    difficulty: profile?.fitness_level || "beginner",
    targetMuscles: [],
    equipment: ["bodyweight"],
    workoutName: "",
  })
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const muscleGroups = ["chest", "back", "shoulders", "arms", "legs", "core"]
  const equipmentTypes = ["bodyweight", "dumbbells", "barbell", "machine", "resistance_band", "kettlebell"]

  const generateWorkout = () => {
    setIsGenerating(true)

    // Filter exercises based on preferences
    const filteredExercises = exercises.filter((exercise) => {
      const matchesType = preferences.workoutType === "mixed" || exercise.category === preferences.workoutType
      const matchesDifficulty =
        preferences.difficulty === "beginner"
          ? exercise.difficulty_level === "beginner"
          : preferences.difficulty === "intermediate"
            ? ["beginner", "intermediate"].includes(exercise.difficulty_level)
            : true
      const matchesEquipment = preferences.equipment.length === 0 || preferences.equipment.includes(exercise.equipment)
      const matchesMuscles =
        preferences.targetMuscles.length === 0 ||
        (Array.isArray(exercise.muscle_groups) &&
          exercise.muscle_groups.some((muscle) => preferences.targetMuscles.includes(muscle)))

      return matchesType && matchesDifficulty && matchesEquipment && matchesMuscles
    })

    // Generate workout structure based on duration
    const exerciseCount = Math.max(4, Math.min(8, Math.floor(preferences.duration / 6)))
    const selectedExercises = []

    // Ensure variety in muscle groups
    const usedMuscleGroups = new Set()
    const shuffledExercises = [...filteredExercises].sort(() => Math.random() - 0.5)

    for (const exercise of shuffledExercises) {
      if (selectedExercises.length >= exerciseCount) break

      const hasNewMuscleGroup =
        Array.isArray(exercise.muscle_groups) && exercise.muscle_groups.some((muscle) => !usedMuscleGroups.has(muscle))
      if (hasNewMuscleGroup || selectedExercises.length < 3) {
        selectedExercises.push(exercise)
        if (Array.isArray(exercise.muscle_groups)) {
          exercise.muscle_groups.forEach((muscle) => usedMuscleGroups.add(muscle))
        }
      }
    }

    // Generate sets and reps based on workout type and difficulty
    const workoutExercises = selectedExercises.map((exercise, index) => {
      let sets, reps, restSeconds

      if (preferences.workoutType === "strength") {
        sets = preferences.difficulty === "beginner" ? 3 : preferences.difficulty === "intermediate" ? 4 : 5
        reps = preferences.difficulty === "beginner" ? 8 : preferences.difficulty === "intermediate" ? 6 : 5
        restSeconds = 90
      } else if (preferences.workoutType === "cardio") {
        sets = 3
        reps = null
        restSeconds = 30
      } else {
        sets = 3
        reps = preferences.difficulty === "beginner" ? 12 : preferences.difficulty === "intermediate" ? 10 : 8
        restSeconds = 60
      }

      return {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        exercise_category: exercise.category,
        muscle_groups: exercise.muscle_groups,
        order_index: index + 1,
        sets,
        reps,
        duration_seconds: preferences.workoutType === "cardio" ? 45 : null,
        rest_seconds: restSeconds,
        instructions: exercise.instructions,
      }
    })

    const workout = {
      name: preferences.workoutName || `${preferences.workoutType} Workout`,
      workout_type: preferences.workoutType,
      difficulty_level: preferences.difficulty,
      estimated_duration_minutes: preferences.duration,
      exercises: workoutExercises,
    }

    setTimeout(() => {
      setGeneratedWorkout(workout)
      setIsGenerating(false)
    }, 1500)
  }

  const saveWorkout = async () => {
    if (!generatedWorkout) return

    setIsSaving(true)

    try {
      const workoutData: Workout = {
        id: crypto.randomUUID(),
        userId: user.id,
        name: generatedWorkout.name,
        exercises: generatedWorkout.exercises.map((ex: any) => ({
          exerciseId: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest_seconds,
        })),
        createdAt: new Date().toISOString(),
      }

      await db.add("workouts", workoutData)

      alert("Workout saved successfully!")
      setGeneratedWorkout(null)
    } catch (error) {
      console.error("Error saving workout:", error)
      alert("Error saving workout")
    } finally {
      setIsSaving(false)
    }
  }

  const startWorkout = async () => {
    if (!generatedWorkout) return

    setIsSaving(true)

    try {
      const sessionData = {
        id: crypto.randomUUID(),
        userId: user.id,
        workoutId: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        duration: generatedWorkout.estimated_duration_minutes,
        exercises: generatedWorkout.exercises.map((ex: any) => ({
          exerciseId: ex.exercise_id,
          sets: Array(ex.sets).fill({ reps: ex.reps || 0, weight: 0 }),
        })),
      }

      await db.add("sessions", sessionData)

      alert("Workout session started! (Session tracking coming soon)")
      setGeneratedWorkout(null)
    } catch (error) {
      console.error("Error starting workout:", error)
      alert("Error starting workout")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {!generatedWorkout ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Workout Preferences
            </CardTitle>
            <CardDescription>Customize your workout to match your goals and available equipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Workout Name (Optional)</Label>
                <Input
                  placeholder="e.g., Morning Strength Session"
                  value={preferences.workoutName}
                  onChange={(e) => setPreferences({ ...preferences, workoutName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select
                  value={preferences.workoutType}
                  onValueChange={(value) => setPreferences({ ...preferences, workoutType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="bodyweight">Bodyweight</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Select
                  value={preferences.duration.toString()}
                  onValueChange={(value) => setPreferences({ ...preferences, duration: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="75">75 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={preferences.difficulty}
                  onValueChange={(value) => setPreferences({ ...preferences, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Target Muscle Groups (Optional)</Label>
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
                    <Label htmlFor={muscle} className="text-sm capitalize">
                      {muscle}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Available Equipment</Label>
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
                    <Label htmlFor={equipment} className="text-sm capitalize">
                      {equipment.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateWorkout}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Workout...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Workout
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{generatedWorkout.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {generatedWorkout.estimated_duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {generatedWorkout.difficulty_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {generatedWorkout.workout_type}
                    </span>
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {generatedWorkout.exercises.length} exercises
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={startWorkout}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Start Workout
                </Button>
                <Button onClick={saveWorkout} variant="outline" disabled={isSaving} className="bg-transparent">
                  Save for Later
                </Button>
                <Button
                  onClick={() => setGeneratedWorkout(null)}
                  variant="outline"
                  disabled={isSaving}
                  className="bg-transparent"
                >
                  Generate New
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle>Workout Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedWorkout.exercises.map((exercise: any, index: number) => (
                  <div key={exercise.exercise_id}>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exercise.exercise_name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exercise.muscle_groups.map((muscle: string) => (
                            <Badge key={muscle} variant="secondary" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            <strong>{exercise.sets}</strong> sets
                          </span>
                          {exercise.reps && (
                            <span>
                              <strong>{exercise.reps}</strong> reps
                            </span>
                          )}
                          {exercise.duration_seconds && (
                            <span>
                              <strong>{exercise.duration_seconds}s</strong> duration
                            </span>
                          )}
                          <span>
                            <strong>{exercise.rest_seconds}s</strong> rest
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < generatedWorkout.exercises.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
