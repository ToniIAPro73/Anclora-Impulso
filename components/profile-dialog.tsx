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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl overflow-y-auto rounded-[30px] border-orange-200/70 bg-white/95 p-0 backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/96">
        <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-orange-100/80 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.25),_transparent_40%),linear-gradient(160deg,_rgba(255,247,237,1),_rgba(255,237,213,0.7))] p-6 dark:border-orange-400/10 dark:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.14),_transparent_40%),linear-gradient(160deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.92))] lg:border-b-0 lg:border-r">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2 text-2xl text-slate-900 dark:text-white">
                <UserRound className="h-6 w-6 text-orange-500" />
                Perfil
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                Ajusta tus datos, calcula tu IMC y define tu objetivo para obtener una propuesta inicial de entrenamiento.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4 rounded-[28px] border border-orange-200/70 bg-white/70 p-4 shadow-sm dark:border-orange-400/10 dark:bg-slate-900/50">
                <UserAvatar className="size-20" fallbackClassName="text-2xl" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">{user?.fullName || "Usuario"}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <Label
                    htmlFor="avatar-upload"
                    className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Cambiar avatar
                  </Label>
                  <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>

              <div className="rounded-[28px] border border-orange-200/70 bg-white/70 p-4 shadow-sm dark:border-orange-400/10 dark:bg-slate-900/50">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Calculator className="h-4 w-4 text-orange-500" />
                  Indice de masa corporal
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{bmi ?? "--"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">IMC estimado</p>
                  </div>
                  {bmiInterpretation ? <Badge className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">{bmiInterpretation}</Badge> : null}
                </div>
              </div>

              {recommendedPlan ? (
                <div className="rounded-[28px] border border-emerald-200/70 bg-white/70 p-4 shadow-sm dark:border-emerald-500/15 dark:bg-slate-900/50">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    Propuesta automática
                  </div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{recommendedPlan.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{recommendedPlan.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">{recommendedPlan.duration} min</Badge>
                    <Badge variant="outline">{recommendedPlan.difficulty}</Badge>
                    <Badge variant="outline">{recommendedPlan.workoutType}</Badge>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              <section className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="profile-age">Edad</Label>
                  <Input id="profile-age" inputMode="numeric" value={form.age} onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-height">Altura (cm)</Label>
                  <Input id="profile-height" inputMode="decimal" value={form.heightCm} onChange={(event) => setForm((current) => ({ ...current, heightCm: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-weight">Peso actual (kg)</Label>
                  <Input id="profile-weight" inputMode="decimal" value={form.weightKg} onChange={(event) => setForm((current) => ({ ...current, weightKg: event.target.value }))} />
                </div>
              </section>

              <section className="rounded-[28px] border border-orange-100/80 bg-orange-50/60 p-5 dark:border-orange-400/10 dark:bg-orange-500/5">
                <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                  <Target className="h-5 w-5 text-orange-500" />
                  Objetivo
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-target-weight">Peso objetivo (kg)</Label>
                    <Input id="profile-target-weight" inputMode="decimal" value={form.targetWeightKg} onChange={(event) => setForm((current) => ({ ...current, targetWeightKg: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-timeframe">Plazo (semanas)</Label>
                    <Input id="profile-timeframe" inputMode="numeric" value={form.timeframeWeeks} onChange={(event) => setForm((current) => ({ ...current, timeframeWeeks: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-days">Dias de entrenamiento semanal</Label>
                    <Input id="profile-days" inputMode="numeric" value={form.trainingDaysPerWeek} onChange={(event) => setForm((current) => ({ ...current, trainingDaysPerWeek: event.target.value }))} />
                  </div>
                </div>
              </section>

              {recommendedPlan ? (
                <section className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-700/60 dark:bg-slate-900/50">
                  <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                    <CalendarClock className="h-5 w-5 text-orange-500" />
                    Plan sugerido
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{recommendedPlan.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{recommendedPlan.summary}</p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {recommendedPlan.weeklySplit.map((day) => (
                          <li key={day} className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950/70">
                            {day}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-slate-950/70">
                        <p className="font-semibold text-slate-900 dark:text-white">Parametros</p>
                        <div className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
                          <p className="flex items-center gap-2"><Weight className="h-4 w-4 text-orange-500" /> {recommendedPlan.duration} min por sesion</p>
                          <p className="flex items-center gap-2"><Ruler className="h-4 w-4 text-orange-500" /> Dificultad {recommendedPlan.difficulty}</p>
                          <p className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /> Tipo {recommendedPlan.workoutType}</p>
                        </div>
                      </div>
                      <Button asChild className="h-11 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                        <Link href="/workouts/generate">Usar esta propuesta</Link>
                      </Button>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="rounded-[28px] border border-dashed border-orange-200/80 bg-orange-50/40 p-5 text-sm text-slate-600 dark:border-orange-400/10 dark:bg-orange-500/5 dark:text-slate-400">
                  Completa peso actual, peso objetivo, plazo y dias de entreno para generar una propuesta automática.
                </section>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-2xl" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600" onClick={handleSave}>
                  Guardar perfil
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
