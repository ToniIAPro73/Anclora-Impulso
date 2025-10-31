"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Dumbbell, TrendingUp, Calendar, Play, Plus, Trophy, Target, Clock, Activity, Loader2 } from "lucide-react"
import { useProgress } from "@/hooks/use-progress"
import { useAuth } from "@/lib/contexts/auth-context"

export function DashboardContent() {
  const { user } = useAuth()
  const { progress, isLoading } = useProgress()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = progress?.stats || {
    totalWorkouts: 0,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    avgDuration: 0,
    personalRecords: [],
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido de nuevo, {user?.fullName || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">¿Listo para alcanzar tus objetivos de fitness hoy?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-500" />
              Entrenamientos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWorkouts}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.workoutsThisWeek} esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-green-500" />
              Duración Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(stats.avgDuration / 60)}min
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Por entrenamiento</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Récords Personales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.personalRecords.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Logros</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-500" />
              Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.workoutsThisMonth}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Entrenamientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Comenzar Entrenamiento
            </CardTitle>
            <CardDescription className="text-orange-100">Inicia tu sesión de entrenamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/workouts/generate">
                <Play className="w-4 h-4 mr-2" />
                Comenzar Ahora
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Biblioteca de Ejercicios
            </CardTitle>
            <CardDescription className="text-blue-100">Explora ejercicios disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/exercises">
                <Dumbbell className="w-4 h-4 mr-2" />
                Ver Ejercicios
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Seguir Progreso
            </CardTitle>
            <CardDescription className="text-purple-100">Monitorea tus logros</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/progress">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Progreso
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      {stats.personalRecords.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  Récords Personales Recientes
                </CardTitle>
                <CardDescription>Tus mejores marcas</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/progress">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.personalRecords.slice(0, 5).map((record: any) => (
                <div
                  key={record.exercise_id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{record.exercise_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500">
                    {record.max_weight} kg
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {stats.totalWorkouts === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              ¡Comienza tu Viaje Fitness!
            </CardTitle>
            <CardDescription>Sigue estos pasos para comenzar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Explora la Biblioteca de Ejercicios</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Familiarízate con los ejercicios disponibles
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Genera tu Primer Entrenamiento</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usa nuestra IA para crear un entrenamiento personalizado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Registra tu Progreso</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completa entrenamientos y registra tus medidas
                  </p>
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                <Link href="/workouts/generate">
                  <Plus className="w-4 h-4 mr-2" />
                  Generar Mi Primer Entrenamiento
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
