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

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [equipmentFilter, setEquipmentFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  // Usar el hook para obtener ejercicios de la API
  const { exercises, isLoading, error } = useExercises({
    search: searchTerm,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    equipment: equipmentFilter !== "all" ? equipmentFilter : undefined,
    difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
  })

  // Obtener categorías y equipos únicos
  const categories = useMemo(() => {
    return [...new Set(exercises.map((e) => e.category))]
  }, [exercises])

  const equipmentTypes = useMemo(() => {
    return [...new Set(exercises.map((e) => e.equipment).filter(Boolean))]
  }, [exercises])

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

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando ejercicios...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar ejercicios</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
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
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar ejercicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Equipo</label>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todo el equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el Equipo</SelectItem>
                  {equipmentTypes.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>
                      {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dificultad</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Niveles</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <Dialog key={exercise.id}>
            <DialogTrigger asChild>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  {/* Imagen del ejercicio */}
                  {exercise.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${exercise.imageUrl}`}
                        alt={exercise.name}
                        className="w-full h-48 object-contain"
                        onError={(e) => {
                          // Ocultar imagen si falla la carga
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
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
                {/* Imagen grande en el modal */}
                {exercise.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${exercise.imageUrl}`}
                      alt={exercise.name}
                      className="w-full h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
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
                  <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                  {exercise.equipment && (
                    <Badge variant="outline">
                      {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1).replace("_", " ")}
                    </Badge>
                  )}
                </div>

                {exercise.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Descripción</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exercise.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Músculos Objetivo</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{exercise.muscleGroup}</Badge>
                  </div>
                </div>

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Instrucciones</h4>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No se encontraron ejercicios</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta ajustar tus filtros o términos de búsqueda para encontrar ejercicios.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
