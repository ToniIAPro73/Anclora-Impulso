"use client"

import { useEffect, useState } from "react"
import { Cookie } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"

type CookiePreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
  version: "v1"
}

const STORAGE_KEY = "anclora-cookie-consent-v1"
const defaults: CookiePreferences = { necessary: true, analytics: false, marketing: false, updatedAt: "", version: "v1" }

export function CookieConsent() {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(false)
  const [preferences, setPreferences] = useState(defaults)
  const copy = language === "en"
    ? {
        title: "Cookie preferences",
        body: "This app uses necessary cookies for operation and can store optional analytics or marketing preferences if you allow them.",
        accept: "Accept all",
        settings: "Settings",
        reject: "Reject optional",
        manage: "Manage cookies",
        necessary: "Necessary cookies",
        necessaryBody: "Essential for security, session and app operation. They cannot be disabled.",
        analytics: "Analytics cookies",
        analyticsBody: "Help us understand product usage and improve the experience.",
        marketing: "Marketing cookies",
        marketingBody: "Reserved for relevant communications. They do not enable scripts that are not present.",
        save: "Save preferences",
        back: "Back",
      }
    : {
        title: "Preferencias de cookies",
        body: "Esta app utiliza cookies necesarias para operar y puede guardar preferencias opcionales de análisis o marketing si las autorizas.",
        accept: "Aceptar todas",
        settings: "Configuración",
        reject: "Rechazar opcionales",
        manage: "Gestionar cookies",
        necessary: "Cookies necesarias",
        necessaryBody: "Esenciales para seguridad, sesión y funcionamiento. No se pueden desactivar.",
        analytics: "Cookies de análisis",
        analyticsBody: "Ayudan a comprender el uso del producto y mejorar la experiencia.",
        marketing: "Cookies de marketing",
        marketingBody: "Reservadas para comunicaciones relevantes. No activan scripts inexistentes.",
        save: "Guardar preferencias",
        back: "Volver",
      }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CookiePreferences>
        setPreferences({ necessary: true, analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing), updatedAt: parsed.updatedAt ?? "", version: "v1" })
        return
      }
    } catch {}
    setOpen(true)
  }, [])

  useEffect(() => {
    const listener = () => { setOpen(true); setSettings(true) }
    window.addEventListener("anclora:open-cookie-preferences", listener)
    return () => window.removeEventListener("anclora:open-cookie-preferences", listener)
  }, [])

  function persist(next: CookiePreferences) {
    const value = { ...next, necessary: true as const, updatedAt: new Date().toISOString(), version: "v1" as const }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    setPreferences(value)
    setOpen(false)
    setSettings(false)
  }

  return (
    <>
      <button type="button" aria-label={copy.title} onClick={() => { setOpen(true); setSettings(true) }} className="fixed bottom-5 left-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-orange-400/40 bg-slate-950/90 text-orange-300 shadow-2xl backdrop-blur transition hover:-translate-y-0.5">
        <Cookie className="h-5 w-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-4 py-6 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="impulso-cookie-title">
          <div className="w-full max-w-lg rounded-3xl border border-orange-400/20 bg-slate-950 p-6 text-white shadow-2xl">
            {!settings ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">Anclora Group</p>
                  <h2 id="impulso-cookie-title" className="mt-2 text-2xl font-semibold">{copy.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{copy.body}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => persist({ ...defaults, analytics: true, marketing: true })} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">{copy.accept}</button>
                  <button type="button" onClick={() => setSettings(true)} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold">{copy.settings}</button>
                  <button type="button" onClick={() => persist(defaults)} className="rounded-full px-5 py-3 text-sm font-semibold text-slate-300">{copy.reject}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 id="impulso-cookie-title" className="text-2xl font-semibold">{copy.manage}</h2>
                <CookieRow title={copy.necessary} description={copy.necessaryBody} checked disabled onChange={() => {}} />
                <CookieRow title={copy.analytics} description={copy.analyticsBody} checked={preferences.analytics} onChange={(analytics) => setPreferences((current) => ({ ...current, analytics }))} />
                <CookieRow title={copy.marketing} description={copy.marketingBody} checked={preferences.marketing} onChange={(marketing) => setPreferences((current) => ({ ...current, marketing }))} />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button type="button" onClick={() => setSettings(false)} className="rounded-full px-5 py-3 text-sm font-semibold text-slate-300">{copy.back}</button>
                  <button type="button" onClick={() => persist(defaults)} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold">{copy.reject}</button>
                  <button type="button" onClick={() => persist(preferences)} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">{copy.save}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}

function CookieRow({ title, description, checked, disabled, onChange }: { title: string; description: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-orange-500" />
    </label>
  )
}
