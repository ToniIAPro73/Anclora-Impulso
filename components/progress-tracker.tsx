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
import { db, type BodyMeasurement } from "@/lib/storage/db"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Calendar, Trophy, Target, Plus, Scale, Ruler, Activity, Clock } from "lucide-react"

interface ProgressTrackerProps {
  user: any
  profile: any
  measurements: any[]
  personalRecords: any[]
  workoutSessions: any[]
}

export function ProgressTracker({
  user,
  profile,
  measurements,
  personalRecords,
  workoutSessions,
}: ProgressTrackerProps) {
  const [newMeasurement, setNewMeasurement] = useState({
    weight_kg: "",
    body_fat_percentage: "",
    chest_cm: "",
    waist_cm: "",
    bicep_cm: "",
    thigh_cm: "",
    notes: "",
  })
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false)

  const addMeasurement = async () => {
    setIsAddingMeasurement(true)

    try {
      const measurementData: BodyMeasurement = {
        id: crypto.randomUUID(),
        userId: user.id,
        date: new Date().toISOString(),
        weight: newMeasurement.weight_kg ? Number.parseFloat(newMeasurement.weight_kg) : undefined,
        bodyFat: newMeasurement.body_fat_percentage ? Number.parseFloat(newMeasurement.body_fat_percentage) : undefined,
        chest: newMeasurement.chest_cm ? Number.parseFloat(newMeasurement.chest_cm) : undefined,
        waist: newMeasurement.waist_cm ? Number.parseFloat(newMeasurement.waist_cm) : undefined,
        arms: newMeasurement.bicep_cm ? Number.parseFloat(newMeasurement.bicep_cm) : undefined,
        thighs: newMeasurement.thigh_cm ? Number.parseFloat(newMeasurement.thigh_cm) : undefined,
      }

      await db.add("measurements", measurementData)

      // Reset form and refresh page
      setNewMeasurement({
        weight_kg: "",
        body_fat_percentage: "",
        chest_cm: "",
        waist_cm: "",
        bicep_cm: "",
        thigh_cm: "",
        notes: "",
      })
      window.location.reload()
    } catch (error) {
      console.error("Error adding measurement:", error)
    } finally {
      setIsAddingMeasurement(false)
    }
  }

  // Prepare chart data
  const weightData = measurements
    .filter((m: any) => m.weight)
    .slice(0, 10)
    .reverse()
    .map((m: any) => ({
      date: new Date(m.date).toLocaleDateString(),
      weight: m.weight,
    }))

  // Calculate workout stats
  const totalWorkouts = workoutSessions.length
  const totalMinutes = workoutSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0

  const workoutsByMonth = workoutSessions.reduce(
    (acc, session) => {
      const month = new Date(session.started_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyData = Object.entries(workoutsByMonth)
    .slice(0, 6)
    .map(([month, count]) => ({ month, workouts: count }))

  // Get recent achievements
  const recentRecords = personalRecords.slice(0, 5)

  // Calculate progress indicators
  const getProgressIndicator = (current: number, previous: number) => {
    if (!previous) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0,
    }
  }

  const latestWeight = measurements.find((m: any) => m.weight)?.weight
  const previousWeight = measurements.find((m: any, i: number) => i > 0 && m.weight)?.weight
  const weightProgress = latestWeight && previousWeight ? getProgressIndicator(latestWeight, previousWeight) : null

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-500" />
              Total Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkouts}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed sessions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-green-500" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(totalMinutes / 60)}h</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Training time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-orange-500" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgDuration}min</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Per workout</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{personalRecords.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="measurements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="measurements">Body Measurements</TabsTrigger>
          <TabsTrigger value="records">Personal Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Body Measurements</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Measurement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Body Measurement</DialogTitle>
                  <DialogDescription>Record your current body measurements to track progress</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={newMeasurement.weight_kg}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, weight_kg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyfat">Body Fat (%)</Label>
                    <Input
                      id="bodyfat"
                      type="number"
                      step="0.1"
                      value={newMeasurement.body_fat_percentage}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, body_fat_percentage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chest">Chest (cm)</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={newMeasurement.chest_cm}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, chest_cm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={newMeasurement.waist_cm}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, waist_cm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bicep">Bicep (cm)</Label>
                    <Input
                      id="bicep"
                      type="number"
                      step="0.1"
                      value={newMeasurement.bicep_cm}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, bicep_cm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thigh">Thigh (cm)</Label>
                    <Input
                      id="thigh"
                      type="number"
                      step="0.1"
                      value={newMeasurement.thigh_cm}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, thigh_cm: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={newMeasurement.notes}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                    placeholder="Any additional notes..."
                  />
                </div>
                <Button onClick={addMeasurement} disabled={isAddingMeasurement} className="w-full">
                  {isAddingMeasurement ? "Adding..." : "Add Measurement"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Chart */}
            {weightData.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Weight Progress
                    {weightProgress && (
                      <Badge
                        className={
                          weightProgress.isPositive
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        }
                      >
                        {weightProgress.isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {weightProgress.value}%
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightData}>
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

            {/* Recent Measurements */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Recent Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {measurements.length > 0 ? (
                  <div className="space-y-3">
                    {measurements.slice(0, 5).map((measurement: any) => (
                      <div
                        key={measurement.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(measurement.date).toLocaleDateString()}
                          </p>
                          <div className="flex gap-4 text-sm">
                            {measurement.weight && <span>Weight: {measurement.weight}kg</span>}
                            {measurement.bodyFat && <span>BF: {measurement.bodyFat}%</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No measurements recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Personal Records
              </CardTitle>
              <CardDescription>Your best achievements across all exercises</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRecords.length > 0 ? (
                <div className="space-y-3">
                  {recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{record.exercises?.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.achieved_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            {record.record_type.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {record.value} {record.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No personal records yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Complete workouts to start setting records!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Workout Frequency
              </CardTitle>
              <CardDescription>Your workout consistency over the past months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="workouts" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No workout data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
