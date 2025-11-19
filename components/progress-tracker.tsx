"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useProgress } from "@/hooks/use-progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Calendar, Trophy, Target, Plus, Scale, Ruler, Activity, Clock, Loader2 } from "lucide-react"

export function ProgressTracker() {
  const { progress, isLoading, error, addMeasurement } = useProgress()
  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
  })
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddMeasurement = async () => {
    setIsAddingMeasurement(true)

    try {
      await addMeasurement({
        weight: newMeasurement.weight ? parseFloat(newMeasurement.weight) : undefined,
        bodyFat: newMeasurement.bodyFat ? parseFloat(newMeasurement.bodyFat) : undefined,
        chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : undefined,
        waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : undefined,
        hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : undefined,
        arms: newMeasurement.arms ? parseFloat(newMeasurement.arms) : undefined,
        thighs: newMeasurement.thighs ? parseFloat(newMeasurement.thighs) : undefined,
      })

      // Reset form
      setNewMeasurement({
        weight: "",
        bodyFat: "",
        chest: "",
        waist: "",
        hips: "",
        arms: "",
        thighs: "",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding measurement:", error)
      alert("Error al agregar medida")
    } finally {
      setIsAddingMeasurement(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando progreso...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar progreso</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </CardContent>
      </Card>
    )
  }

  if (!progress) {
    return null
  }

  const { stats, measurements, charts } = progress

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Entrenamientos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWorkouts}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stats.workoutsThisWeek} esta semana
                </p>
              </div>
              <Trophy className="w-12 h-12 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.workoutsThisMonth}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">entrenamientos</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Tiempo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(stats.totalDuration / 60)}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ~{Math.round(stats.avgDuration / 60)}h promedio
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Récords Personales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.personalRecords.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">ejercicios</p>
              </div>
              <Target className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
          <TabsTrigger value="records">Récords</TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {/* Weight Chart */}
          {charts.weight.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Progreso de Peso
                </CardTitle>
                <CardDescription>Seguimiento de tu peso corporal en el tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={charts.weight}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Body Fat Chart */}
          {charts.bodyFat.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Porcentaje de Grasa Corporal
                </CardTitle>
                <CardDescription>Seguimiento de tu composición corporal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={charts.bodyFat}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bodyFat" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Workout Frequency Chart */}
          {charts.frequency.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Frecuencia de Entrenamientos
                </CardTitle>
                <CardDescription>Entrenamientos por semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={charts.frequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Medidas Corporales</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Registra tus medidas para seguir tu progreso
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Medida
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nueva Medida Corporal</DialogTitle>
                  <DialogDescription>Registra tus medidas actuales</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Peso (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.weight}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grasa Corporal (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.bodyFat}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFat: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pecho (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.chest}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cintura (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.waist}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Caderas (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.hips}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Brazos (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.arms}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, arms: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Muslos (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.thighs}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, thighs: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddMeasurement}
                    disabled={isAddingMeasurement}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500"
                  >
                    {isAddingMeasurement ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Medida"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {measurements.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="text-center py-12">
                  <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No hay medidas registradas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Comienza a registrar tus medidas para seguir tu progreso
                  </p>
                </CardContent>
              </Card>
            ) : (
              measurements.slice(0, 10).map((measurement) => (
                <Card key={measurement.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(measurement.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {measurement.weight && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Peso</p>
                          <p className="text-lg font-semibold">{measurement.weight} kg</p>
                        </div>
                      )}
                      {measurement.bodyFat && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Grasa</p>
                          <p className="text-lg font-semibold">{measurement.bodyFat}%</p>
                        </div>
                      )}
                      {measurement.chest && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pecho</p>
                          <p className="text-lg font-semibold">{measurement.chest} cm</p>
                        </div>
                      )}
                      {measurement.waist && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Cintura</p>
                          <p className="text-lg font-semibold">{measurement.waist} cm</p>
                        </div>
                      )}
                      {measurement.hips && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Caderas</p>
                          <p className="text-lg font-semibold">{measurement.hips} cm</p>
                        </div>
                      )}
                      {measurement.arms && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Brazos</p>
                          <p className="text-lg font-semibold">{measurement.arms} cm</p>
                        </div>
                      )}
                      {measurement.thighs && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Muslos</p>
                          <p className="text-lg font-semibold">{measurement.thighs} cm</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Récords Personales
              </CardTitle>
              <CardDescription>Tus mejores marcas en cada ejercicio</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.personalRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No hay récords registrados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completa entrenamientos para establecer tus récords personales
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.personalRecords.map((record) => (
                    <div
                      key={record.exercise_id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{record.exercise_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500">
                        {record.max_weight} kg
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
