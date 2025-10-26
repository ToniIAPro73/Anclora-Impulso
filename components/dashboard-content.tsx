"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Dumbbell, TrendingUp, Calendar, Play, Plus, Trophy, Target, Clock, Activity } from "lucide-react"

interface DashboardContentProps {
  user: any
  profile: any
  recentSessions: any[]
  recentRecords?: any[]
}

export function DashboardContent({ user, profile, recentSessions, recentRecords = [] }: DashboardContentProps) {
  // Calculate stats
  const totalWorkouts = recentSessions.length
  const totalMinutes = recentSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {profile?.full_name || user.email?.split("@")[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Ready to crush your fitness goals today?</p>
      </div>

      {/* Quick Stats */}
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{recentRecords.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-purple-500" />
              Fitness Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {profile?.fitness_level || "Not set"}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current level</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start Workout
            </CardTitle>
            <CardDescription className="text-orange-100">Begin your training session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/workouts/generate">Generate Workout</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Exercise Library
            </CardTitle>
            <CardDescription>Browse exercise database</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/exercises">View Exercises</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress
            </CardTitle>
            <CardDescription>Track your improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/progress">View Progress</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{session.workout_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.duration_minutes || 0}min
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {session.completed_at ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href="/workouts/history">View All Workouts</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No workouts yet</p>
                <Button asChild>
                  <Link href="/workouts/generate">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Workout
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{record.exercises?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(record.achieved_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {record.value} {record.unit}
                      </p>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs">
                        {record.record_type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href="/progress">View All Records</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No achievements yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Complete workouts to start setting records!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
