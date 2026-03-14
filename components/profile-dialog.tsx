"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import Link from "next/link"
import { Calculator, Camera, Target, UserRound, Weight, Ruler, CalendarClock, Sparkles } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/lib/contexts/auth-context"
import { buildRecommendedPlan, calculateBmi, interpretBmi } from "@/lib/user-profile"

interface ProfileDialogProps {
  children: ReactNode
}

function toNumber(value: string) {
  if (!value.trim()) {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function ProfileDialog({ children }: ProfileDialogProps) {
  const { user, profile, updateProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    age: profile.age?.toString() ?? "",
    heightCm: profile.heightCm?.toString() ?? "",
    weightKg: profile.weightKg?.toString() ?? "",
    targetWeightKg: profile.targetWeightKg?.toString() ?? "",
    timeframeWeeks: profile.timeframeWeeks?.toString() ?? "",
    trainingDaysPerWeek: profile.trainingDaysPerWeek?.toString() ?? "",
    avatarDataUrl: profile.avatarDataUrl ?? "",
  })

  useEffect(() => {
    if (open) {
      setForm({
        age: profile.age?.toString() ?? "",
        heightCm: profile.heightCm?.toString() ?? "",
        weightKg: profile.weightKg?.toString() ?? "",
        targetWeightKg: profile.targetWeightKg?.toString() ?? "",
        timeframeWeeks: profile.timeframeWeeks?.toString() ?? "",
        trainingDaysPerWeek: profile.trainingDaysPerWeek?.toString() ?? "",
        avatarDataUrl: profile.avatarDataUrl ?? "",
      })
    }
  }, [open, profile])

  const bmi = useMemo(() => calculateBmi(toNumber(form.heightCm), toNumber(form.weightKg)), [form.heightCm, form.weightKg])
  const bmiInterpretation = interpretBmi(bmi)
  const recommendedPlan = useMemo(
    () =>
      buildRecommendedPlan({
        age: toNumber(form.age),
        heightCm: toNumber(form.heightCm),
        weightKg: toNumber(form.weightKg),
        targetWeightKg: toNumber(form.targetWeightKg),
        timeframeWeeks: toNumber(form.timeframeWeeks),
        trainingDaysPerWeek: toNumber(form.trainingDaysPerWeek),
        avatarDataUrl: form.avatarDataUrl || null,
      }),
    [form],
  )

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

    setForm((current) => ({ ...current, avatarDataUrl: dataUrl }))
  }

  const handleSave = () => {
    updateProfile({
      age: toNumber(form.age),
      heightCm: toNumber(form.heightCm),
      weightKg: toNumber(form.weightKg),
      targetWeightKg: toNumber(form.targetWeightKg),
      timeframeWeeks: toNumber(form.timeframeWeeks),
      trainingDaysPerWeek: toNumber(form.trainingDaysPerWeek),
      avatarDataUrl: form.avatarDataUrl || null,
      recommendedPlan,
    })
    setOpen(false)
  }

  const primaryMetrics = [
    { id: "profile-age", label: "Edad", value: form.age, inputMode: "numeric" as const, onChange: (value: string) => setForm((current) => ({ ...current, age: value })) },
    { id: "profile-height", label: "Altura", suffix: "cm", value: form.heightCm, inputMode: "decimal" as const, onChange: (value: string) => setForm((current) => ({ ...current, heightCm: value })) },
    { id: "profile-weight", label: "Peso actual", suffix: "kg", value: form.weightKg, inputMode: "decimal" as const, onChange: (value: string) => setForm((current) => ({ ...current, weightKg: value })) },
  ]

  const objectiveMetrics = [
    { id: "profile-target-weight", label: "Peso objetivo", suffix: "kg", value: form.targetWeightKg, inputMode: "decimal" as const, onChange: (value: string) => setForm((current) => ({ ...current, targetWeightKg: value })) },
    { id: "profile-timeframe", label: "Plazo", suffix: "semanas", value: form.timeframeWeeks, inputMode: "numeric" as const, onChange: (value: string) => setForm((current) => ({ ...current, timeframeWeeks: value })) },
    { id: "profile-days", label: "Entrenos", suffix: "dias/sem", value: form.trainingDaysPerWeek, inputMode: "numeric" as const, onChange: (value: string) => setForm((current) => ({ ...current, trainingDaysPerWeek: value })) },
  ]

  const weeklyPreview = recommendedPlan?.weeklySplit.slice(0, 4) ?? []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-[calc(100vh-2rem)] w-[calc(100vw-3rem)] max-h-[900px] max-w-[1440px] overflow-hidden rounded-[40px] border border-orange-200/60 bg-[linear-gradient(180deg,rgba(255,251,245,0.98),rgba(255,255,255,0.96))] p-0 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-orange-400/10 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))]">
        <div className="grid h-full grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex h-full flex-col border-r border-orange-100/80 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.22),_transparent_48%),linear-gradient(180deg,_rgba(255,247,237,0.92),_rgba(255,237,213,0.56))] px-8 py-9 dark:border-orange-400/10 dark:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.12),_transparent_45%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(15,23,42,0.88))]">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-3 text-[2rem] font-semibold tracking-tight text-slate-900 dark:text-white">
                <UserRound className="h-6 w-6 text-orange-500" />
                Perfil
              </DialogTitle>
              <DialogDescription className="max-w-[26ch] text-sm leading-6 text-slate-600 dark:text-slate-400">
                Ajusta tus datos, calcula tu IMC y define tu objetivo para obtener una propuesta inicial de entrenamiento.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 flex flex-1 flex-col gap-5">
              <div className="rounded-[32px] border border-white/60 bg-white/72 p-6 shadow-[0_16px_40px_rgba(251,146,60,0.12)] dark:border-white/5 dark:bg-slate-950/45">
                <div className="flex items-center gap-4">
                  <UserAvatar className="size-20 ring-4 ring-white/70 dark:ring-slate-900/70" fallbackClassName="text-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">{user?.fullName || "Usuario"}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <Label
                  htmlFor="avatar-upload"
                  className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 text-sm font-semibold text-white transition hover:from-orange-600 hover:to-rose-600"
                >
                  <Camera className="h-4 w-4" />
                  Cambiar avatar
                </Label>
                <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div className="grid gap-5">
                <div className="rounded-[30px] border border-white/60 bg-white/70 p-6 shadow-sm dark:border-white/5 dark:bg-slate-950/45">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <Calculator className="h-4 w-4 text-orange-500" />
                    IMC
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{bmi ?? "--"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Indice estimado</p>
                    </div>
                    {bmiInterpretation ? (
                      <Badge className="rounded-full border-0 bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                        {bmiInterpretation}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/60 bg-[linear-gradient(160deg,rgba(15,23,42,0.94),rgba(30,41,59,0.88))] p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)] dark:border-white/5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">
                    <Sparkles className="h-4 w-4 text-orange-400" />
                    Enfoque
                  </div>
                  {recommendedPlan ? (
                    <>
                      <p className="text-lg font-semibold">{recommendedPlan.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{recommendedPlan.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge className="rounded-full border-0 bg-white/10 px-3 py-1 text-white">{recommendedPlan.duration} min</Badge>
                        <Badge className="rounded-full border-0 bg-white/10 px-3 py-1 text-white">{recommendedPlan.difficulty}</Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm leading-6 text-slate-300">
                      Completa tus metricas para desbloquear una propuesta inicial coherente con tu objetivo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.94))] px-8 py-9 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.3),rgba(15,23,42,0.12))]">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_420px]">
              <section className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Datos base</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Lo esencial para personalizar tu punto de partida.</p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    Perfil inicial
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {primaryMetrics.map((field) => (
                    <div key={field.id} className="rounded-[26px] border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800/80 dark:bg-slate-900/75">
                      <Label htmlFor={field.id} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {field.label}
                      </Label>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <Input
                          id={field.id}
                          inputMode={field.inputMode}
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value)}
                          className="h-12 border-0 bg-transparent px-0 text-[2rem] font-semibold tracking-tight text-slate-900 shadow-none focus-visible:ring-0 dark:text-white"
                        />
                        {field.suffix ? <span className="pb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{field.suffix}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-orange-200/60 bg-[linear-gradient(180deg,rgba(255,247,237,0.92),rgba(255,237,213,0.68))] p-6 shadow-sm dark:border-orange-400/10 dark:bg-[linear-gradient(180deg,rgba(124,45,18,0.18),rgba(15,23,42,0.58))]">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-orange-100">
                  <Target className="h-4 w-4 text-orange-500" />
                  Objetivo
                </div>
                <div className="grid gap-4">
                  {objectiveMetrics.map((field) => (
                    <div key={field.id} className="rounded-[26px] border border-white/70 bg-white/70 p-4 dark:border-white/5 dark:bg-slate-950/35">
                      <Label htmlFor={field.id} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {field.label}
                      </Label>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <Input
                          id={field.id}
                          inputMode={field.inputMode}
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value)}
                          className="h-12 border-0 bg-transparent px-0 text-[1.75rem] font-semibold tracking-tight text-slate-900 shadow-none focus-visible:ring-0 dark:text-white"
                        />
                        {field.suffix ? <span className="pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{field.suffix}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-5 grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <CalendarClock className="h-4 w-4 text-orange-500" />
                  Plan sugerido
                </div>
                {recommendedPlan ? (
                  <div className="grid h-full gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="min-w-0">
                      <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{recommendedPlan.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{recommendedPlan.summary}</p>
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {weeklyPreview.map((day) => (
                          <div key={day} className="rounded-[22px] border border-slate-200/80 bg-slate-50/85 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/75 dark:text-slate-300">
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid content-start gap-3">
                      <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/85 p-5 dark:border-slate-800/80 dark:bg-slate-900/75">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Parametros</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          <p className="flex items-center gap-2"><Weight className="h-4 w-4 text-orange-500" /> {recommendedPlan.duration} min por sesion</p>
                          <p className="flex items-center gap-2"><Ruler className="h-4 w-4 text-orange-500" /> Dificultad {recommendedPlan.difficulty}</p>
                          <p className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /> Tipo {recommendedPlan.workoutType}</p>
                        </div>
                      </div>
                      <Button asChild className="h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                        <Link href="/workouts/generate">Usar esta propuesta</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center rounded-[24px] border border-dashed border-orange-200/80 bg-orange-50/55 p-5 text-sm leading-7 text-slate-600 dark:border-orange-400/10 dark:bg-orange-500/5 dark:text-slate-400">
                    Completa peso actual, peso objetivo, plazo y dias de entreno para generar una propuesta automatica.
                  </div>
                )}
              </div>

              <div className="grid gap-5">
                <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Lectura rapida</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-slate-50/85 p-4 dark:bg-slate-900/75">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Meta de peso</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {form.targetWeightKg || "--"} <span className="text-sm font-medium text-slate-400">kg</span>
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50/85 p-4 dark:bg-slate-900/75">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Frecuencia</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {form.trainingDaysPerWeek || "--"} <span className="text-sm font-medium text-slate-400">dias/sem</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-[32px] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(241,245,249,0.9))] p-6 shadow-sm dark:border-slate-800/80 dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.88),rgba(30,41,59,0.7))]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Estado del perfil</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Mantiene a mano las metricas clave para ajustar recomendaciones y progresion.
                    </p>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Button variant="outline" className="h-11 flex-1 rounded-2xl" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="h-11 flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600" onClick={handleSave}>
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
