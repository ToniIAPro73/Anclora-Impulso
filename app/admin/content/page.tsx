"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, BarChart3, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react"

import { ProtectedDashboardPage } from "@/components/protected-dashboard-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useEditorialExercises } from "@/hooks/use-editorial-content"
import { useAuth } from "@/lib/contexts/auth-context"

function AdminContentInner() {
  const { user } = useAuth()
  const { summary, isLoading, error, updateExercise, isUpdating, eventsSummary } = useEditorialExercises()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const selectedExercise = useMemo(
    () => summary?.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? summary?.exercises[0] ?? null,
    [selectedExerciseId, summary],
  )
  const [form, setForm] = useState({
    description: "",
    instructions: "",
  })

  useEffect(() => {
    if (!selectedExercise) return
    setForm({
      description: selectedExercise.description,
      instructions: selectedExercise.instructions.join("\n"),
    })
  }, [selectedExercise])

  if (!user?.isAdmin) {
    return (
      <div className="px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <ShieldCheck className="h-12 w-12 text-orange-500" />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Admin Content</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Acceso restringido. Configura tu email en `ADMIN_EMAILS` para usar esta superficie.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSelectExercise = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId)
  }

  const handleSave = async () => {
    if (!selectedExercise) return
    await updateExercise({
      id: selectedExercise.id,
      data: {
        description: form.description,
        instructions: form.instructions
          .split("\n")
          .map((instruction) => instruction.trim())
          .filter(Boolean),
      },
    })
  }

  return (
    <div className="space-y-6 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Content</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Panel interno para revisar calidad editorial de ejercicios y señales de adopción.
        </p>
      </div>

      {isLoading ? (
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            Cargando panel editorial...
          </CardContent>
        </Card>
      ) : error || !summary ? (
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="py-12 text-center text-red-500">
            {error ?? "No se pudo cargar el panel editorial."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <Card className="border-0 bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-orange-400" />
                  Catálogo editorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{summary.total}</p>
                <p className="mt-1 text-sm text-slate-300">ejercicios auditables</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Calidad media</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{summary.averageQualityScore}%</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Listos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-emerald-600">{summary.byStatus.ready}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Necesitan trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-orange-600">{summary.byStatus.needs_work}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  Cola editorial de ejercicios
                </CardTitle>
                <CardDescription>
                  Revisa calidad, detecta huecos y corrige directamente las piezas más débiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelectExercise(exercise.id)}
                    className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition ${
                      selectedExercise?.id === exercise.id
                        ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-500/10"
                        : "border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">{exercise.name}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {exercise.category} · {exercise.muscleGroup} · {exercise.equipment}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {exercise.editorial?.qualityScore ?? 0}%
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full border-0 bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        {exercise.editorial?.editorialStatus ?? "review"}
                      </Badge>
                      {!exercise.editorial?.checks.hasImage ? (
                        <Badge variant="destructive" className="rounded-full">
                          Sin imagen
                        </Badge>
                      ) : null}
                      {!exercise.editorial?.checks.hasEnoughInstructions ? (
                        <Badge variant="destructive" className="rounded-full">
                          Instrucciones pobres
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader>
                  <CardTitle>Editor rápido</CardTitle>
                  <CardDescription>
                    Ajusta descripción e instrucciones del ejercicio seleccionado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExercise ? (
                    <>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedExercise.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Score actual: {selectedExercise.editorial?.qualityScore ?? 0}% · {selectedExercise.editorial?.editorialStatus ?? "review"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28" />
                      </div>
                      <div className="space-y-2">
                        <Label>Instrucciones (una por línea)</Label>
                        <Textarea value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} className="min-h-40" />
                      </div>
                      <Button disabled={isUpdating} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={handleSave}>
                        Guardar cambios editoriales
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona un ejercicio para editarlo.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    Eventos de producto
                  </CardTitle>
                  <CardDescription>
                    Señales activas para medir adopción y uso reciente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl bg-slate-50/90 p-4 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Últimos 28 días</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{eventsSummary?.totalLast28Days ?? 0}</p>
                  </div>
                  <div className="space-y-2">
                    {(eventsSummary?.topActions ?? []).slice(0, 5).map((event) => (
                      <div key={`${event.category}-${event.action}`} className="flex items-center justify-between rounded-2xl bg-slate-50/90 px-4 py-3 dark:bg-slate-900/50">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{event.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{event.category}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full px-3 py-1">{event.count}</Badge>
                      </div>
                    ))}
                  </div>
                  {!(eventsSummary?.topActions?.length) ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p className="text-sm">Aún no hay suficientes eventos para analizar adopción.</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminContentPage() {
  return (
    <ProtectedDashboardPage>
      <AdminContentInner />
    </ProtectedDashboardPage>
  )
}
