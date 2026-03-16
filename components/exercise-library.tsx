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
import { Search, Filter, Play, Target, Zap, Loader2 } from "lucide-react"
import { useExercises } from "@/hooks/use-exercises"
import { useLanguage } from "@/lib/contexts/language-context"

function resolveExerciseImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return null
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    return imageUrl
  }

  const assetBase = apiUrl.replace(/\/api\/?$/, "")
  return `${assetBase}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`
}

export function ExerciseLibrary() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [equipmentFilter, setEquipmentFilter] = useState("all")
  const [environmentFilter, setEnvironmentFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  // Usar el hook para obtener ejercicios de la API
  const { exercises, isLoading, error } = useExercises({
    search: searchTerm,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    equipment: equipmentFilter !== "all" ? equipmentFilter : undefined,
    environment: environmentFilter !== "all" ? environmentFilter : undefined,
    difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
  })

  // Obtener categorías y equipos únicos
  const categories = useMemo(() => {
    return [...new Set(exercises.map((e) => e.category))]
  }, [exercises])

  const equipmentTypes = useMemo(() => {
    return [...new Set(exercises.map((e) => e.equipment).filter(Boolean))]
  }, [exercises])

  const environmentTypes = useMemo(() => {
    return [...new Set(exercises.flatMap((e) => e.trainingEnvironments ?? []).filter(Boolean))]
  }, [exercises])

  const formatEnvironment = (environment: string) => {
    if (environment === "gym") return isSpanish ? "Gimnasio" : "Gym"
    if (environment === "home") return isSpanish ? "Casa" : "Home"
    if (environment === "outdoor") return isSpanish ? "Aire libre" : "Outdoor"
    return environment
  }

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
      case "strength":
        return "💪"
      case "cardio":
        return "❤️"
      case "flexibility":
        return "🤸"
      case "balance":
        return "⚖️"
      default:
        return "⚡"
    }
  }

  const renderExerciseMedia = (exercise: { name: string; imageUrl?: string | null }, compact = false) => {
    const resolvedImageUrl = resolveExerciseImageUrl(exercise.imageUrl)

    if (resolvedImageUrl) {
      return (
        <div
          className={`overflow-hidden rounded-[24px] border border-orange-100/70 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.12),_transparent_48%),linear-gradient(145deg,_rgba(255,247,237,0.95),_rgba(255,255,255,0.9))] shadow-inner dark:border-orange-500/10 dark:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_46%),linear-gradient(145deg,_rgba(15,23,42,0.92),_rgba(2,6,23,0.92))] ${compact ? "h-48" : "h-72"} ${compact ? "mb-4" : "mb-6"}`}
        >
          <img
            src={resolvedImageUrl}
            alt={exercise.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )
    }

    return (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-[24px] border border-slate-200/70 bg-[linear-gradient(145deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.9))] text-center shadow-inner dark:border-slate-700/60 dark:bg-[linear-gradient(145deg,_rgba(15,23,42,0.92),_rgba(2,6,23,0.92))] ${compact ? "mb-4 h-48" : "mb-6 h-72"}`}
      >
        <div className="px-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isSpanish ? "Imagen no disponible todavía" : "Image not available yet"}
          </p>
        </div>
      </div>
    )
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{isSpanish ? "Cargando ejercicios..." : "Loading exercises..."}</p>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardContent className="text-center py-12">
          <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{isSpanish ? "Error al cargar ejercicios" : "Error loading exercises"}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{isSpanish ? "Reintentar" : "Retry"}</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {isSpanish ? "Filtros" : "Filters"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isSpanish ? "Buscar" : "Search"}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={isSpanish ? "Buscar ejercicios..." : "Search exercises..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isSpanish ? "Categoría" : "Category"}</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? "Todas las categorías" : "All categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isSpanish ? "Todas las categorías" : "All categories"}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isSpanish ? "Equipo" : "Equipment"}</label>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? "Todo el equipo" : "All equipment"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isSpanish ? "Todo el equipo" : "All equipment"}</SelectItem>
                  {equipmentTypes.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>
                      {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isSpanish ? "Dificultad" : "Difficulty"}</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? "Todos los niveles" : "All levels"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isSpanish ? "Todos los niveles" : "All levels"}</SelectItem>
                  <SelectItem value="beginner">{isSpanish ? "Principiante" : "Beginner"}</SelectItem>
                  <SelectItem value="intermediate">{isSpanish ? "Intermedio" : "Intermediate"}</SelectItem>
                  <SelectItem value="advanced">{isSpanish ? "Avanzado" : "Advanced"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isSpanish ? "Entorno" : "Environment"}</label>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? "Todos los entornos" : "All environments"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isSpanish ? "Todos los entornos" : "All environments"}</SelectItem>
                  {environmentTypes.map((environment) => (
                    <SelectItem key={environment} value={environment}>
                      {formatEnvironment(environment)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isSpanish
            ? `Mostrando ${exercises.length} ejercicio${exercises.length !== 1 ? "s" : ""}`
            : `Showing ${exercises.length} exercise${exercises.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <Dialog key={exercise.id}>
            <DialogTrigger asChild>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  {renderExerciseMedia(exercise, true)}
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
                    <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{exercise.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {exercise.muscleGroup}
                    </Badge>
                    {exercise.trainingEnvironments?.map((environment) => (
                      <Badge key={environment} variant="outline" className="text-xs">
                        {formatEnvironment(environment)}
                      </Badge>
                    ))}
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
                {renderExerciseMedia(exercise)}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(exercise.category)}</span>
                  <div>
                    <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1).replace("_", " ")}{" "}
                      {isSpanish ? "Ejercicio" : "Exercise"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                  {exercise.equipment && (
                    <Badge variant="outline">
                      {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1).replace("_", " ")}
                    </Badge>
                  )}
                  {exercise.trainingEnvironments?.map((environment) => (
                    <Badge key={environment} variant="secondary">
                      {formatEnvironment(environment)}
                    </Badge>
                  ))}
                </div>

                {exercise.description && (
                  <div>
                    <h4 className="font-semibold mb-2">{isSpanish ? "Descripción" : "Description"}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exercise.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">{isSpanish ? "Músculos Objetivo" : "Target Muscles"}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{exercise.muscleGroup}</Badge>
                  </div>
                </div>

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">{isSpanish ? "Instrucciones" : "Instructions"}</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {exercises.length === 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{isSpanish ? "No se encontraron ejercicios" : "No exercises found"}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isSpanish
                ? "Intenta ajustar tus filtros o términos de búsqueda para encontrar ejercicios."
                : "Try adjusting your filters or search terms to find exercises."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
