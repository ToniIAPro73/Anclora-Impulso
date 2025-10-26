"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Play, Target, Zap } from "lucide-react"

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  equipment: string
  difficulty_level: string
  muscle_groups: string[]
  instructions: string[]
  video_url?: string
  image_url?: string
}

interface ExerciseLibraryProps {
  exercises: Exercise[]
}

export function ExerciseLibrary({ exercises }: ExerciseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [equipmentFilter, setEquipmentFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_groups.some((group) => group.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter
      const matchesEquipment = equipmentFilter === "all" || exercise.equipment === equipmentFilter
      const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty_level === difficultyFilter

      return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty
    })
  }, [exercises, searchTerm, categoryFilter, equipmentFilter, difficultyFilter])

  const categories = [...new Set(exercises.map((e) => e.category))]
  const equipmentTypes = [...new Set(exercises.map((e) => e.equipment).filter(Boolean))]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "chest":
        return "💪"
      case "back":
        return "🏋️"
      case "shoulders":
        return "🤸"
      case "arms":
        return "💪"
      case "legs":
        return "🦵"
      case "core":
        return "🎯"
      case "cardio":
        return "❤️"
      case "full_body":
        return "🔥"
      default:
        return "⚡"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Equipment</label>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipmentTypes.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>
                      {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Dialog key={exercise.id}>
            <DialogTrigger asChild>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
                      <div>
                        <CardTitle className="text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {exercise.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1).replace("_", " ")}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(exercise.difficulty_level)}>{exercise.difficulty_level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{exercise.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscle_groups.slice(0, 3).map((muscle) => (
                      <Badge key={muscle} variant="secondary" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                    {exercise.muscle_groups.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{exercise.muscle_groups.length - 3}
                      </Badge>
                    )}
                  </div>
                  {exercise.equipment && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Target className="w-4 h-4" />
                      {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1).replace("_", " ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(exercise.category)}</span>
                  <div>
                    <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1).replace("_", " ")}{" "}
                      Exercise
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(exercise.difficulty_level)}>{exercise.difficulty_level}</Badge>
                  {exercise.equipment && (
                    <Badge variant="outline">
                      {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1).replace("_", " ")}
                    </Badge>
                  )}
                </div>

                {exercise.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exercise.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Target Muscles</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscle_groups.map((muscle) => (
                      <Badge key={muscle} variant="secondary">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Instructions</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {exercise.video_url && (
                  <div>
                    <h4 className="font-semibold mb-2">Video Tutorial</h4>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Tutorial
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No exercises found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms to find exercises.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
